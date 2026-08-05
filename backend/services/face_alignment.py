import numpy as np
from backend.services.face_detection import BoundingBox

def align_face(image: np.ndarray, bbox: BoundingBox) -> np.ndarray:
    """
    Mock face alignment.
    Simply crops the image based on the bounding box without geometric transformations.
    """
    x, y, w, h = bbox.x, bbox.y, bbox.width, bbox.height
    
    # Ensure coordinates are within image boundaries
    h_img, w_img = image.shape[:2]
    x1, y1 = max(0, x), max(0, y)
    x2, y2 = min(w_img, x + w), min(h_img, y + h)
    
    return image[y1:y2, x1:x2].copy()
