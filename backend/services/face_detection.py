import numpy as np
from dataclasses import dataclass
from typing import List

@dataclass
class BoundingBox:
    x: int
    y: int
    width: int
    height: int

@dataclass
class FaceDetectionResult:
    faces: List[BoundingBox]

def detect_faces(image: np.ndarray) -> FaceDetectionResult:
    """
    Mock face detection.
    Returns a single face bounding box for normal images.
    """
    h, w = image.shape[:2]
    # Create a mock bounding box in the center of the image
    box = BoundingBox(
        x=int(w * 0.25),
        y=int(h * 0.25),
        width=int(w * 0.5),
        height=int(h * 0.5)
    )
    return FaceDetectionResult(faces=[box])
