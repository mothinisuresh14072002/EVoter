import time
from fastapi import APIRouter
from backend.schemas.verification import VerifyRequest, VerifyResponse
from backend.services.verification import orchestrate_verification
from backend.utils.session_store import get_session, delete_session

router = APIRouter()


def _failed_response(request_id: str, reason_code: str, start_time: float) -> VerifyResponse:
    return VerifyResponse(
        request_id=request_id,
        status="failed",
        reason_codes=[reason_code],
        processing_time_ms=(time.time() - start_time) * 1000,
    )


@router.post("/verify", response_model=VerifyResponse)
async def verify(request: VerifyRequest):
    start_time = time.time()

    try:
        ref_session = get_session(request.reference_session_id)
        live_session = get_session(request.live_session_id)

        if not ref_session or not live_session:
            return _failed_response(
                request.live_session_id,
                "session_not_found_or_expired",
                start_time,
            )

        # Session IDs are purpose-specific and must not be interchangeable.
        if ref_session.get("type") != "aadhaar" or live_session.get("type") != "live":
            return _failed_response(
                request.live_session_id,
                "invalid_session_type",
                start_time,
            )

        ref_image = ref_session.get("image")
        live_image = live_session.get("image")
        if ref_image is None or live_image is None:
            return _failed_response(
                request.live_session_id,
                "invalid_session_data",
                start_time,
            )

        result = orchestrate_verification(ref_image, live_image)

        internal_status = result["status"]
        if internal_status == "match":
            api_status = "verified"
        elif internal_status == "reject":
            api_status = "failed"
        else:
            api_status = internal_status

        return VerifyResponse(
            request_id=request.live_session_id,
            status=api_status,
            confidence_score=result.get("confidence_score"),
            liveness_result=result.get("liveness_result"),
            quality_metrics=result.get("quality_metrics", {}),
            reason_codes=result.get("reason_codes", []),
            processing_time_ms=(time.time() - start_time) * 1000,
        )
    finally:
        # Always remove temporary biometric data, including on errors or exceptions.
        delete_session(request.reference_session_id)
        delete_session(request.live_session_id)
