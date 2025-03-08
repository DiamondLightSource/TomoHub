from fastapi import FastAPI, HTTPException,Query
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
import glob
from PIL import Image
from fastapi.responses import FileResponse


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

class ReconstructionResponse(BaseModel):
    message: str
    output_dir: Optional[str] = None
    center_images: Dict[str, str] = {}

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
        
        # Create temporary directory in /tmp
        temp_dir = tempfile.mkdtemp(prefix="centre_reconstruction_", dir="/tmp")
        print(f"Created temporary directory: {temp_dir}")
        
        # Save the uploaded file
        file_path = os.path.join(temp_dir, file.filename)
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        print(f"Saved uploaded file to: {file_path}")
        
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
        print(f"Saved config file to: {config_path}")
        
        # Run the httomo command using subprocess
        command = [
            "httomo", "run",
            file_path,  # Path to the data
            config_path,  # Path to the config
            temp_dir  # Path to the output
        ]
        
        print(f"Running command: {' '.join(command)}")
        # Execute the command
        result = subprocess.run(command, capture_output=True, text=True)
        
        # Check if the command was successful
        if result.returncode != 0:
            print(f"Command failed: {result.stderr}")
            raise HTTPException(
                status_code=500,
                detail=f"httomo command failed: {result.stderr}"
            )
        
        print(f"Command completed successfully")
        
        # Find the output directory (ends with "_output")
        output_dirs = glob.glob(os.path.join(temp_dir, "*_output"))
        print(f"Found output directories: {output_dirs}")
        
        if not output_dirs:
            print(f"No output directories found in {temp_dir}")
            # List contents of temp directory for debugging
            print(f"Contents of {temp_dir}: {os.listdir(temp_dir)}")
            raise HTTPException(
                status_code=500,
                detail="No output directory was created by httomo"
            )
        
        # Get the first (and should be only) output directory
        output_dir = output_dirs[0]
        print(f"Using output directory: {output_dir}")
        
        # Expected path for TIF files
        tif_path = os.path.join(output_dir, "images_sweep_recon", "images8bit_tif")
        print(f"Looking for TIF files in: {tif_path}")
        
        # Check if the path exists
        if not os.path.exists(tif_path):
            print(f"Expected TIF directory not found. Contents of {output_dir}:")
            print(os.listdir(output_dir))
            
            # Try to find any TIF files recursively
            tif_files = []
            for root, dirs, files in os.walk(output_dir):
                for file in files:
                    if file.endswith('.tif'):
                        full_path = os.path.join(root, file)
                        tif_files.append(full_path)
                        print(f"Found TIF file: {full_path}")
        else:
            # Find all TIF files in the expected path
            tif_files = sorted(glob.glob(os.path.join(tif_path, "*.tif")))
            print(f"Found {len(tif_files)} TIF files in expected location:")
            for tif_file in tif_files:
                print(f"  - {tif_file}")
        
        # Create a PNG directory next to the TIF directory
        png_dir = os.path.join(os.path.dirname(tif_path), "images8bit_png")
        os.makedirs(png_dir, exist_ok=True)
        print(f"Created PNG directory: {png_dir}")
        
        # Create the mapping of center values to PNG file paths
        center_images = {}
        center_values = list(range(start, stop + 1, step))
        
        # Convert TIF files to PNG and create the mapping
        for i, tif_file in enumerate(tif_files):
            if i < len(center_values):
                # Get the center value
                center_value = center_values[i]
                
                # Create PNG filename (maintain the same numbering format as the TIF)
                tif_filename = os.path.basename(tif_file)
                png_filename = tif_filename.replace('.tif', '.png')
                png_path = os.path.join(png_dir, png_filename)
                
                # Convert TIF to PNG
                try:
                    img = Image.open(tif_file)
                    img.save(png_path)
                    print(f"Converted {tif_file} to {png_path}")
                    
                    # Add to the mapping dictionary - center value as string key
                    center_images[str(center_value)] = png_path
                except Exception as e:
                    print(f"Error converting {tif_file} to PNG: {str(e)}")
        
        print(f"Created mapping of center values to PNG files: {center_images}")
        print(center_images)
        return ReconstructionResponse(
            message=f"Reconstruction completed successfully. Algorithm: {algorithm}, Range: {start}-{stop} (step {step})",
            output_dir=output_dir,
            center_images=center_images
        )
        
    except Exception as e:
        import traceback
        error_detail = f"Error: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=error_detail)

@app.get("/image")
async def get_image(path: str = Query(...)):
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Image not found")
    
    if not path.startswith('/tmp'):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get file extension and set appropriate content type
    _, ext = os.path.splitext(path)
    media_type = None
    if ext.lower() in ['.png']:
        media_type = "image/png"
    elif ext.lower() in ['.jpg', '.jpeg']:
        media_type = "image/jpeg"
    elif ext.lower() in ['.tif', '.tiff']:
        media_type = "image/tiff"
    
    return FileResponse(path, media_type=media_type)