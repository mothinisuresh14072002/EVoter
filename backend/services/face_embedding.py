import os
import cv2
import numpy as np
from typing import Optional
from backend.config.settings import settings

# Global model cache to prevent reloading the weights on every API request
_embedding_net = None
_model_load_attempted = False

def _get_embedding_net():
    global _embedding_net, _model_load_attempted
    if not _model_load_attempted:
        _model_load_attempted = True
        model_path = settings.FACE_EMBEDDING_MODEL_PATH
        if os.path.exists(model_path):
            try:
                # Load the ONNX model using OpenCV DNN
                _embedding_net = cv2.dnn.readNetFromONNX(model_path)
            except Exception as e:
                print(f"Failed to load embedding ONNX model: {e}")
    return _embedding_net

def get_face_embedding(aligned_face: np.ndarray) -> Optional[np.ndarray]:
    """
    Real face embedding using OpenCV DNN with an ONNX model (AdaFace/ArcFace).
    Extracts a 512-dimensional feature vector.
    Fails gracefully returning None if the model file doesn't exist.
    """
    if aligned_face is None or aligned_face.size == 0:
        return None
        
    net = _get_embedding_net()
    
    if net is None:
        # Graceful failure if model is missing
        return None
        
    try:
        # Preprocess the aligned face for ArcFace/AdaFace architectures
        # Typical input is 112x112, normalized with mean 127.5 and scale 1/127.5
        blob = cv2.dnn.blobFromImage(
            aligned_face, 1.0 / 127.5, (112, 112), (127.5, 127.5, 127.5), swapRB=True
        )
        net.setInput(blob)
        
        # Forward pass to extract features
        embedding = net.forward()
        
        # Flatten array and cast to standard 32-bit float
        embedding = np.squeeze(embedding).astype(np.float32)
        
        # Mathematically normalize the vector (L2 norm) for accurate cosine similarity
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm
            
        return embedding
    except Exception as e:
        print(f"Face embedding inference failed: {e}")
        return None
