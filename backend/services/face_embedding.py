import numpy as np

def get_face_embedding(aligned_face: np.ndarray) -> np.ndarray:
    """
    Mock face embedding.
    Returns a deterministic 512-d vector based on the image's mean colors.
    """
    if aligned_face.size == 0:
        return np.zeros(512, dtype=np.float32)
        
    mean_color = aligned_face.mean(axis=(0, 1))
    
    # Use the sum of mean colors as a deterministic seed
    np.random.seed(int(mean_color.sum()))
    embedding = np.random.normal(0, 1, 512).astype(np.float32)
    
    # Inject mean color into the first few dimensions
    if len(mean_color) >= 3:
        embedding[:3] = mean_color[:3]
    
    # Normalize vector for cosine similarity
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm
        
    return embedding
