import cv2
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List

@dataclass
class QualityResult:
    is_acceptable: bool
    metrics: Dict[str, float]
    reason_codes: List[str] = field(default_factory=list)

def check_quality(image: np.ndarray, min_blur: float = 100.0, min_brightness: float = 40.0, max_brightness: float = 240.0) -> QualityResult:
    """
    Computes real brightness and blur scores.
    Uses Laplacian variance for blur detection.
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
