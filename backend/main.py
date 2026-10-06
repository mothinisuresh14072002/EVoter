import asyncio
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

_PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from backend.api import aadhaar, admin, live_capture, verify
from backend.config.settings import settings
from backend.utils.session_store import clear_expired_sessions, session_store_ready


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(session_cleanup_task())
    try:
        yield
    finally:
        task.cancel()


async def session_cleanup_task():
    while True:
        clear_expired_sessions()
        await asyncio.sleep(60)


app = FastAPI(
    title="EVoter Biometric Verification Demo API",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Admin-Key"],
)

app.include_router(aadhaar.router)
app.include_router(live_capture.router)
app.include_router(verify.router)
app.include_router(admin.router)


@app.get("/")
def read_root():
    return {
        "message": "EVoter biometric research API",
        "docs": "/docs",
        "health": "/health",
        "readiness": "/ready",
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/ready")
def readiness_check():
    models = {
        "face_detection": Path(settings.FACE_DETECTION_MODEL_PATH).is_file(),
        "face_embedding": Path(settings.FACE_EMBEDDING_MODEL_PATH).is_file(),
        "liveness": Path(settings.LIVENESS_MODEL_PATH).is_file(),
    }
    store_ok = session_store_ready()
    ready = all(models.values()) and store_ok

    return JSONResponse(
        status_code=200 if ready else 503,
        content={
            "status": "ready" if ready else "not_ready",
            "session_store": store_ok,
            "models": models,
        },
    )
