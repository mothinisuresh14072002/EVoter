from typing import List

from fastapi import APIRouter, UploadFile, File

from backend.schemas.live_capture import CaptureLiveResponse
from backend.utils.image_io import validate_image, decode_image_bytes
from backend.utils.session_store import create_session
from backend.config.settings import settings
from backend.services.face_detection import detect_faces
from backend.services.quality import check_quality

router = APIRouter()


@router.post("/capture-live", response_model=CaptureLiveResponse)
async def capture_live(files: List[UploadFile] = File(...)):
    best_img = None
    best_score = -1.0
    last_reason_codes = ["no_valid_frames"]

    for file in files:
        image_bytes = await file.read()
        reason_codes = validate_image(image_bytes)
        if reason_codes:
            last_reason_codes = reason_codes
            continue

        img = decode_image_bytes(image_bytes)
        detection = detect_faces(img)
        if detection.error or not detection.faces or len(detection.faces) > 1:
            last_reason_codes = ["face_detection_failed"]
            continue

        face_box = detection.faces[0]
        quality = check_quality(img, bbox=face_box)
        if quality.is_acceptable:
            if quality.overall_score > best_score:
                best_score = quality.overall_score
                best_img = img
                last_reason_codes = []
        elif best_img is None:
            last_reason_codes = quality.reason_codes

    if best_img is None:
        return CaptureLiveResponse(
            session_id="",
            status="failed",
            liveness_result=None,
            quality_metrics={},
            reason_codes=["recapture_required"] + last_reason_codes,
        )

    session_id = create_session(
        {"image": best_img, "type": "live"},
        ttl_seconds=settings.SESSION_TTL_SECONDS,
    )

    # Liveness is intentionally NOT claimed here. It is evaluated during /verify
    # against the selected frame by the configured anti-spoofing model.
    return CaptureLiveResponse(
        session_id=session_id,
        status="success",
        liveness_result="not_evaluated",
        quality_metrics={"overall_score": best_score},
        reason_codes=["liveness_pending_verification"],
    )
