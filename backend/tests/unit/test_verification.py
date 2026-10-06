import numpy as np
from unittest.mock import MagicMock, patch

from backend.services.verification import orchestrate_verification


@patch("backend.services.verification.detect_faces")
@patch("backend.services.verification.check_quality")
@patch("backend.services.verification.check_liveness")
@patch("backend.services.verification.align_face")
@patch("backend.services.verification.get_face_embedding")
@patch("backend.services.verification.compute_similarity")
@patch("backend.services.verification.evaluate_similarity")
def test_liveness_failure_fails_closed(
    mock_evaluate_similarity,
    mock_compute_similarity,
    mock_get_face_embedding,
    mock_align_face,
    mock_check_liveness,
    mock_check_quality,
    mock_detect_faces,
):
    """A high identity similarity must never override failed liveness."""
    mock_detection_result = MagicMock()
    mock_detection_result.error = None
    mock_detection_result.faces = [(0, 0, 100, 100)]
    mock_detect_faces.return_value = mock_detection_result

    mock_quality_result = MagicMock()
    mock_quality_result.is_acceptable = True
    mock_quality_result.overall_score = 0.9
    mock_quality_result.metrics = {"sharpness": 0.9}
    mock_check_quality.return_value = mock_quality_result

    mock_liveness_result = MagicMock()
    mock_liveness_result.is_live = False
    mock_liveness_result.status = "spoof_detected"
    mock_liveness_result.score = 0.0
    mock_check_liveness.return_value = mock_liveness_result

    mock_align_face.return_value = np.zeros((100, 100, 3))
    mock_get_face_embedding.return_value = [0.1] * 128
    mock_compute_similarity.return_value = 0.99
    mock_evaluate_similarity.return_value = "match"

    dummy_ref = np.zeros((200, 200, 3), dtype=np.uint8)
    dummy_live = np.zeros((200, 200, 3), dtype=np.uint8)

    result = orchestrate_verification(dummy_ref, dummy_live)

    assert result["status"] == "failed"
    assert result["liveness_result"] == "spoof_or_uncertain"
    assert "insufficient_valid_live_frames" in result["reason_codes"]
    assert "frame_0_liveness_spoof_detected" in result["reason_codes"]
    mock_compute_similarity.assert_not_called()
    mock_evaluate_similarity.assert_not_called()
