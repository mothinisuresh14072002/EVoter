from typing import List
import secrets
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.schemas.live_capture import CaptureLiveResponse
from backend.utils.image_io import validate_image, decode_image_bytes
from backend.utils.session_store import create_session, get_session, delete_session
from backend.config.settings import settings
from backend.services.face_detection import detect_faces
from backend.services.quality import check_quality

router = APIRouter()
CHALLENGES = ("turn_left", "turn_right")

@router.post("/live-challenge")
async def create_live_challenge():
    challenge = secrets.choice(CHALLENGES)
    challenge_id = create_session({"type": "live_challenge", "challenge": challenge, "used": False}, ttl_seconds=settings.SESSION_TTL_SECONDS)
    return {"challenge_id": challenge_id, "challenge": challenge, "expires_in_seconds": settings.SESSION_TTL_SECONDS}

def _challenge_satisfied(challenge: str, centers: List[float]) -> bool:
    if len(centers) < 3:
        return False
    delta = centers[-1] - centers[0]
    threshold = 0.08
    return (challenge == "turn_left" and delta < -threshold) or (challenge == "turn_right" and delta > threshold)

@router.post("/capture-live", response_model=CaptureLiveResponse)
async def capture_live(challenge_id: str = Form(...), files: List[UploadFile] = File(...)):
    challenge_session = get_session(challenge_id)
    if not challenge_session or challenge_session.get("type") != "live_challenge":
        raise HTTPException(status_code=400, detail="Invalid or expired live challenge")
    if challenge_session.get("used"):
        raise HTTPException(status_code=409, detail="Live challenge already used")

    candidates, centers = [], []
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
        bbox = detection.faces[0]
        quality = check_quality(img, bbox=bbox)
        if quality.is_acceptable:
            candidates.append((quality.overall_score, img))
            centers.append((bbox.x + bbox.width / 2) / max(img.shape[1], 1))
        elif not candidates:
            last_reason_codes = quality.reason_codes

    if len(candidates) < 3:
        return CaptureLiveResponse(session_id="", status="failed", liveness_result=None, quality_metrics={"frames_received": len(files), "frames_valid": len(candidates)}, reason_codes=["minimum_3_live_frames_required", *last_reason_codes])

    if not _challenge_satisfied(challenge_session["challenge"], centers):
        delete_session(challenge_id)
        return CaptureLiveResponse(session_id="", status="failed", liveness_result=None, quality_metrics={"frames_received": len(files), "frames_valid": len(candidates)}, reason_codes=["temporal_challenge_failed", f"challenge_{challenge_session['challenge']}_required"])

    delete_session(challenge_id)
    candidates.sort(key=lambda item: item[0], reverse=True)
    selected = [image for _, image in candidates[:5]]
    session_id = create_session({"images": selected, "type": "live", "frame_count": len(selected), "challenge_completed": True}, ttl_seconds=settings.SESSION_TTL_SECONDS)
    return CaptureLiveResponse(session_id=session_id, status="success", liveness_result="not_evaluated", quality_metrics={"frames_received": len(files), "frames_valid": len(candidates), "frames_selected": len(selected)}, reason_codes=["temporal_challenge_completed", "liveness_pending_verification"])
