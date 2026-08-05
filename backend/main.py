from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config.settings import settings

app = FastAPI(title="EVoter Face Verification API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to EVoter Face Verification API. Visit /health for status."}

@app.get("/health")
def health_check():
    return {"status": "ok"}

