from fastapi import FastAPI, HTTPException
from generator import generate_method_template
from Models.MethodsTemplate import AllTemplates
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import os
from methods import METHOD_CATEGORIES,standard_tomo_loader
from httomo_backends.scripts.json_pipelines_generator import process_all_yaml_files
import os
import json
import yaml
import tempfile
import shutil
import subprocess
from typing import Optional
from pathlib import Path
from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel


app = FastAPI(root_path="/api")

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

def get_methods_templates(module_methods: Dict[str, List[str]]) -> Dict:
    """
    Helper function to generate templates for a given module and its methods
    """
    result = {}
    for module, methods in module_methods.items():
        module_templates = {}
        try:
            for method in methods:
                template = generate_method_template(module, method)
                if template:
                    module_templates[method] = template
            if module_templates:
                result[module] = module_templates
        except ImportError:
            print(f"Could not import module {module}")
    return result


# Generic endpoint generator
def create_category_endpoint(category: str):
    async def endpoint():
        try:
            methods = METHOD_CATEGORIES[category]
            result = get_methods_templates(methods)
            return AllTemplates(root=result)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    return endpoint

# Register all category endpoints
for category in METHOD_CATEGORIES.keys():
    endpoint = create_category_endpoint(category)
    app.get(f"/methods/{category}", response_model=AllTemplates)(endpoint)

@app.get("/fullpipelines")
async def get_full_pipelines():
    try:
        return process_all_yaml_files()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Main endpoint for all methods
@app.get("/methods", response_model=AllTemplates)
async def get_all_methods():
    try:
        all_templates = {}
        for category_methods in METHOD_CATEGORIES.values():
            category_templates = get_methods_templates(category_methods)
            all_templates.update(category_templates)
        return AllTemplates(root=all_templates)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/methods/loaders", response_model=AllTemplates)
async def get_loader_method():
    return standard_tomo_loader

@app.post("/runCenterFinding")
async def run_center_finding():
    pass




class ReconstructionResponse(BaseModel):
    message: str
    output_dir: Optional[str] = None

RECONSTRUCTION_DIR = "./reconstruction_data"

import yaml

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

yaml.add_representer(SweepRange, sweep_range_representer)

@app.post("/reconstruction", response_model=ReconstructionResponse)
async def reconstruction(
    file: UploadFile,
    algorithm: str = Form(...),
    start: int = Form(...),
    stop: int = Form(...),
    step: int = Form(...),
    loader_context: str = Form(...)
):
    try:
        # Parse the loader context
        loader_data = json.loads(loader_context)
        
        # Create organized temp directory
        temp_dir = os.path.join(RECONSTRUCTION_DIR, "temp_run")
        os.makedirs(temp_dir, exist_ok=True)
        
        # Create output directory
        output_dir = os.path.join(temp_dir, "output")
        os.makedirs(output_dir, exist_ok=True)
        
        # Save the uploaded file
        file_path = os.path.join(temp_dir, file.filename)
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Generate the YAML config file
        config_path = os.path.join(temp_dir, "config.yaml")
        
        # Create the config structure
        config = [
            {
                "method": loader_data["method"],
                "module_path": loader_data["module_path"],
                "parameters": loader_data["parameters"]
            },
            {
                "method": "normalize",
                "module_path": "tomopy.prep.normalize",
                "parameters": {
                    "cutoff": None,
                    "averaging": "mean"
                }
            },
            {
                "method": "minus_log",
                "module_path": "tomopy.prep.normalize",
                "parameters": {}
            },
            {
                "method": "recon",
                "module_path": "tomopy.recon.algorithm",
                "parameters": {
                    "center": SweepRange(start, stop, step),
                    "sinogram_order": False,
                    "algorithm": algorithm,
                    "init_recon": None
                }
            }
        ]

        # Save the config file
        with open(config_path, "w") as f:
            yaml.dump(config, f, default_flow_style=False)
        
        # Run the httomo command using subprocess
        command = [
            "httomo", "run",
            file_path,  # Path to the data
            config_path,  # Path to the config
            output_dir  # Path to the output
        ]
        
        # Execute the command
        result = subprocess.run(command, capture_output=True, text=True)
        
        # Check if the command was successful
        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"httomo command failed: {result.stderr}"
            )
        
        return ReconstructionResponse(
            message=f"Configuration and data stored successfully. Algorithm: {algorithm}, Range: {start}-{stop} (step {step})",
            output_dir=output_dir
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))