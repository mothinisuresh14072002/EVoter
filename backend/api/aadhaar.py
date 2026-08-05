from fastapi import APIRouter, UploadFile, File
from backend.schemas.aadhaar import UploadAadhaarResponse
from backend.utils.image_io import validate_image, decode_image_bytes
from backend.utils.session_store import create_session
from backend.config.settings import settings

router = APIRouter()

@router.post("/upload-aadhaar", response_model=UploadAadhaarResponse)
async def upload_aadhaar(file: UploadFile = File(...)):
    image_bytes = await file.read()
    reason_codes = validate_image(image_bytes)
    
    if reason_codes:
        return UploadAadhaarResponse(
            session_id="",
            status="failed",
            quality_metrics={},
            reason_codes=reason_codes,
        )

    # Image is valid, decode and store temporarily
    img = decode_image_bytes(image_bytes)
    session_id = create_session({"image": img, "type": "aadhaar"}, ttl_seconds=settings.SESSION_TTL_SECONDS)

    return UploadAadhaarResponse(
        session_id=session_id,
        status="success",
        quality_metrics={"sharpness": 0.95},
        reason_codes=[],
        processing_time_ms=10.0
    )
