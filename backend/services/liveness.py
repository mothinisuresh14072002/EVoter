import os
from dataclasses import dataclass
from typing import Literal, Optional

import cv2
import numpy as np

from backend.config.settings import settings
from backend.services.face_detection import BoundingBox


@dataclass
class LivenessResult:
    status: Literal["live", "spoof", "uncertain", "model_not_available"]
    score: float
    method: str
    error: Optional[str] = None

    @property
    def is_live(self) -> bool:
        return self.status == "live"


_liveness_net = None
_model_load_attempted = False


def _get_liveness_net():
    global _liveness_net, _model_load_attempted

    if not _model_load_attempted:
        _model_load_attempted = True
        model_path = settings.LIVENESS_MODEL_PATH
        if os.path.isfile(model_path):
            try:
                _liveness_net = cv2.dnn.readNetFromONNX(model_path)
            except Exception:
                _liveness_net = None

    return _liveness_net


def _softmax(values: np.ndarray) -> np.ndarray:
    flattened = np.asarray(values, dtype=np.float32).reshape(-1)
    shifted = flattened - np.max(flattened)
    exp_values = np.exp(shifted)
    denominator = float(np.sum(exp_values))

    if denominator <= 0 or not np.isfinite(denominator):
        raise ValueError("invalid_liveness_output")

    return exp_values / denominator


def check_liveness(
    image: np.ndarray,
    face_box: Optional[BoundingBox] = None,
) -> LivenessResult:
    """Evaluate a configured Silent-Face/MiniFAS-style ONNX classifier.

    The real-class index and decision thresholds are runtime configuration because
    model exports differ. A deployment must validate these values against its exact
    licensed model and camera environment before relying on the result.
    """
    if image is None or image.size == 0:
        return LivenessResult(
            status="uncertain",
            score=0.0,
            method="fas_net",
            error="invalid_image",
        )

    net = _get_liveness_net()
    if net is None:
        return LivenessResult(
            status="model_not_available",
            score=0.0,
            method="fas_net",
            error="model_not_available",
        )

    if face_box is None:
        return LivenessResult(
            status="uncertain",
            score=0.0,
            method="fas_net",
            error="no_face_box_provided",
        )

    try:
        height, width = image.shape[:2]
        pad_x = int(face_box.width * 0.5)
        pad_y = int(face_box.height * 0.5)

        x1 = max(0, face_box.x - pad_x)
        y1 = max(0, face_box.y - pad_y)
        x2 = min(width, face_box.x + face_box.width + pad_x)
        y2 = min(height, face_box.y + face_box.height + pad_y)

        face_crop = image[y1:y2, x1:x2]
        if face_crop.size == 0:
            return LivenessResult(
                status="uncertain",
                score=0.0,
                method="fas_net",
                error="invalid_crop",
            )

        blob = cv2.dnn.blobFromImage(
            face_crop,
            1.0,
            (80, 80),
            (0, 0, 0),
            swapRB=False,
        )
        net.setInput(blob)
        probabilities = _softmax(net.forward())

        real_index = settings.LIVENESS_REAL_CLASS_INDEX
        if real_index < 0 or real_index >= probabilities.size:
            return LivenessResult(
                status="uncertain",
                score=0.0,
                method="fas_net",
                error="real_class_index_out_of_range",
            )

        score = float(probabilities[real_index])

        if score >= settings.LIVENESS_LIVE_THRESHOLD:
            status = "live"
        elif score <= settings.LIVENESS_SPOOF_THRESHOLD:
            status = "spoof"
        else:
            status = "uncertain"

        return LivenessResult(status=status, score=score, method="fas_net")
    except Exception:
        return LivenessResult(
            status="uncertain",
            score=0.0,
            method="fas_net",
            error="model_execution_failed",
        )
