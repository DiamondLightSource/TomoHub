from pydantic import BaseModel
from typing import Dict, Optional, List

class RunResponse(BaseModel):
    message: str
    status: str = "running"
    log_path: Optional[str] = None

class StatusResponse(BaseModel):
    status: str
    message: str
    error: Optional[str] = None
