from fastapi import APIRouter
from utils.deployment import is_deployment
from utils.deployment import restrict_endpoint

system_router = APIRouter(prefix="/system", tags=["system"])

@system_router.get("/deployment")
@restrict_endpoint(allow_local=True, allow_deployment=True)
async def get_deployment_info():
    """Return deployment mode and available features to the frontend"""
    mode = "deployment" if is_deployment() else "local"
        
    return {
        "mode": mode,
    }