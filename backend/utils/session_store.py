import base64
import pickle
import secrets
import time
from typing import Any, Dict, Optional

from backend.config.settings import settings

_store: Dict[str, Dict[str, Any]] = {}
_redis = None


def _get_redis():
    global _redis
    if _redis is None:
        try:
            import redis
            _redis = redis.Redis.from_url(settings.REDIS_URL, decode_responses=False)
            _redis.ping()
        except Exception as exc:
            raise RuntimeError("Redis session store is unavailable") from exc
    return _redis


def create_session(data: Any, ttl_seconds: int) -> str:
    session_id = secrets.token_urlsafe(32)
    expires_at = time.time() + ttl_seconds
    payload = pickle.dumps({"data": data, "expires_at": expires_at}, protocol=pickle.HIGHEST_PROTOCOL)
    if settings.SESSION_STORE_BACKEND == "redis":
        _get_redis().setex(f"evoter:session:{session_id}", ttl_seconds, base64.b64encode(payload))
    else:
        _store[session_id] = {"data": data, "expires_at": expires_at}
    return session_id


def get_session(session_id: str) -> Optional[Any]:
    if settings.SESSION_STORE_BACKEND == "redis":
        raw = _get_redis().get(f"evoter:session:{session_id}")
        if not raw:
            return None
        try:
            session = pickle.loads(base64.b64decode(raw))
        except Exception:
            delete_session(session_id)
            return None
        if time.time() > session["expires_at"]:
            delete_session(session_id)
            return None
        return session["data"]

    session = _store.get(session_id)
    if not session:
        return None
    if time.time() > session["expires_at"]:
        del _store[session_id]
        return None
    return session["data"]


def delete_session(session_id: str) -> bool:
    if settings.SESSION_STORE_BACKEND == "redis":
        return bool(_get_redis().delete(f"evoter:session:{session_id}"))
    if session_id in _store:
        del _store[session_id]
        return True
    return False


def clear_expired_sessions() -> None:
    if settings.SESSION_STORE_BACKEND == "redis":
        return
    now = time.time()
    expired_keys = [k for k, v in _store.items() if now > v["expires_at"]]
    for key in expired_keys:
        del _store[key]
