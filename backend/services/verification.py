import numpy as np
from typing import Dict, Any, List
from backend.services.face_detection import detect_faces
from backend.services.face_alignment import align_face
from backend.services.face_embedding import get_face_embedding
from backend.services.similarity import compute_similarity, evaluate_similarity
from backend.services.liveness import check_liveness
from backend.services.quality import check_quality


def _failure(reason_codes: List[str], liveness_result: str = "unknown", quality_metrics: Dict[str, float] | None = None) -> Dict[str, Any]:
    return {
        "status": "failed",
        "confidence_score": 0.0,
        "liveness_result": liveness_result,
        "quality_metrics": quality_metrics or {},
        "reason_codes": reason_codes,
    }


def orchestrate_multiframe_verification(reference_image: np.ndarray, live_images: List[np.ndarray]) -> Dict[str, Any]:
    """Verify one reference against a controlled burst of live frames.

    The burst must contain multiple independently decoded frames. Every frame must
    contain exactly one face, pass quality checks, and pass the configured liveness
    model. Identity similarity is computed from the mean normalized embedding.
    """
    if len(live_images) < 3:
        return _failure(["insufficient_live_frames"])

    ref_detection = detect_faces(reference_image)
    if ref_detection.error or len(ref_detection.faces) != 1:
        return _failure(["invalid_reference_face"])

    ref_bbox = ref_detection.faces[0]
    ref_quality = check_quality(reference_image, bbox=ref_bbox)
    if not ref_quality.is_acceptable:
        return _failure([f"reference_{c}" for c in ref_quality.reason_codes])

    ref_aligned = align_face(reference_image, ref_bbox)
    ref_embedding = get_face_embedding(ref_aligned)
    if ref_embedding is None:
        return _failure(["reference_embedding_failed"])

    embeddings = []
    liveness_scores = []
    quality_scores = []
    reason_codes: List[str] = []

    for index, image in enumerate(live_images):
        detection = detect_faces(image)
        if detection.error or len(detection.faces) != 1:
            reason_codes.append(f"frame_{index}_face_invalid")
            continue

        bbox = detection.faces[0]
        quality = check_quality(image, bbox=bbox)
        if not quality.is_acceptable:
            reason_codes.extend(f"frame_{index}_{c}" for c in quality.reason_codes)
            continue

        liveness = check_liveness(image, face_box=bbox)
        if not liveness.is_live:
            reason_codes.append(f"frame_{index}_liveness_{liveness.status}")
            continue

        aligned = align_face(image, bbox)
        embedding = get_face_embedding(aligned)
        if embedding is None:
            reason_codes.append(f"frame_{index}_embedding_failed")
            continue

        embeddings.append(np.asarray(embedding, dtype=np.float32))
        liveness_scores.append(float(liveness.score))
        quality_scores.append(float(quality.overall_score))

    if len(embeddings) < 3:
        return _failure(["insufficient_valid_live_frames", *reason_codes], "spoof_or_uncertain")

    mean_embedding = np.mean(np.stack(embeddings), axis=0)
    norm = np.linalg.norm(mean_embedding)
    if norm == 0:
        return _failure(["live_embedding_invalid", *reason_codes])
    mean_embedding = mean_embedding / norm

    similarity = compute_similarity(ref_embedding, mean_embedding)
    status = evaluate_similarity(similarity)
    if status != "match":
        reason_codes.append("low_similarity")

    return {
        "status": "verified" if status == "match" else "reject",
        "confidence_score": float(similarity),
        "liveness_result": "live",
        "liveness_score": float(np.mean(liveness_scores)),
        "quality_metrics": {
            "frames_received": len(live_images),
            "frames_valid": len(embeddings),
            "mean_quality_score": float(np.mean(quality_scores)),
        },
        "reason_codes": reason_codes,
    }


def orchestrate_verification(reference_image: np.ndarray, live_image: np.ndarray) -> Dict[str, Any]:
    """Backward-compatible single-frame verification path."""
    return orchestrate_multiframe_verification(reference_image, [live_image, live_image, live_image])
