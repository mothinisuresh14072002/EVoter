from pydantic import BaseModel
from typing import Dict, List, Optional

class CaptureLiveResponse(BaseModel):
    session_id: str
    status: str
    liveness_result: Optional[str] = None
    quality_metrics: Dict[str, float] = {}
    reason_codes: List[str] = []
    processing_time_ms: Optional[float] = None
