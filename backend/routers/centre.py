import glob
from PIL import Image
from fastapi.responses import FileResponse
import os
import json
import yaml
import tempfile
from fastapi.responses import JSONResponse
from fastapi import UploadFile, Form, HTTPException, Query, APIRouter
from Models.CentreModels import CentreResponse, SweepRange, sweep_range_representer, MessageResponse, PreviousJobResponse
from utils.deployment import restrict_endpoint
import asyncio
from datetime import datetime

centre_router = APIRouter(
    prefix="/centre",
    tags=["centre"],
)

yaml.add_representer(SweepRange, sweep_range_representer)

@centre_router.post("/run", response_model=CentreResponse)
@restrict_endpoint(allow_local=True,allow_deployment=False)
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
    
        output_folder_name = f"{datetime.now().strftime('%d-%m-%Y_%H_%M_%S')}_output"
        
        # Create the command
        command = [
            "httomo", "run",
            file_path,  # Path to the data
            config_path,  # Path to the config
            temp_dir,  # Path to the output
            "--output-folder-name", output_folder_name  # Explicit output folder name
        ]
        
        # Launch process in background
        async def run_reconstruction():
            process = await asyncio.create_subprocess_exec(
                *command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            # Just wait for process to complete, don't write to log
            await process.wait()
            return process.returncode
        
        # Start the process but don't wait for it
        asyncio.create_task(run_reconstruction())
        
        log_path = os.path.join(temp_dir, output_folder_name, "user.log")
        # Return response immediately with expected log path and filename
        return CentreResponse(
            message=f"Reconstruction started. Algorithm: {algorithm}, Range: {start}-{stop} (step {step})",
            center_images={},  # Will be empty initially
            temp_dir=temp_dir,
            status="running",
            filename=file.filename,  # Add the filename to the response
            log_path=log_path
        )
        
    except Exception as e:
        import traceback
        error_detail = f"Error: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=error_detail)

@centre_router.get("/image")
@restrict_endpoint(allow_local=True,allow_deployment=False)
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

@centre_router.delete("/tempdir", response_model=MessageResponse)
@restrict_endpoint(allow_local=True,allow_deployment=False)
async def delete_temp_dirs():
    """
    Deletes all temporary directories in /tmp that start with 'centre_reconstruction_'.
    """
    try:
        # Path to the /tmp directory
        tmp_dir = "/tmp"
        
        # Find all directories starting with 'centre_reconstruction_'
        dirs_to_delete = [
            os.path.join(tmp_dir, d) for d in os.listdir(tmp_dir)
            if d.startswith("centre_reconstruction_") and os.path.isdir(os.path.join(tmp_dir, d))
        ]
        
        if not dirs_to_delete:
            return JSONResponse(content={"message": "No directories to delete."})
        
        # Delete each directory
        import shutil
        for dir_path in dirs_to_delete:
            shutil.rmtree(dir_path)
            print(f"Deleted temporary directory: {dir_path}")
        
        return MessageResponse(message=f"Deleted {len(dirs_to_delete)} directories successfully.")
    
    except Exception as e:
        import traceback
        error_detail = f"Error: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=error_detail)

@centre_router.get("/previous", response_model=PreviousJobResponse)
@restrict_endpoint(allow_local=True,allow_deployment=False)
async def get_previous_job():
    """
    Checks for any directory in /tmp starting with 'reconstruction_' and returns the job data.
    """
    try:
        tmp_dir = "/tmp"
        dirs = [
            os.path.join(tmp_dir, d) for d in os.listdir(tmp_dir)
            if d.startswith("centre_reconstruction_") and os.path.isdir(os.path.join(tmp_dir, d))
        ]

        if not dirs:
            return JSONResponse(content={"message": "No previous job found."}, status_code=404)

        # Use the first directory found
        latest_dir = dirs[0]
        job_data_path = os.path.join(latest_dir, "job_data.json")

        if not os.path.exists(job_data_path):
            return JSONResponse(content={"message": "Job data file not found."}, status_code=404)

        with open(job_data_path, "r") as f:
            job_data = json.load(f)

        return job_data

    except Exception as e:
        import traceback
        error_detail = f"Error: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=error_detail)

@centre_router.get("/status")
@restrict_endpoint(allow_local=True, allow_deployment=False)
async def check_reconstruction_outputs(
    temp_dir: str,
    start: int = Query(None),
    stop: int = Query(None), 
    step: int = Query(None),
    filename: str = Query(None)  # Add filename parameter
):
    """Check if reconstruction outputs are available and return them."""
    if not temp_dir.startswith('/tmp'):
        raise HTTPException(status_code=403, detail="Directory must be in /tmp")
    
    if not os.path.exists(temp_dir):
        return {"status": "error", "message": "Directory not found", "images": {}}
    
    # First look for output directory (it will end with _output)
    output_dirs = glob.glob(f"{temp_dir}/*_output")
    if not output_dirs:
        return {"status": "running", "message": "Output directory not found yet", "images": {}}
    
    # Get the output directory
    output_dir = max(output_dirs, key=os.path.getmtime)
    
    # Expected path for TIF files
    tif_path = os.path.join(output_dir, "images_sweep_recon", "images8bit_tif")
    print(f"Looking for TIF files in: {tif_path}")
    
    # Check if the directory exists and look for TIF files
    tif_files = []
    if os.path.exists(tif_path):
        # Find TIF files in the expected location - use * pattern to get all
        tif_files = sorted(glob.glob(os.path.join(tif_path, "*.tif")))
        print(f"Found {len(tif_files)} TIF files in expected location")
    else:
        print(f"Expected TIF directory not found. Searching recursively in {output_dir}")
        
        # Try to find any TIF files recursively as a fallback
        for root, dirs, files in os.walk(output_dir):
            for file in files:
                if file.endswith('.tif'):
                    full_path = os.path.join(root, file)
                    tif_files.append(full_path)
                    print(f"Found TIF file: {full_path}")
        
        # Sort the found files - this is important for sequential mapping
        tif_files.sort()
    
    # If no TIF files found, job is still running
    if not tif_files:
        return {"status": "running", "message": "No TIF files found yet", "images": {}}
    
    # Create a PNG directory
    png_dir = os.path.join(output_dir, "images_sweep_recon","images8bit_png")
    os.makedirs(png_dir, exist_ok=True)
    print(f"Created/verified PNG directory: {png_dir}")
    
    # Create the mapping of center values to PNG file paths
    center_images = {}
    
    # Use the provided start, stop, step values if available
    if start is not None and stop is not None and step is not None:
        print(f"Using provided center values: {start}-{stop} (step {step})")
        center_values = list(range(start, stop + 1, step))
        
        # Make sure we don't try to map more files than we have center values
        file_count = min(len(tif_files), len(center_values))
        print(f"Will map {file_count} files to center values")
        
        # Match files to center values
        for i in range(file_count):
            tif_file = tif_files[i]
            center_value = str(center_values[i])
            
            # Create PNG filename with the center value
            png_filename = f"center_{center_value}.png"
            png_path = os.path.join(png_dir, png_filename)
            
            # Convert TIF to PNG
            try:
                img = Image.open(tif_file)
                img.save(png_path, format="PNG")
                print(f"Converted {tif_file} to {png_path} with center value {center_value}")
                
                # Add to center_images dictionary
                center_images[center_value] = png_path
            except Exception as e:
                print(f"Error converting {tif_file} to PNG: {str(e)}")
                # Fall back to TIF if conversion fails
                center_images[center_value] = tif_file
    else:
        # Fallback to using arbitrary values (shouldn't ever happen with your approach)
        print("WARNING: No center parameters provided, using arbitrary values")
        start_value = 100
        step_value = 10
        
        for i, tif_file in enumerate(tif_files):
            center_value = str(start_value + i * step_value)
            
            # Continue with PNG conversion as before...
            # ...
    
    # When job is complete and we have center images, save the job data
    if center_images and start is not None and stop is not None and step is not None and filename is not None:
        try:
            # Create job_data dictionary
            job_data = {
                "start": start,
                "stop": stop,
                "step": step,
                "filename": filename,
                "center_images": center_images,
                "log_path": os.path.join(output_dir, "user.log")
            }
            
            # Save to JSON file
            job_data_path = os.path.join(temp_dir, "job_data.json")
            with open(job_data_path, "w") as f:
                json.dump(job_data, f, indent=4)
            print(f"Saved job data to: {job_data_path}")
        except Exception as e:
            print(f"Error saving job data: {str(e)}")
    
    # Return the result as before
    print(f"Found {len(center_images)} center images: {center_images}")
    return {
        "status": "completed", 
        "message": f"Found {len(center_images)} center images", 
        "images": center_images
    }
