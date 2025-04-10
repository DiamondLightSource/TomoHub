import os
import glob
import yaml
import uuid
import json
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from utils.deployment import restrict_endpoint
import subprocess
from datetime import datetime
from Models.HttomoModels import RunResponse, StatusResponse

# Create router
httomo_router = APIRouter(
    prefix="/httomo",
    tags=["httomo"],
)

# Current process tracking variables
current_process = None
output_directory = None
process_start_time = None


@httomo_router.post("/run", response_model=RunResponse)
@restrict_endpoint(allow_local=True, allow_deployment=False)
async def run_httomo(
    data_path: str = Form(...),
    output_path: str = Form(...),
    config_file: Optional[UploadFile] = File(None),
    config_data: Optional[str] = Form(None),
    sweep_config: Optional[str] = Form(None)
):
    """Run HTTOMO with the provided configuration."""
    global current_process, output_directory, process_start_time
    
    try:
        # Check if a process is already running
        if current_process and current_process.returncode is None:
            return JSONResponse(
                status_code=400,
                content={"message": "A HTTOMO process is already running. Please wait for it to complete."}
            )
        
        # Process config
        config_path = None
        
        if config_file:
            # Use uploaded config file
            unique_id = uuid.uuid4().hex[:8]
            config_path = os.path.join("/tmp", f"httomo_config_{unique_id}.yaml")
            with open(config_path, "wb") as f:
                content = await config_file.read()
                f.write(content)
            print(f"Saved uploaded config to: {config_path}")
            
        elif config_data:
            # Generate config from provided data
            unique_id = uuid.uuid4().hex[:8]
            config_path = os.path.join("/tmp", f"httomo_config_{unique_id}.yaml")
            
            # Parse the config data
            try:
                config_data_obj = json.loads(config_data)
                
                # Convert to YAML
                yaml_content = yaml.dump(config_data_obj, sort_keys=False, default_flow_style=False)
                
                # Handle sweep config if provided
                if sweep_config:
                    sweep_config_obj = json.loads(sweep_config)
                    method_id = sweep_config_obj.get("methodId")
                    param_name = sweep_config_obj.get("paramName")
                    sweep_type = sweep_config_obj.get("sweepType")
                    
                    if method_id and param_name and sweep_type:
                        tag = "!SweepRange" if sweep_type == "range" else "!Sweep"
                        
                        # Split YAML content into entries
                        yaml_entries = yaml_content.split('- method:')
                        header = yaml_entries[0]
                        entries = ['- method:' + entry for entry in yaml_entries[1:]]
                        
                        # Process each entry
                        for i, entry in enumerate(entries):
                            # Check if this is the target method
                            if f"method: {method_id}" in entry.split('\n')[0]:
                                # Replace parameter in this entry only
                                param_pattern = f"(\\s+{param_name}:)(\\s+)"
                                import re
                                entries[i] = re.sub(param_pattern, f"\\1 {tag}\\2", entry)
                                break
                        
                        # Reconstruct the YAML content
                        yaml_content = header + ''.join(entries)
                
                # Save the YAML file
                with open(config_path, "w") as f:
                    f.write(yaml_content)
                
                print(f"Generated config from app data: {config_path}")
                
            except json.JSONDecodeError as e:
                raise HTTPException(status_code=400, detail=f"Invalid JSON in config_data: {str(e)}")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to generate config: {str(e)}")
        else:
            raise HTTPException(status_code=400, detail="Either config_file or config_data must be provided")
        
        # Create output directory if it doesn't exist
        os.makedirs(output_path, exist_ok=True)
        
        output_folder_name = f"{datetime.now().strftime('%d-%m-%Y_%H_%M_%S')}_output"
        # Construct the command
        command = [
            "httomo", "run",
            data_path,    # Path to the data
            config_path,  # Path to the config
            output_path,   # Path to the output
             "--output-folder-name", output_folder_name  # Explicit output folder name
        ]
        
        print(f"Running command: {' '.join(command)}")
        
        # Launch the process
        current_process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        log_path = os.path.join(output_path, output_folder_name, "user.log")
        
        return RunResponse(
            message="HTTOMO run started",
            status="running",
            log_path=log_path
        )
        
    except Exception as e:
        import traceback
        error_detail = f"Error: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=error_detail)

@httomo_router.get("/status", response_model=StatusResponse)
@restrict_endpoint(allow_local=True, allow_deployment=False)
async def check_httomo_status():
    """Check the status of the running HTTOMO task."""
    global current_process, output_directory
    
    try:
        if not current_process:
            return JSONResponse(
                status_code=404,
                content={"status": "not_found", "message": "No HTTOMO task is running", "error": None}
            )
        
        # Check if process has completed
        exit_code = current_process.poll()
        
        if exit_code is None:
            # Process is still running
            # Check if there are output files that might indicate progress
            status_message = "Process is running"
            
            if output_directory:
                output_dirs = glob.glob(f"{output_directory}/*_output")
                if output_dirs:
                    status_message = f"Process is running with output in {output_dirs[0]}"
            
            return StatusResponse(
                status="running",
                message=status_message,
                error=None
            )
        else:
            # Process has completed
            stderr_output = current_process.stderr.read() if current_process.stderr else ""
            
            if exit_code == 0:
                return StatusResponse(
                    status="completed",
                    message="HTTOMO process completed successfully",
                    error=None
                )
            else:
                return StatusResponse(
                    status="failed",
                    message=f"HTTOMO process failed with exit code {exit_code}",
                    error=stderr_output
                )
        
    except Exception as e:
        import traceback
        error_detail = f"Error: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        return StatusResponse(status="error", message=str(e), error=error_detail)
