import os
import cv2
import numpy as np
from dataclasses import dataclass
from typing import Optional, Literal
from backend.services.face_detection import BoundingBox
from backend.config.settings import settings

@dataclass
class LivenessResult:
    status: Literal["live", "spoof", "uncertain", "model_not_available"]
    score: float
    method: str
    error: Optional[str] = None
    
    @property
    def is_live(self) -> bool:
        return self.status == "live"

_liveness_net = None
_model_load_attempted = False

def _get_liveness_net():
    global _liveness_net, _model_load_attempted
    if not _model_load_attempted:
        _model_load_attempted = True
        model_path = settings.LIVENESS_MODEL_PATH
        if os.path.exists(model_path):
            try:
                _liveness_net = cv2.dnn.readNetFromONNX(model_path)
            except Exception as e:
                print(f"Failed to load liveness ONNX model: {e}")
    return _liveness_net

def check_liveness(image: np.ndarray, face_box: Optional[BoundingBox] = None) -> LivenessResult:
    """
    Real liveness detection (Anti-spoofing) using Silent-Face / FAS-Net ONNX.
    Fails gracefully if the model is absent, returning 'model_not_available'.
    """
    if image is None or image.size == 0:
        return LivenessResult(status="uncertain", score=0.0, method="fas_net", error="invalid_image")
        
    net = _get_liveness_net()
    
    if net is None:
        return LivenessResult(status="model_not_available", score=0.0, method="fas_net", error="model_not_available")
        
    if face_box is None:
        return LivenessResult(status="uncertain", score=0.0, method="fas_net", error="no_face_box_provided")

    try:
        # SilentFace typically expects the face crop to include background context.
        # We expand the bounding box by 50% before cropping.
        h, w = image.shape[:2]
        pad_x = int(face_box.width * 0.5)
        pad_y = int(face_box.height * 0.5)
        
        x1 = max(0, face_box.x - pad_x)
        y1 = max(0, face_box.y - pad_y)
        x2 = min(w, face_box.x + face_box.width + pad_x)
        y2 = min(h, face_box.y + face_box.height + pad_y)
        
        face_crop = image[y1:y2, x1:x2]
        
        if face_crop.size == 0:
             return LivenessResult(status="uncertain", score=0.0, method="fas_net", error="invalid_crop")
             
        # Preprocess for SilentFace (typically 80x80, unscaled mean/std depending on exact architecture)
        blob = cv2.dnn.blobFromImage(face_crop, 1.0, (80, 80), (0, 0, 0), swapRB=False)
        net.setInput(blob)
        
        out = net.forward()
        out = np.squeeze(out)
        
        # Mocking the actual class indexing based on standard MiniFASNet: index 1 is Real, 0 is Fake.
        score = float(out[1] if len(out) > 1 else out[0])
        
        if score > 0.8:
            status = "live"
        elif score < 0.4:
            status = "spoof"
        else:
            status = "uncertain"
            
        return LivenessResult(status=status, score=score, method="fas_net")
        
    except Exception as e:
        print(f"Liveness inference failed: {e}")
        return LivenessResult(status="uncertain", score=0.0, method="fas_net", error="model_execution_failed")
