import secrets
import time
from typing import Any, Optional, Dict

# In-memory store: session_id -> {"data": Any, "expires_at": float}
_store: Dict[str, Dict[str, Any]] = {}

def create_session(data: Any, ttl_seconds: int) -> str:
    """
    Creates a temporary session and returns a secure, unpredictable random session ID.
    """
    session_id = secrets.token_urlsafe(32)
    expires_at = time.time() + ttl_seconds
    _store[session_id] = {
        "data": data,
        "expires_at": expires_at
    }
    return session_id

def get_session(session_id: str) -> Optional[Any]:
    """
    Retrieves session data. Returns None if the session is not found or has expired.
    Expired sessions are automatically removed upon access.
    """
    session = _store.get(session_id)
    if not session:
        return None
        
    if time.time() > session["expires_at"]:
        # Lazy cleanup of expired session
        del _store[session_id]
        return None
        
    return session["data"]

def delete_session(session_id: str) -> bool:
    """
    Deletes a session. Returns True if deleted successfully, False if not found.
    """
    if session_id in _store:
        del _store[session_id]
        return True
    return False

def clear_expired_sessions() -> None:
    """
    Cleans up all expired sessions from the store.
    """
    now = time.time()
    expired_keys = [k for k, v in _store.items() if now > v["expires_at"]]
    for k in expired_keys:
        del _store[k]
