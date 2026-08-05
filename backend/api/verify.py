import time
from fastapi import APIRouter
from backend.schemas.verification import VerifyRequest, VerifyResponse
from backend.services.verification import orchestrate_verification
from backend.utils.session_store import get_session, delete_session

router = APIRouter()

@router.post("/verify", response_model=VerifyResponse)
async def verify(request: VerifyRequest):
    start_time = time.time()
    
    # 1. Load sessions
    ref_session = get_session(request.reference_session_id)
    live_session = get_session(request.live_session_id)
    
    # 2. Verify sessions are not missing or expired
    if not ref_session or not live_session:
        return VerifyResponse(
            session_id=request.live_session_id,
            status="failed",
            reason_codes=["session_not_found_or_expired"],
            processing_time_ms=(time.time() - start_time) * 1000
        )
        
    ref_image = ref_session.get("image")
    live_image = live_session.get("image")
    
    if ref_image is None or live_image is None:
        return VerifyResponse(
            session_id=request.live_session_id,
            status="failed",
            reason_codes=["invalid_session_data"],
            processing_time_ms=(time.time() - start_time) * 1000
        )
        
    # 3. Run mock verification pipeline
    result = orchestrate_verification(ref_image, live_image)
    
    # 4. Delete temporary session data
    delete_session(request.reference_session_id)
    delete_session(request.live_session_id)
    
    # 5. Return structured response
    return VerifyResponse(
        session_id=request.live_session_id,
        status=result["status"],
        confidence_score=result.get("confidence_score"),
        liveness_result=result.get("liveness_result"),
        quality_metrics=result.get("quality_metrics", {}),
        reason_codes=result.get("reason_codes", []),
        processing_time_ms=(time.time() - start_time) * 1000
    )
