import secrets

from fastapi import Header, HTTPException, status

from backend.config.settings import settings


async def require_admin_api_key(
    x_admin_key: str | None = Header(default=None, alias="X-Admin-Key"),
) -> None:
    expected = settings.ADMIN_API_KEY
    if not expected or not x_admin_key or not secrets.compare_digest(x_admin_key, expected):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
