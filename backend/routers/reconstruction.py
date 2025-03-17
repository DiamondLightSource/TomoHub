import glob
from PIL import Image
from fastapi.responses import FileResponse
import os
import json
import yaml
import tempfile
from fastapi.responses import JSONResponse
from fastapi import UploadFile, Form, HTTPException, Query, APIRouter
import subprocess
from Models.ReconstructionModels import ReconstructionResponse, SweepRange, sweep_range_representer  # Import the models

reconstruction_router = APIRouter()

yaml.add_representer(SweepRange, sweep_range_representer)

@reconstruction_router.post("/reconstruction/centre", response_model=ReconstructionResponse)
async def reconstruction(
    file: UploadFile,
    algorithm: str = Form(...),
    start: int = Form(...),
    stop: int = Form(...),
    step: int = Form(...),
    loader_context: str = Form(...)
):
    print(f"File: {file.filename}")
    print(f"Algorithm: {algorithm}")
    print(f"Start: {start}, Stop: {stop}, Step: {step}")
    print(f"Loader Context: {loader_context}")
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

        # Add this code before returning the ReconstructionResponse
        job_data = {
            "start": start,
            "stop": stop,
            "step": step,
            "filename": file.filename,
            "center_images": center_images,  # Store the center_images dictionary
        }

        job_data_path = os.path.join(temp_dir, "job_data.json")
        with open(job_data_path, "w") as f:
            json.dump(job_data, f, indent=4)
        print(f"Saved job data to: {job_data_path}")

        return ReconstructionResponse(
            message=f"Reconstruction completed successfully. Algorithm: {algorithm}, Range: {start}-{stop} (step {step})",
            output_dir=output_dir,
            center_images=center_images,
            temp_dir=temp_dir,
        )
        
    except Exception as e:
        import traceback
        error_detail = f"Error: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=error_detail)

@reconstruction_router.get("/reconstruction/image")
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

@reconstruction_router.delete("/reconstruction/tempdir")
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
        
        return JSONResponse(content={"message": f"Deleted {len(dirs_to_delete)} directories successfully."})
    
    except Exception as e:
        import traceback
        error_detail = f"Error: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=error_detail)

@reconstruction_router.get("/reconstruction/previous")
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

        return JSONResponse(content=job_data)

    except Exception as e:
        import traceback
        error_detail = f"Error: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=error_detail)