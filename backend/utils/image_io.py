import cv2
import numpy as np
from backend.config.settings import settings

def decode_image_bytes(image_bytes: bytes) -> np.ndarray:
    """
    Decodes raw image bytes into an OpenCV BGR image (NumPy array).
    """
    if not image_bytes:
        raise ValueError("Image bytes cannot be empty")
        
    # Safely load the bytes into a 1D NumPy array
    np_arr = np.frombuffer(image_bytes, np.uint8)
    
    # Decode the array into an OpenCV image (BGR format by default)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Corrupted or invalid image data")
        
    return img

def validate_image(image_bytes: bytes) -> list[str]:
    """
    Validates image bytes for max size, decodability, and minimum dimensions.
    Returns a list of reason codes, e.g., ['image_too_large'], ['invalid_image'], ['image_too_small'].
    Returns an empty list if the image is valid.
    """
    if not image_bytes:
        return ["invalid_image"]
        
    reasons = []
    
    # Check file size
    size_mb = len(image_bytes) / (1024 * 1024)
    if size_mb > settings.MAX_IMAGE_MB:
        reasons.append("image_too_large")
        
    # Check if decodable and check dimensions
    try:
        img = decode_image_bytes(image_bytes)
        height, width = img.shape[:2]
        if height < settings.MIN_IMAGE_HEIGHT or width < settings.MIN_IMAGE_WIDTH:
            reasons.append("image_too_small")
    except ValueError:
        if "invalid_image" not in reasons:
            reasons.append("invalid_image")
            
    return reasons
