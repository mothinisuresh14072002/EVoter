from fastapi import APIRouter, UploadFile, File
from backend.schemas.aadhaar import UploadAadhaarResponse
from backend.utils.image_io import validate_image

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

    # Placeholder: Return dummy response before model integration
    return UploadAadhaarResponse(
        session_id="fake_reference_session_id_123",
        status="success",
        quality_metrics={"sharpness": 0.95},
        reason_codes=[],
        processing_time_ms=10.0
    )
