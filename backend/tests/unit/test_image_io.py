import pytest
import numpy as np
import cv2
from backend.utils.image_io import decode_image_bytes, validate_image
from backend.config.settings import settings

def create_dummy_image_bytes() -> bytes:
    """Helper to create valid JPEG bytes for a 10x10 black image."""
    img = np.zeros((10, 10, 3), dtype=np.uint8)
    success, buffer = cv2.imencode('.jpg', img)
    assert success
    return buffer.tobytes()

def test_decode_valid_image():
    image_bytes = create_dummy_image_bytes()
    decoded = decode_image_bytes(image_bytes)
    
    assert decoded is not None
    assert isinstance(decoded, np.ndarray)
    assert decoded.shape == (10, 10, 3)

def test_decode_empty_bytes():
    with pytest.raises(ValueError, match="Image bytes cannot be empty"):
        decode_image_bytes(b"")

def test_decode_corrupted_image():
    corrupted_bytes = b"this is obviously not a valid jpeg or png"
    with pytest.raises(ValueError, match="Corrupted or invalid image data"):
        decode_image_bytes(corrupted_bytes)

def test_validate_image_valid():
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', img)
    reasons = validate_image(buffer.tobytes())
    assert reasons == []

def test_validate_image_too_small():
    img = np.zeros((10, 10, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', img)
    reasons = validate_image(buffer.tobytes())
    assert "image_too_small" in reasons

def test_validate_image_too_large(monkeypatch):
    # Temporarily set MAX_IMAGE_MB to 0 so any image is too large
    monkeypatch.setattr(settings, "MAX_IMAGE_MB", 0)
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', img)
    reasons = validate_image(buffer.tobytes())
    assert "image_too_large" in reasons

def test_validate_image_invalid():
    reasons = validate_image(b"invalid data")
    assert "invalid_image" in reasons

def test_validate_image_empty():
    reasons = validate_image(b"")
    assert "invalid_image" in reasons
