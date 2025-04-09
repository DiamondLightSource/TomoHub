import glob
from PIL import Image
from fastapi.responses import FileResponse
import os
import json
import yaml
import tempfile
from fastapi.responses import JSONResponse
from fastapi import UploadFile, Form, HTTPException, Query, APIRouter
from Models.ReconstructionModels import ReconstructionResponse, SweepRange, sweep_range_representer 
from Models.ReconstructionModels import ReconstructionResponse, MessageResponse, PreviousJobResponse
from utils.deployment import restrict_endpoint
import asyncio
from fastapi import Request
from fastapi.responses import StreamingResponse
from datetime import datetime

reconstruction_router = APIRouter(
    prefix="/reconstruction",
    tags=["reconstruction"],
)

yaml.add_representer(SweepRange, sweep_range_representer)

@reconstruction_router.post("/centre/run", response_model=ReconstructionResponse)
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
        return ReconstructionResponse(
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

@reconstruction_router.get("/centre/image")
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

@reconstruction_router.delete("/centre/tempdir", response_model=MessageResponse)
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

@reconstruction_router.get("/centre/previous", response_model=PreviousJobResponse)
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

@reconstruction_router.get("/centre/stream-logs")
@restrict_endpoint(allow_local=True, allow_deployment=False)
async def stream_logs_sse(request: Request, log_path: str):
    """Stream log file as Server-Sent Events."""
    
    # Wait longer for log file to be created if it doesn't exist yet
    wait_count = 0
    while not os.path.exists(log_path) and wait_count < 20:  # Wait up to 10 seconds
        print(f"Waiting for log file at {log_path}, attempt {wait_count+1}/20")
        await asyncio.sleep(0.5)  # Check more frequently
        wait_count += 1
        
    if not os.path.exists(log_path):
        raise HTTPException(status_code=404, detail=f"Log file not found at {log_path} after waiting")
    
    print(f"Streaming log file: {log_path}")
    
    async def event_generator():
        """Generate SSE events from log file changes."""
        # Initial file size
        last_size = 0
        
        # Send headers for SSE
        yield "retry: 1000\n\n"  # Reconnection time in milliseconds
        
        # Initial content
        try:
            with open(log_path, 'r') as f:
                content = f.read()
                if content:
                    yield f"data: {content.replace(chr(10), chr(10)+'data: ')}\n\n"
                    last_size = len(content)
        except Exception as e:
            yield f"data: Error reading log: {str(e)}\n\n"
        
        # Keep checking for updates
        while True:
            if await request.is_disconnected():
                print("Client disconnected")
                break
                
            try:
                # Check if file exists
                if not os.path.exists(log_path):
                    yield "data: Log file no longer exists\n\n"
                    break
                
                # Check for new content
                current_size = os.path.getsize(log_path)
                
                if current_size > last_size:
                    with open(log_path, 'r') as f:
                        f.seek(last_size)
                        new_content = f.read()
                        if new_content:
                            # Format for SSE: each line needs to start with "data: "
                            # Replace newlines with "newline + data: " prefix
                            formatted = f"data: {new_content.replace(chr(10), chr(10)+'data: ')}\n\n"
                            yield formatted
                    
                    last_size = current_size
            except Exception as e:
                yield f"data: Error: {str(e)}\n\n"
                
            # Small delay between checks
            await asyncio.sleep(0.1)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )

@reconstruction_router.get("/centre/find-log")
@restrict_endpoint(allow_local=True, allow_deployment=False)
async def find_current_log(temp_dir: str = None):
    """Finds the log file in the specified temp directory or most recent one."""
    try:
        # If temp_dir is provided, use it (more reliable)
        if temp_dir:
            # Validate the path for security
            if not temp_dir.startswith('/tmp') or not os.path.exists(temp_dir):
                return {
                    "found": False, 
                    "message": f"Invalid or non-existent temp directory: {temp_dir}"
                }
                
            # Find output directory within the specified temp_dir
            output_dirs = glob.glob(f"{temp_dir}/*_output")
            if not output_dirs:
                return {
                    "found": False, 
                    "message": f"No output directory found in {temp_dir}"
                }
                
            # Get the most recent output dir (should typically be only one)
            latest_output = max(output_dirs, key=os.path.getmtime)
            
            # Look for user.log
            log_path = os.path.join(latest_output, "user.log")
            
            return {
                "found": os.path.exists(log_path),
                "log_path": log_path,
                "message": "Log file found" if os.path.exists(log_path) else "Log file path determined but file not created yet"
            }
        
        # Fallback to original logic if no temp_dir provided (for backward compatibility)
        tmp_dirs = glob.glob("/tmp/centre_reconstruction_*")
        if not tmp_dirs:
            return {"found": False, "message": "No reconstruction directory found"}
            
        # Sort by modification time (newest first)
        latest_dir = max(tmp_dirs, key=os.path.getmtime)
        
        # Find the output directory (it will end with _output)
        output_dirs = glob.glob(f"{latest_dir}/*_output")
        if not output_dirs:
            return {"found": False, "message": "No output directory found in reconstruction directory"}
            
        # Sort by modification time (newest first)
        latest_output = max(output_dirs, key=os.path.getmtime)
        
        # Look for user.log
        log_path = os.path.join(latest_output, "user.log")
        
        # Even if it doesn't exist yet, return the expected path
        return {
            "found": os.path.exists(log_path),
            "log_path": log_path,
            "message": "Log file found" if os.path.exists(log_path) else "Log file path determined but file not created yet"
        }
        
    except Exception as e :
        import traceback
        error_detail = f"Error finding log file: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        return {"found": False, "message": str(e)}
    

@reconstruction_router.get("/centre/job-status")
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
