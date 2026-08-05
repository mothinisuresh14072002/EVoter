from fastapi import APIRouter, UploadFile, File
from backend.schemas.live_capture import CaptureLiveResponse
from backend.utils.image_io import validate_image

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

    # Placeholder: Return dummy response before model integration
    return CaptureLiveResponse(
        session_id="fake_live_session_id_456",
        status="success",
        liveness_result="passed",
        quality_metrics={"brightness": 0.88},
        reason_codes=[],
        processing_time_ms=12.0
    )
