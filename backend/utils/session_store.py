import base64
import json
import secrets
import time
import zlib
from typing import Any, Dict, Optional

import numpy as np

from backend.config.settings import settings

_store: Dict[str, Dict[str, Any]] = {}
_redis = None
_TYPE_KEY = "__evoter_type__"


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


def _encode_value(value: Any) -> Any:
    if isinstance(value, np.ndarray):
        if value.dtype != np.uint8 or value.ndim not in (2, 3):
            raise TypeError("Only uint8 image arrays may be stored in biometric sessions")

        compressed = zlib.compress(value.tobytes(order="C"), level=3)
        return {
            _TYPE_KEY: "ndarray",
            "dtype": "uint8",
            "shape": list(value.shape),
            "data": base64.b64encode(compressed).decode("ascii"),
        }

    if isinstance(value, dict):
        return {str(key): _encode_value(item) for key, item in value.items()}

    if isinstance(value, list):
        return [_encode_value(item) for item in value]

    if isinstance(value, tuple):
        return {
            _TYPE_KEY: "tuple",
            "items": [_encode_value(item) for item in value],
        }

    if value is None or isinstance(value, (str, int, float, bool)):
        return value

    raise TypeError(f"Unsupported session value type: {type(value).__name__}")


def _decode_value(value: Any) -> Any:
    if isinstance(value, list):
        return [_decode_value(item) for item in value]

    if not isinstance(value, dict):
        return value

    value_type = value.get(_TYPE_KEY)
    if value_type == "ndarray":
        if value.get("dtype") != "uint8":
            raise ValueError("Unsupported ndarray dtype")

        shape = value.get("shape")
        if (
            not isinstance(shape, list)
            or len(shape) not in (2, 3)
            or any(not isinstance(dimension, int) or dimension <= 0 for dimension in shape)
        ):
            raise ValueError("Invalid ndarray shape")

        compressed = base64.b64decode(value["data"], validate=True)
        raw = zlib.decompress(compressed)

        expected_size = int(np.prod(shape))
        if len(raw) != expected_size:
            raise ValueError("Invalid ndarray byte length")

        return np.frombuffer(raw, dtype=np.uint8).reshape(shape).copy()

    if value_type == "tuple":
        items = value.get("items")
        if not isinstance(items, list):
            raise ValueError("Invalid tuple payload")
        return tuple(_decode_value(item) for item in items)

    if value_type is not None:
        raise ValueError("Unknown session value type")

    return {key: _decode_value(item) for key, item in value.items()}


def _serialize_session(data: Any, expires_at: float) -> bytes:
    payload = {
        "expires_at": expires_at,
        "data": _encode_value(data),
    }
    return json.dumps(payload, separators=(",", ":")).encode("utf-8")


def _deserialize_session(raw: bytes) -> Dict[str, Any]:
    payload = json.loads(raw.decode("utf-8"))
    if not isinstance(payload, dict) or "expires_at" not in payload or "data" not in payload:
        raise ValueError("Invalid session payload")

    return {
        "expires_at": float(payload["expires_at"]),
        "data": _decode_value(payload["data"]),
    }


def create_session(data: Any, ttl_seconds: int) -> str:
    if ttl_seconds <= 0:
        raise ValueError("ttl_seconds must be positive")

    session_id = secrets.token_urlsafe(32)
    expires_at = time.time() + ttl_seconds

    if settings.SESSION_STORE_BACKEND == "redis":
        payload = _serialize_session(data, expires_at)
        _get_redis().setex(f"evoter:session:{session_id}", ttl_seconds, payload)
    else:
        _store[session_id] = {"data": data, "expires_at": expires_at}

    return session_id


def get_session(session_id: str) -> Optional[Any]:
    if settings.SESSION_STORE_BACKEND == "redis":
        raw = _get_redis().get(f"evoter:session:{session_id}")
        if not raw:
            return None

        try:
            session = _deserialize_session(raw)
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
    expired_keys = [key for key, value in _store.items() if now > value["expires_at"]]
    for key in expired_keys:
        del _store[key]


def session_store_ready() -> bool:
    if settings.SESSION_STORE_BACKEND != "redis":
        return True

    try:
        return bool(_get_redis().ping())
    except Exception:
        return False
