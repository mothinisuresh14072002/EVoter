import cv2
import numpy as np

from backend.services.face_detection import BoundingBox


_ARCFACE_TEMPLATE = np.array(
    [
        [38.2946, 51.6963],
        [73.5318, 51.5014],
        [56.0252, 71.7366],
        [41.5493, 92.3655],
        [70.7299, 92.2041],
    ],
    dtype=np.float32,
)


def _crop_and_resize(image: np.ndarray, bbox: BoundingBox) -> np.ndarray:
    image_height, image_width = image.shape[:2]
    x1 = max(0, bbox.x)
    y1 = max(0, bbox.y)
    x2 = min(image_width, bbox.x + bbox.width)
    y2 = min(image_height, bbox.y + bbox.height)

    crop = image[y1:y2, x1:x2]
    if crop.size == 0:
        return np.empty((0, 0, 3), dtype=image.dtype)

    return cv2.resize(crop, (112, 112), interpolation=cv2.INTER_LINEAR)


def align_face(image: np.ndarray, bbox: BoundingBox) -> np.ndarray:
    """Align a detected face to the standard 112x112 ArcFace geometry.

    SCRFD five-point landmarks are preferred. A bounded crop is used only when
    landmarks are unavailable, keeping the service functional with 6-output
    SCRFD exports while making the weaker alignment path explicit.
    """
    if image is None or image.size == 0:
        return np.empty((0, 0, 3), dtype=np.uint8)

    if len(bbox.landmarks) == 5:
        source = np.asarray(bbox.landmarks, dtype=np.float32)
        matrix, _ = cv2.estimateAffinePartial2D(
            source,
            _ARCFACE_TEMPLATE,
            method=cv2.LMEDS,
        )

        if matrix is not None:
            return cv2.warpAffine(
                image,
                matrix,
                (112, 112),
                flags=cv2.INTER_LINEAR,
                borderMode=cv2.BORDER_CONSTANT,
                borderValue=0,
            )

    return _crop_and_resize(image, bbox)
