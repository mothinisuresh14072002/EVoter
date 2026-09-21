from pydantic import BaseModel, Field
from typing import Dict, List, Optional


class CaptureLiveResponse(BaseModel):
    session_id: str
    status: str
    liveness_result: Optional[str] = None
    quality_metrics: Dict[str, float] = Field(default_factory=dict)
    reason_codes: List[str] = Field(default_factory=list)
    processing_time_ms: Optional[float] = None
