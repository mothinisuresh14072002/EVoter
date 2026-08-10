from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from backend.config.settings import settings
from backend.api import aadhaar, live_capture, verify, admin
from backend.utils.session_store import clear_expired_sessions

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Background task for cleaning expired sessions to prevent memory leaks
    task = asyncio.create_task(session_cleanup_task())
    yield
    task.cancel()

async def session_cleanup_task():
    while True:
        clear_expired_sessions()
        await asyncio.sleep(60)

app = FastAPI(title="EVoter Face Verification API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(aadhaar.router)
app.include_router(live_capture.router)
app.include_router(verify.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to EVoter Face Verification API. Visit /health for status."}

@app.get("/health")
def health_check():
    return {"status": "ok"}

