from fastapi.testclient import TestClient

from backend.main import app
from backend.config.settings import settings


def test_admin_requires_key(monkeypatch):
    monkeypatch.setattr(settings, "ADMIN_API_KEY", "test-secret")
    client = TestClient(app)
    assert client.get("/admin/candidates").status_code == 401
    assert client.get("/admin/candidates", headers={"X-Admin-Key": "wrong"}).status_code == 401
    assert client.get("/admin/candidates", headers={"X-Admin-Key": "test-secret"}).status_code == 200
