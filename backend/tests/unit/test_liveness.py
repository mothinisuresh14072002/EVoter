import numpy as np
import pytest
from backend.services.liveness import check_liveness
from backend.services.face_detection import BoundingBox

def test_liveness_model_missing():
    # Since we are in development mode and haven't downloaded the real SilentFace ONNX weights,
    # the function must safely catch this and return model_not_available.
    img = np.full((200, 200, 3), 128, dtype=np.uint8)
    bbox = BoundingBox(x=50, y=50, width=100, height=100)
    
    result = check_liveness(img, face_box=bbox)
    
    assert result.status == "model_not_available"
    assert result.is_live is False
    assert result.error == "model_not_available"
