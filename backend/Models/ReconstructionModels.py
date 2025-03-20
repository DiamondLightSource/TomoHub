from pydantic import BaseModel
from typing import Dict, Optional, List

class ReconstructionResponse(BaseModel):
    message: str
    output_dir: Optional[str] = None
    center_images: Dict[str, str] = {}
    temp_dir: Optional[str] = None

class SweepRange:
    def __init__(self, start, stop, step):
        self.start = start
        self.stop = stop
        self.step = step

# Custom representer for PyYAML
def sweep_range_representer(dumper, data):
    return dumper.represent_mapping("!SweepRange", {
        "start": data.start,
        "stop": data.stop,
        "step": data.step
    })

# New response models
class MessageResponse(BaseModel):
    """Simple message response"""
    message: str

class PreviousJobResponse(BaseModel):
    """Response model for previous job data"""
    start: int
    stop: int
    step: int
    filename: str
    center_images: Dict[str, str]
