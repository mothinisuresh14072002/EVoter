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
    candidates = []
    last_reason_codes = ["no_valid_frames"]

    for file in files:
        image_bytes = await file.read()
        reason_codes = validate_image(image_bytes)
        if reason_codes:
            last_reason_codes = reason_codes
            continue

        img = decode_image_bytes(image_bytes)
        detection = detect_faces(img)
        if detection.error or len(detection.faces) != 1:
            last_reason_codes = ["face_detection_failed"]
            continue

        face_box = detection.faces[0]
        quality = check_quality(img, bbox=face_box)
        if quality.is_acceptable:
            candidates.append((quality.overall_score, img))
        elif not candidates:
            last_reason_codes = quality.reason_codes

    # A single still image is insufficient for production verification.
    if len(candidates) < 3:
        return CaptureLiveResponse(
            session_id="",
            status="failed",
            liveness_result=None,
            quality_metrics={"frames_received": len(files), "frames_valid": len(candidates)},
            reason_codes=["minimum_3_live_frames_required", *last_reason_codes],
        )

    candidates.sort(key=lambda item: item[0], reverse=True)
    selected = [image for _, image in candidates[:5]]
    session_id = create_session(
        {"images": selected, "type": "live", "frame_count": len(selected)},
        ttl_seconds=settings.SESSION_TTL_SECONDS,
    )

    return CaptureLiveResponse(
        session_id=session_id,
        status="success",
        liveness_result="not_evaluated",
        quality_metrics={
            "frames_received": len(files),
            "frames_valid": len(candidates),
            "frames_selected": len(selected),
        },
        reason_codes=["liveness_pending_verification"],
    )
