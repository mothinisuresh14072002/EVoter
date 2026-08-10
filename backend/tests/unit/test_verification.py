import pytest
import numpy as np
from unittest.mock import patch, MagicMock
from backend.services.verification import orchestrate_verification

@patch('backend.services.verification.detect_faces')
@patch('backend.services.verification.check_quality')
@patch('backend.services.verification.check_liveness')
@patch('backend.services.verification.align_face')
@patch('backend.services.verification.get_face_embedding')
@patch('backend.services.verification.compute_similarity')
@patch('backend.services.verification.evaluate_similarity')
def test_liveness_failure_rejects_match(
    mock_evaluate_similarity,
    mock_compute_similarity,
    mock_get_face_embedding,
    mock_align_face,
    mock_check_liveness,
    mock_check_quality,
    mock_detect_faces
):
    # Setup mocks to simulate a perfect face match but a failed liveness check
    
    # Mock face detection
    mock_detection_result = MagicMock()
    mock_detection_result.error = None
    mock_detection_result.faces = [(0, 0, 100, 100)] # Single face box
    mock_detect_faces.return_value = mock_detection_result
    
    # Mock quality check
    mock_quality_result = MagicMock()
    mock_quality_result.is_acceptable = True
    mock_quality_result.metrics = {"sharpness": 0.9}
    mock_check_quality.return_value = mock_quality_result
    
    # Mock liveness check - THIS FAILS
    mock_liveness_result = MagicMock()
    mock_liveness_result.is_live = False
    mock_liveness_result.status = "spoof_detected"
    mock_check_liveness.return_value = mock_liveness_result
    
    # Mock alignment and embedding
    mock_align_face.return_value = np.zeros((100, 100, 3))
    mock_get_face_embedding.return_value = [0.1] * 128
    
    # Mock similarity to be very high
    mock_compute_similarity.return_value = 0.99
    
    # Mock evaluate similarity to return "match"
    mock_evaluate_similarity.return_value = "match"
    
    # Create dummy images
    dummy_ref = np.zeros((200, 200, 3), dtype=np.uint8)
    dummy_live = np.zeros((200, 200, 3), dtype=np.uint8)
    
    # Call orchestration
    result = orchestrate_verification(dummy_ref, dummy_live)
    
    # Assertions
    # Status should be reject because liveness failed, even though it was a "match"
    assert result["status"] == "reject"
    assert "low_similarity_or_spoof" in result["reason_codes"]
