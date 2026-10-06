import os
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

import cv2
import numpy as np

from backend.config.settings import settings


@dataclass
class BoundingBox:
    x: int
    y: int
    width: int
    height: int
    landmarks: List[Tuple[int, int]] = field(default_factory=list)


@dataclass
class FaceDetectionResult:
    faces: List[BoundingBox]
    error: Optional[str] = None


_detector = None
_model_load_attempted = False

_INPUT_SIZE = 640
_STRIDES = (8, 16, 32)
_SCORE_THRESHOLD = 0.5
_NMS_THRESHOLD = 0.4


def _get_detector():
    global _detector, _model_load_attempted

    if not _model_load_attempted:
        _model_load_attempted = True
        model_path = settings.FACE_DETECTION_MODEL_PATH
        if os.path.isfile(model_path):
            try:
                _detector = cv2.dnn.readNetFromONNX(model_path)
            except Exception:
                _detector = None

    return _detector


def _group_scrfd_outputs(net, outputs):
    names = list(net.getUnconnectedOutLayersNames())
    named = {name.lower(): output for name, output in zip(names, outputs)}

    grouped = []
    for stride in _STRIDES:
        score = next(
            (
                value
                for name, value in named.items()
                if str(stride) in name and ("score" in name or "cls" in name)
            ),
            None,
        )
        bbox = next(
            (
                value
                for name, value in named.items()
                if str(stride) in name and ("bbox" in name or "box" in name)
            ),
            None,
        )
        kps = next(
            (
                value
                for name, value in named.items()
                if str(stride) in name
                and ("kps" in name or "landmark" in name or "keypoint" in name)
            ),
            None,
        )
        grouped.append((stride, score, bbox, kps))

    if all(score is not None and bbox is not None for _, score, bbox, _ in grouped):
        return grouped

    # InsightFace SCRFD exports commonly expose scores for strides 8/16/32,
    # followed by bbox outputs and then optional 5-point landmark outputs.
    if len(outputs) in (6, 9):
        scores = outputs[0:3]
        boxes = outputs[3:6]
        keypoints = outputs[6:9] if len(outputs) == 9 else [None, None, None]
        return list(zip(_STRIDES, scores, boxes, keypoints))

    raise ValueError("unsupported_scrfd_output_layout")


def _scores_array(raw) -> np.ndarray:
    array = np.asarray(raw)

    if array.ndim >= 2 and array.shape[-1] == 2:
        return array.reshape(-1, 2)[:, 1].astype(np.float32)

    return array.reshape(-1).astype(np.float32)


def _decode_scrfd(net, outputs, image_width: int, image_height: int):
    boxes: List[List[int]] = []
    scores: List[float] = []
    landmarks_by_box: List[List[Tuple[int, int]]] = []

    scale_x = image_width / float(_INPUT_SIZE)
    scale_y = image_height / float(_INPUT_SIZE)

    for stride, raw_scores, raw_boxes, raw_kps in _group_scrfd_outputs(net, outputs):
        score_values = _scores_array(raw_scores)
        feature_h = _INPUT_SIZE // stride
        feature_w = _INPUT_SIZE // stride
        cells = feature_h * feature_w

        if score_values.size % cells != 0:
            raise ValueError("invalid_scrfd_score_shape")

        anchors_per_cell = score_values.size // cells
        if anchors_per_cell not in (1, 2):
            raise ValueError("unsupported_scrfd_anchor_count")

        bbox_values = np.asarray(raw_boxes, dtype=np.float32).reshape(-1, 4)
        if bbox_values.shape[0] != score_values.size:
            raise ValueError("invalid_scrfd_bbox_shape")

        kps_values = None
        if raw_kps is not None:
            candidate_kps = np.asarray(raw_kps, dtype=np.float32).reshape(-1, 10)
            if candidate_kps.shape[0] == score_values.size:
                kps_values = candidate_kps

        grid_y, grid_x = np.mgrid[0:feature_h, 0:feature_w]
        centers = np.stack((grid_x, grid_y), axis=-1).reshape(-1, 2)
        centers = centers.astype(np.float32) * float(stride)
        if anchors_per_cell > 1:
            centers = np.repeat(centers, anchors_per_cell, axis=0)

        selected = np.where(score_values >= _SCORE_THRESHOLD)[0]

        for index in selected:
            center_x, center_y = centers[index]
            left, top, right, bottom = bbox_values[index] * float(stride)

            x1 = max(0.0, (center_x - left) * scale_x)
            y1 = max(0.0, (center_y - top) * scale_y)
            x2 = min(float(image_width), (center_x + right) * scale_x)
            y2 = min(float(image_height), (center_y + bottom) * scale_y)

            width = max(0, int(round(x2 - x1)))
            height = max(0, int(round(y2 - y1)))
            if width < 2 or height < 2:
                continue

            boxes.append([int(round(x1)), int(round(y1)), width, height])
            scores.append(float(score_values[index]))

            points: List[Tuple[int, int]] = []
            if kps_values is not None:
                offsets = kps_values[index].reshape(5, 2) * float(stride)
                decoded = offsets + centers[index]
                for point_x, point_y in decoded:
                    points.append(
                        (
                            int(round(np.clip(point_x * scale_x, 0, image_width - 1))),
                            int(round(np.clip(point_y * scale_y, 0, image_height - 1))),
                        )
                    )
            landmarks_by_box.append(points)

    if not boxes:
        return []

    kept = cv2.dnn.NMSBoxes(
        boxes,
        scores,
        _SCORE_THRESHOLD,
        _NMS_THRESHOLD,
    )

    if kept is None or len(kept) == 0:
        return []

    faces: List[BoundingBox] = []
    for raw_index in np.asarray(kept).reshape(-1):
        index = int(raw_index)
        x, y, width, height = boxes[index]
        faces.append(
            BoundingBox(
                x=x,
                y=y,
                width=width,
                height=height,
                landmarks=landmarks_by_box[index],
            )
        )

    return faces


def detect_faces(image: np.ndarray) -> FaceDetectionResult:
    """Detect faces using an InsightFace-style SCRFD ONNX model.

    The implementation supports the common 6-output (scores + boxes) and
    9-output (scores + boxes + five landmarks) SCRFD export layouts. It fails
    closed when the model is absent, cannot be loaded, or has an unsupported
    output layout.
    """
    if image is None or image.size == 0:
        return FaceDetectionResult(faces=[], error="invalid_image")

    detector = _get_detector()
    if detector is None:
        return FaceDetectionResult(faces=[], error="model_not_available")

    image_height, image_width = image.shape[:2]
    blob = cv2.dnn.blobFromImage(
        image,
        1.0 / 128.0,
        (_INPUT_SIZE, _INPUT_SIZE),
        (127.5, 127.5, 127.5),
        swapRB=True,
    )

    try:
        detector.setInput(blob)
        outputs = detector.forward(detector.getUnconnectedOutLayersNames())
        faces = _decode_scrfd(detector, outputs, image_width, image_height)
        return FaceDetectionResult(faces=faces)
    except Exception:
        return FaceDetectionResult(faces=[], error="model_execution_failed")
