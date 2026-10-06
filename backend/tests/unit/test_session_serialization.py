import numpy as np
import pytest

from backend.utils.session_store import _deserialize_session, _serialize_session


def test_safe_session_serialization_round_trips_images():
    image = np.arange(12, dtype=np.uint8).reshape(2, 2, 3)
    payload = {
        "type": "live",
        "images": [image],
        "challenge_completed": True,
    }

    raw = _serialize_session(payload, expires_at=12345.0)
    restored = _deserialize_session(raw)

    assert restored["expires_at"] == 12345.0
    assert restored["data"]["type"] == "live"
    assert restored["data"]["challenge_completed"] is True
    assert np.array_equal(restored["data"]["images"][0], image)


def test_safe_session_serialization_rejects_non_image_arrays():
    with pytest.raises(TypeError):
        _serialize_session(
            {"embedding": np.ones((4,), dtype=np.float32)},
            expires_at=12345.0,
        )


def test_safe_session_deserialization_rejects_unknown_types():
    raw = b'{"expires_at":12345,"data":{"__evoter_type__":"callable"}}'

    with pytest.raises(ValueError):
        _deserialize_session(raw)
