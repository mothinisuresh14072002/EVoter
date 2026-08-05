from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config.settings import settings
from backend.api import aadhaar, live_capture, verify

app = FastAPI(title="EVoter Face Verification API")

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

@app.get("/")
def read_root():
    return {"message": "Welcome to EVoter Face Verification API. Visit /health for status."}

@app.get("/health")
def health_check():
    return {"status": "ok"}

