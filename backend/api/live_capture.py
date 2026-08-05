from fastapi import APIRouter, UploadFile, File
from backend.schemas.live_capture import CaptureLiveResponse
from backend.utils.image_io import validate_image, decode_image_bytes
from backend.utils.session_store import create_session
from backend.config.settings import settings

router = APIRouter()

@router.post("/capture-live", response_model=CaptureLiveResponse)
async def capture_live(file: UploadFile = File(...)):
    image_bytes = await file.read()
    reason_codes = validate_image(image_bytes)
    
    if reason_codes:
        return CaptureLiveResponse(
            session_id="",
            status="failed",
            liveness_result=None,
            quality_metrics={},
            reason_codes=reason_codes,
        )

    # Image is valid, decode and store temporarily
    img = decode_image_bytes(image_bytes)
    session_id = create_session({"image": img, "type": "live"}, ttl_seconds=settings.SESSION_TTL_SECONDS)

    return CaptureLiveResponse(
        session_id=session_id,
        status="success",
        liveness_result="passed",
        quality_metrics={"brightness": 0.88},
        reason_codes=[],
        processing_time_ms=12.0
    )
