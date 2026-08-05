from fastapi import APIRouter
from backend.schemas.verification import VerifyRequest, VerifyResponse

router = APIRouter()

@router.post("/verify", response_model=VerifyResponse)
async def verify(request: VerifyRequest):
    # Placeholder: Return manual review with models_not_connected reason
    return VerifyResponse(
        session_id=f"{request.reference_session_id}_{request.live_session_id}",
        status="manual_review",
        liveness_result="unknown",
        quality_metrics={},
        reason_codes=["models_not_connected"],
        processing_time_ms=5.0
    )
