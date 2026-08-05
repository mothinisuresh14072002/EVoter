import numpy as np
from dataclasses import dataclass

@dataclass
class LivenessResult:
    is_live: bool
    score: float
    method: str

def check_liveness(image: np.ndarray) -> LivenessResult:
    """
    Mock liveness detection.
    Always returns that the subject is live.
    """
    return LivenessResult(is_live=True, score=0.98, method="mock_passive")
