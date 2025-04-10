from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.centre import centre_router
from routers.methods import methods_router
from routers.yaml import yaml_router
from routers.system import system_router
from routers.httomo import httomo_router
from utils.deployment import RestrictAccessMiddleware

app = FastAPI(root_path="/api")

# Apply the restriction middleware
app.add_middleware(RestrictAccessMiddleware)

# Existing middleware and routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(centre_router)
app.include_router(methods_router)
app.include_router(yaml_router)
app.include_router(system_router)
app.include_router(httomo_router)

