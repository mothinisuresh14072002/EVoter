import os


class Settings:
    MAX_IMAGE_MB: int = int(os.getenv("MAX_IMAGE_MB", "5"))
    SESSION_TTL_SECONDS: int = int(os.getenv("SESSION_TTL_SECONDS", "3600"))
    MATCH_THRESHOLD: float = float(os.getenv("MATCH_THRESHOLD", "0.85"))
    MANUAL_REVIEW_THRESHOLD: float = float(os.getenv("MANUAL_REVIEW_THRESHOLD", "0.70"))
    MIN_IMAGE_WIDTH: int = int(os.getenv("MIN_IMAGE_WIDTH", "200"))
    MIN_IMAGE_HEIGHT: int = int(os.getenv("MIN_IMAGE_HEIGHT", "200"))
    FACE_DETECTION_MODEL_PATH: str = os.getenv("FACE_DETECTION_MODEL_PATH", "models/scrfd_500m.onnx")
    FACE_EMBEDDING_MODEL_PATH: str = os.getenv("FACE_EMBEDDING_MODEL_PATH", "models/adaface_ir50.onnx")
    LIVENESS_MODEL_PATH: str = os.getenv("LIVENESS_MODEL_PATH", "models/silent_face.onnx")
    ADMIN_API_KEY: str = os.getenv("ADMIN_API_KEY", "")
    ENABLE_VOTE_MOCK: bool = os.getenv("ENABLE_VOTE_MOCK", "false").lower() == "true"

    @property
    def CORS_ORIGINS(self):
        origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
        return [origin.strip() for origin in origins.split(",") if origin.strip()]


settings = Settings()
