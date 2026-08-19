from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Literal


class VerifyRequest(BaseModel):
    reference_session_id: str
    live_session_id: str


class VerifyResponse(BaseModel):
    request_id: str
    status: Literal["verified", "manual_review", "failed"]
    confidence_score: Optional[float] = None
    liveness_result: Optional[str] = None
    quality_metrics: Dict[str, float] = Field(default_factory=dict)
    reason_codes: List[str] = Field(default_factory=list)
    processing_time_ms: Optional[float] = None
