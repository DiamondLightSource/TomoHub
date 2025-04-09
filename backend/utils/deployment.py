import functools
import inspect
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

# Configuration variable names
DEPLOYMENT_MODE_ENV = "TOMOHUB_DEPLOYMENT_MODE"
ALLOW_EXTERNAL_ACCESS_ENV = "TOMOHUB_ALLOW_EXTERNAL_ACCESS"

def get_deployment_mode():
    """Get the current deployment mode from environment"""
    from .config import config
    return config.get(DEPLOYMENT_MODE_ENV, "local")

def is_deployment():
    """Check if running in k8s deployment mode"""
    return get_deployment_mode() == "deployment"

def is_local():
    """Check if running in local deployment mode"""
    return get_deployment_mode() == "local"

def restrict_endpoint(allow_local=True, allow_deployment=True):
    """Decorator to restrict endpoint access based on deployment mode"""
    def decorator(func):
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            if is_local() and not allow_local:
                raise HTTPException(403, "This endpoint is not available in local mode")
            if is_deployment() and not allow_deployment:
                raise HTTPException(403, "This endpoint is not available in deployment mode")
            return await func(*args, **kwargs)
        
        return async_wrapper
    return decorator

class RestrictAccessMiddleware(BaseHTTPMiddleware):
    """Middleware to restrict access based on deployment mode"""
    async def dispatch(self, request: Request, call_next):
        # In K8s mode, we trust the K8s ingress/service for access control
        if is_deployment():
            return await call_next(request)
            
        # In local mode, restrict to localhost unless explicitly allowed
        from .config import config
        client_host = request.client.host
        if client_host not in ("localhost", "127.0.0.1") and \
           config.get(ALLOW_EXTERNAL_ACCESS_ENV, "false").lower() != "true":
            return JSONResponse(status_code=401, content={
                "reason": "External access is restricted in local deployment mode"
            })
            
        return await call_next(request)