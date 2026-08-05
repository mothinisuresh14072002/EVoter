import numpy as np
from typing import Dict, Any
from backend.services.face_detection import detect_faces
from backend.services.face_alignment import align_face
from backend.services.face_embedding import get_face_embedding
from backend.services.similarity import compute_similarity, evaluate_similarity
from backend.services.liveness import check_liveness
from backend.services.quality import check_quality
from backend.config.settings import settings

def orchestrate_verification(reference_image: np.ndarray, live_image: np.ndarray) -> Dict[str, Any]:
    """
    Orchestrates the entire face verification pipeline utilizing all underlying services.
    """
    reason_codes = []
    
    # 1. Face Detection (Run first to extract bounding boxes for downstream checks)
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

    # If detection failed, we can't extract bounding boxes, exit early.
    if reason_codes:
        return {
            "status": "failed",
            "confidence_score": 0.0,
            "liveness_result": "unknown",
            "quality_metrics": {},
            "reason_codes": reason_codes
        }

    # Extract Face Bounding Boxes
    ref_bbox = ref_detection.faces[0]
    live_bbox = live_detection.faces[0]

    # 2. Quality Check (Now utilizes bounding boxes)
    ref_quality = check_quality(reference_image, bbox=ref_bbox)
    live_quality = check_quality(live_image, bbox=live_bbox)
    
    if not ref_quality.is_acceptable:
        reason_codes.extend([f"reference_{code}" for code in ref_quality.reason_codes])
    if not live_quality.is_acceptable:
        reason_codes.extend([f"live_{code}" for code in live_quality.reason_codes])
        
    # 3. Liveness Check (Now utilizes bounding box)
    liveness = check_liveness(live_image, face_box=live_bbox)
    if not liveness.is_live:
        reason_codes.append(f"liveness_failed_{liveness.status}")
        
    # We DO NOT exit early here if liveness fails, so the manual review path is never skipped.
    
    # 4. Face Alignment
    ref_aligned = align_face(reference_image, ref_bbox)
    live_aligned = align_face(live_image, live_bbox)
    
    # 5. Face Embedding
    ref_embedding = get_face_embedding(ref_aligned)
    live_embedding = get_face_embedding(live_aligned)
    
    if ref_embedding is None:
        reason_codes.append("reference_embedding_failed")
    if live_embedding is None:
        reason_codes.append("live_embedding_failed")
        
    if "reference_embedding_failed" in reason_codes or "live_embedding_failed" in reason_codes:
        return {
            "status": "failed",
            "confidence_score": 0.0,
            "liveness_result": liveness.status,
            "quality_metrics": live_quality.metrics,
            "reason_codes": reason_codes
        }
    
    # 6. Compute Similarity
    similarity = compute_similarity(ref_embedding, live_embedding)
    
    # 7. Make Final Decision based on Configured Thresholds
    status = evaluate_similarity(similarity)
    
    # Anti-Spoofing Rule: Block a 'match' if liveness is not guaranteed.
    # Send to manual_review instead of outright rejecting, allowing operators to verify.
    if status == "match" and not liveness.is_live:
        status = "manual_review"
        
    if status != "match":
        reason_codes.append("low_similarity_or_spoof")

    return {
        "status": status,
        "confidence_score": similarity,
        "liveness_result": liveness.status,
        "quality_metrics": live_quality.metrics,
        "reason_codes": reason_codes
    }
