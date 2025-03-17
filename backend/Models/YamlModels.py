from pydantic import BaseModel
from typing import Dict, Optional,List,Any

class SweepConfig(BaseModel):
    methodId: str
    paramName: str
    sweepType: str

class YamlGenerateRequest(BaseModel):
    data: List[Dict[str, Any]]
    fileName: str
    sweepConfig: Optional[SweepConfig] = None
