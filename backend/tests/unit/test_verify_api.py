import asyncio
import pytest

from backend.api.verify import verify
from backend.schemas.verification import VerifyRequest
from backend.utils.session_store import _store, create_session


@pytest.fixture(autouse=True)
def clean_store():
    _store.clear()
    yield
    _store.clear()


def test_verify_rejects_swapped_session_types_and_cleans_up():
    reference_session_id = create_session(
        {"image": "reference", "type": "live"}, ttl_seconds=60
    )
    live_session_id = create_session(
        {"image": "live", "type": "aadhaar"}, ttl_seconds=60
    )

    response = asyncio.run(
        verify(
            VerifyRequest(
                reference_session_id=reference_session_id,
                live_session_id=live_session_id,
            )
        )
    )

    assert response.status == "failed"
    assert response.reason_codes == ["invalid_session_type"]
    assert reference_session_id not in _store
    assert live_session_id not in _store
