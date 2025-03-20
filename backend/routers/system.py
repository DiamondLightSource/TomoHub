from fastapi import APIRouter
from utils.deployment import is_k8s_deployment, is_local_deployment

system_router = APIRouter(prefix="/system", tags=["system"])

@system_router.get("/deployment")
async def get_deployment_info():
    """Return deployment mode and available features to the frontend"""
    mode = "k8s" if is_k8s_deployment() else "local"
        
    return {
        "mode": mode,
    }