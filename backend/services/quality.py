import cv2
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional
from backend.services.face_detection import BoundingBox

@dataclass
class QualityResult:
    is_acceptable: bool
    metrics: Dict[str, float]
    reason_codes: List[str] = field(default_factory=list)

def check_quality(
    image: np.ndarray, 
    bbox: Optional[BoundingBox] = None,
    min_blur: float = 100.0, 
    min_brightness: float = 40.0, 
    max_brightness: float = 240.0,
    min_face_ratio: float = 0.2,   # Face must be at least 20% of image width or height
    center_tolerance: float = 0.3  # Face center must be within middle 30% of image
) -> QualityResult:
    """
    Computes real brightness and blur scores.
    Uses Laplacian variance for blur detection.
    Also checks face size and position if bbox is provided.
    """
    if image is None or image.size == 0:
        return QualityResult(False, {}, ["invalid_image"])
        
    # Convert to grayscale for analysis
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Blur score using Laplacian variance
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    # Brightness score
    brightness = np.mean(gray)
    
    reasons = []
    if blur_score < min_blur:
        reasons.append("image_blurry")
        
    if brightness < min_brightness:
        reasons.append("too_dark")
    elif brightness > max_brightness:
        reasons.append("too_bright")
        
    img_h, img_w = image.shape[:2]
    
    # Check face geometry if bounding box is provided
    if bbox is not None:
        face_w_ratio = bbox.width / img_w
        face_h_ratio = bbox.height / img_h
        
        if face_w_ratio < min_face_ratio and face_h_ratio < min_face_ratio:
            reasons.append("face_too_small")
            
        face_center_x = bbox.x + (bbox.width / 2)
        face_center_y = bbox.y + (bbox.height / 2)
        
        img_center_x = img_w / 2
        img_center_y = img_h / 2
        
        tolerance_x = img_w * center_tolerance
        tolerance_y = img_h * center_tolerance
        
        if abs(face_center_x - img_center_x) > tolerance_x or abs(face_center_y - img_center_y) > tolerance_y:
            reasons.append("face_not_centered")
            
    metrics = {
        "blur_score": float(blur_score),
        "brightness": float(brightness)
    }
    
    is_acceptable = len(reasons) == 0
    
    return QualityResult(
        is_acceptable=is_acceptable,
        metrics=metrics,
        reason_codes=reasons
    )
