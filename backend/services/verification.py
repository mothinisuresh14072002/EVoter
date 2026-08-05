import numpy as np
from typing import Dict, Any
from backend.services.face_detection import detect_faces
from backend.services.face_alignment import align_face
from backend.services.face_embedding import get_face_embedding
from backend.services.similarity import compute_similarity
from backend.services.liveness import check_liveness
from backend.services.quality import check_quality
from backend.config.settings import settings

def orchestrate_verification(reference_image: np.ndarray, live_image: np.ndarray) -> Dict[str, Any]:
    """
    Orchestrates the entire face verification pipeline utilizing all underlying services.
    """
    reason_codes = []
    
    # 1. Quality Check
    ref_quality = check_quality(reference_image)
    live_quality = check_quality(live_image)
    
    if not ref_quality.is_acceptable:
        reason_codes.append("reference_poor_quality")
    if not live_quality.is_acceptable:
        reason_codes.append("live_poor_quality")
        
    # 2. Liveness Check
    liveness = check_liveness(live_image)
    if not liveness.is_live:
        reason_codes.append("liveness_failed")
        
    # 3. Face Detection
    ref_detection = detect_faces(reference_image)
    live_detection = detect_faces(live_image)
    
    if ref_detection.error:
        reason_codes.append(f"reference_{ref_detection.error}")
    elif not ref_detection.faces:
        reason_codes.append("no_face_in_reference")
    elif len(ref_detection.faces) > 1:
        reason_codes.append("multiple_faces_in_reference")
        
    if live_detection.error:
        reason_codes.append(f"live_{live_detection.error}")
    elif not live_detection.faces:
        reason_codes.append("no_face_in_live")
    elif len(live_detection.faces) > 1:
        reason_codes.append("multiple_faces_in_live")
        
    # Check early exit conditions if any preliminary checks failed
    if reason_codes:
        return {
            "status": "failed",
            "confidence_score": 0.0,
            "liveness_result": "failed" if not liveness.is_live else "passed",
            "quality_metrics": live_quality.metrics,
            "reason_codes": reason_codes
        }
        
    # 4. Face Alignment
    ref_aligned = align_face(reference_image, ref_detection.faces[0])
    live_aligned = align_face(live_image, live_detection.faces[0])
    
    # 5. Face Embedding
    ref_embedding = get_face_embedding(ref_aligned)
    live_embedding = get_face_embedding(live_aligned)
    
    # 6. Compute Similarity
    similarity = compute_similarity(ref_embedding, live_embedding)
    
    # 7. Make Final Decision based on Configured Thresholds
    if similarity >= settings.MATCH_THRESHOLD:
        status = "match"
    elif similarity >= settings.MANUAL_REVIEW_THRESHOLD:
        status = "manual_review"
    else:
        status = "reject"
        
    if status != "match":
        reason_codes.append("low_similarity")

    return {
        "status": status,
        "confidence_score": similarity,
        "liveness_result": "passed",
        "quality_metrics": live_quality.metrics,
        "reason_codes": reason_codes
    }
