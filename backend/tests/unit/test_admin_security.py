import asyncio

import pytest
from fastapi import HTTPException

from backend.api.security import require_admin_api_key
from backend.config.settings import settings


def test_admin_auth_fails_closed_without_configured_key(monkeypatch):
    monkeypatch.setattr(settings, "ADMIN_API_KEY", "")
    with pytest.raises(HTTPException) as exc:
        asyncio.run(require_admin_api_key(x_admin_key="anything"))
    assert exc.value.status_code == 401


def test_admin_auth_accepts_exact_configured_key(monkeypatch):
    monkeypatch.setattr(settings, "ADMIN_API_KEY", "test-secret")
    assert asyncio.run(require_admin_api_key(x_admin_key="test-secret")) is None


def test_admin_auth_rejects_wrong_key(monkeypatch):
    monkeypatch.setattr(settings, "ADMIN_API_KEY", "test-secret")
    with pytest.raises(HTTPException) as exc:
        asyncio.run(require_admin_api_key(x_admin_key="wrong-secret"))
    assert exc.value.status_code == 401
