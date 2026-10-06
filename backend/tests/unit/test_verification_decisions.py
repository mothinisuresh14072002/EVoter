from unittest.mock import MagicMock, patch

import numpy as np

from backend.services.verification import orchestrate_multiframe_verification


def _detection():
    result = MagicMock()
    result.error = None
    result.faces = [MagicMock()]
    return result


def _quality():
    result = MagicMock()
    result.is_acceptable = True
    result.overall_score = 150.0
    result.reason_codes = []
    return result


def _liveness():
    result = MagicMock()
    result.is_live = True
    result.status = "live"
    result.score = 0.95
    return result


def _run_with_decision(decision: str, similarity: float):
    image = np.zeros((160, 160, 3), dtype=np.uint8)
    embedding = np.array([1.0, 0.0, 0.0], dtype=np.float32)

    with (
        patch("backend.services.verification.detect_faces") as detect_faces,
        patch("backend.services.verification.check_quality") as check_quality,
        patch("backend.services.verification.check_liveness") as check_liveness,
        patch("backend.services.verification.align_face") as align_face,
        patch("backend.services.verification.get_face_embedding") as get_embedding,
        patch("backend.services.verification.compute_similarity") as compute_similarity,
        patch("backend.services.verification.evaluate_similarity") as evaluate_similarity,
    ):
        detect_faces.side_effect = [_detection(), _detection(), _detection(), _detection()]
        check_quality.return_value = _quality()
        check_liveness.return_value = _liveness()
        align_face.return_value = np.zeros((112, 112, 3), dtype=np.uint8)
        get_embedding.side_effect = [embedding, embedding, embedding, embedding]
        compute_similarity.return_value = similarity
        evaluate_similarity.return_value = decision

        return orchestrate_multiframe_verification(image, [image, image, image])


def test_manual_review_maps_to_schema_status():
    result = _run_with_decision("manual_review", 0.76)

    assert result["status"] == "manual_review"
    assert "similarity_requires_manual_review" in result["reason_codes"]


def test_similarity_reject_maps_to_failed_status():
    result = _run_with_decision("reject", 0.42)

    assert result["status"] == "failed"
    assert "low_similarity" in result["reason_codes"]
