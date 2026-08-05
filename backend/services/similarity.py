import numpy as np

def compute_similarity(embedding1: np.ndarray, embedding2: np.ndarray) -> float:
    """
    Computes real cosine similarity between two 1D NumPy arrays (embeddings).
    """
    dot_product = np.dot(embedding1, embedding2)
    norm1 = np.linalg.norm(embedding1)
    norm2 = np.linalg.norm(embedding2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
        
    cosine_sim = dot_product / (norm1 * norm2)
    
    # Ensure float value is between -1.0 and 1.0 (handling minor precision issues)
    return float(np.clip(cosine_sim, -1.0, 1.0))
