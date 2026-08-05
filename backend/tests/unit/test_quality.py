import pytest
import numpy as np
import cv2
from backend.services.quality import check_quality

def create_uniform_image(value: int) -> np.ndarray:
    """Creates a uniform color image for brightness testing."""
    return np.full((100, 100, 3), value, dtype=np.uint8)

def test_quality_too_dark():
    # Very dark image
    img = create_uniform_image(20)
    result = check_quality(img)
    assert not result.is_acceptable
    assert "too_dark" in result.reason_codes
    assert "image_blurry" in result.reason_codes # uniform image has 0 variance (blurry)

def test_quality_too_bright():
    # Very bright image
    img = create_uniform_image(250)
    result = check_quality(img)
    assert not result.is_acceptable
    assert "too_bright" in result.reason_codes
    assert "image_blurry" in result.reason_codes

def test_quality_blurry():
    # Medium brightness, but completely uniform (variance 0)
    img = create_uniform_image(128)
    result = check_quality(img)
    assert not result.is_acceptable
    assert "image_blurry" in result.reason_codes
    assert "too_dark" not in result.reason_codes
    assert "too_bright" not in result.reason_codes

def test_quality_good():
    # Create a synthetic sharp image with good brightness
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    # Add sharp contrasting stripes to ensure high Laplacian variance
    for i in range(0, 100, 2):
        img[i, :] = 200
    for i in range(1, 100, 2):
        img[i, :] = 50
        
    result = check_quality(img)
    
    assert result.is_acceptable
    assert len(result.reason_codes) == 0
    assert result.metrics["brightness"] == 125.0
    assert result.metrics["blur_score"] > 100.0
