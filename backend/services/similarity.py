import numpy as np
from backend.config.settings import settings

def compute_similarity(embedding1: np.ndarray, embedding2: np.ndarray) -> float:
    """
    Computes real cosine similarity between two 1D NumPy arrays (embeddings).
    """
    if embedding1 is None or embedding2 is None:
        return 0.0
        
    dot_product = np.dot(embedding1, embedding2)
    norm1 = np.linalg.norm(embedding1)
    norm2 = np.linalg.norm(embedding2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
        
    cosine_sim = dot_product / (norm1 * norm2)
    return float(np.clip(cosine_sim, -1.0, 1.0))

def evaluate_similarity(score: float) -> str:
    """
    Evaluates the similarity score against configured thresholds.
    Returns 'match', 'manual_review', or 'reject'.
    """
    if score >= settings.MATCH_THRESHOLD:
        return "match"
    elif score >= settings.MANUAL_REVIEW_THRESHOLD:
        return "manual_review"
    else:
        return "reject"
