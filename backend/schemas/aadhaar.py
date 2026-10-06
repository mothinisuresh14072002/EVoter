from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class UploadAadhaarResponse(BaseModel):
    session_id: str
    status: str
    quality_metrics: Dict[str, float] = Field(default_factory=dict)
    reason_codes: List[str] = Field(default_factory=list)
    processing_time_ms: Optional[float] = None
