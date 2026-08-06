import pytest
import numpy as np
import cv2
from backend.services.quality import check_quality
from backend.services.face_detection import BoundingBox

def create_uniform_image(value: int) -> np.ndarray:
    """Creates a uniform color image for brightness testing."""
    return np.full((100, 100, 3), value, dtype=np.uint8)

def create_good_image() -> np.ndarray:
    """Creates a synthetic sharp image with good brightness."""
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    for i in range(0, 100, 2):
        img[i, :] = 200
    for i in range(1, 100, 2):
        img[i, :] = 50
    return img

def test_quality_too_dark():
    img = create_uniform_image(20)
    result = check_quality(img)
    assert not result.is_acceptable
    assert "too_dark" in result.reason_codes
    assert "image_blurry" in result.reason_codes

def test_quality_too_bright():
    img = create_uniform_image(250)
    result = check_quality(img)
    assert not result.is_acceptable
    assert "too_bright" in result.reason_codes
    assert "image_blurry" in result.reason_codes

def test_quality_blurry():
    img = create_uniform_image(128)
    result = check_quality(img)
    assert not result.is_acceptable
    assert "image_blurry" in result.reason_codes
    assert "too_dark" not in result.reason_codes
    assert "too_bright" not in result.reason_codes

def test_quality_good():
    img = create_good_image()
    result = check_quality(img)
    assert result.is_acceptable
    assert len(result.reason_codes) == 0

def test_quality_face_position_good():
    img = create_good_image()
    # Good center box, 50% of image size
    bbox = BoundingBox(x=25, y=25, width=50, height=50)
    result = check_quality(img, bbox=bbox)
    assert result.is_acceptable
    assert len(result.reason_codes) == 0

def test_quality_face_too_small():
    img = create_good_image()
    # 10% of image size (too small)
    bbox = BoundingBox(x=45, y=45, width=10, height=10)
    result = check_quality(img, bbox=bbox)
    assert not result.is_acceptable
    assert "face_too_small" in result.reason_codes

def test_quality_face_not_centered():
    img = create_good_image()
    # Face in top left corner (not centered)
    # width=30 keeps it above min_face_ratio (20%) but pushes the center (15,15) out of the 30% tolerance zone.
    bbox = BoundingBox(x=0, y=0, width=30, height=30)
    result = check_quality(img, bbox=bbox)
    assert not result.is_acceptable
    assert "face_not_centered" in result.reason_codes
