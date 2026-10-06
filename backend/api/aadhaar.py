import time

from fastapi import APIRouter, File, UploadFile

from backend.config.settings import settings
from backend.schemas.aadhaar import UploadAadhaarResponse
from backend.services.face_detection import detect_faces
from backend.services.quality import check_quality
from backend.utils.image_io import decode_image_bytes, validate_image
from backend.utils.session_store import create_session

router = APIRouter()


@router.post("/upload-reference", response_model=UploadAadhaarResponse)
@router.post("/upload-aadhaar", response_model=UploadAadhaarResponse)
async def upload_reference(file: UploadFile = File(...)):
    start_time = time.time()
    image_bytes = await file.read()
    reason_codes = validate_image(image_bytes)

    if reason_codes:
        return UploadAadhaarResponse(
            session_id="",
            status="failed",
            quality_metrics={},
            reason_codes=reason_codes,
            processing_time_ms=(time.time() - start_time) * 1000,
        )

    image = decode_image_bytes(image_bytes)
    detection = detect_faces(image)
    if detection.error or len(detection.faces) != 1:
        return UploadAadhaarResponse(
            session_id="",
            status="failed",
            quality_metrics={},
            reason_codes=["reference_requires_exactly_one_face"],
            processing_time_ms=(time.time() - start_time) * 1000,
        )

    quality = check_quality(image, bbox=detection.faces[0])
    if not quality.is_acceptable:
        return UploadAadhaarResponse(
            session_id="",
            status="failed",
            quality_metrics=quality.metrics,
            reason_codes=quality.reason_codes,
            processing_time_ms=(time.time() - start_time) * 1000,
        )

    session_id = create_session(
        {"image": image, "type": "aadhaar"},
        ttl_seconds=settings.SESSION_TTL_SECONDS,
    )

    return UploadAadhaarResponse(
        session_id=session_id,
        status="success",
        quality_metrics=quality.metrics,
        reason_codes=[],
        processing_time_ms=(time.time() - start_time) * 1000,
    )
