from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.reconstruction import reconstruction_router
from routers.methods import methods_router
from routers.yaml import yaml_router

app = FastAPI(root_path="/api")

app.include_router(reconstruction_router)
app.include_router(methods_router)
app.include_router(yaml_router)

origins = [
    "*",
]

#CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


