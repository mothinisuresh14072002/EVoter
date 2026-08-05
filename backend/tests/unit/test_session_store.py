import time
import pytest
from backend.utils.session_store import create_session, get_session, delete_session, clear_expired_sessions, _store

@pytest.fixture(autouse=True)
def clean_store():
    """Ensure the store is clean before each test."""
    _store.clear()
    yield

def test_create_and_get_session():
    data = {"user": "test_user"}
    session_id = create_session(data, ttl_seconds=60)
    
    assert session_id is not None
    assert isinstance(session_id, str)
    assert len(session_id) > 20  # Ensure it's sufficiently long/secure
    
    retrieved = get_session(session_id)
    assert retrieved == data

def test_get_nonexistent_session():
    retrieved = get_session("nonexistent_id")
    assert retrieved is None

def test_delete_session():
    session_id = create_session("test_data", ttl_seconds=60)
    assert get_session(session_id) == "test_data"
    
    deleted = delete_session(session_id)
    assert deleted is True
    assert get_session(session_id) is None
    
    # Attempting to delete again should return False
    assert delete_session(session_id) is False

def test_session_expiry():
    # Use a very short TTL
    session_id = create_session("expire_me", ttl_seconds=1)
    
    # Should be available immediately
    assert get_session(session_id) == "expire_me"
    
    # Wait for expiry
    time.sleep(1.1)
    
    # Should be None after expiry (and lazy deleted)
    assert get_session(session_id) is None
    assert session_id not in _store

def test_clear_expired_sessions():
    session_id1 = create_session("keep_me", ttl_seconds=60)
    session_id2 = create_session("expire_me", ttl_seconds=1)
    
    time.sleep(1.1)
    
    # Explicitly clear expired sessions
    clear_expired_sessions()
    
    assert session_id1 in _store
    assert session_id2 not in _store
