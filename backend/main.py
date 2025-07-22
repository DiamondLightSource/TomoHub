from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.methods import methods_router
from routers.yaml import yaml_router


app = FastAPI(root_path="/api")

# Existing middleware and routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(methods_router)
app.include_router(yaml_router)


