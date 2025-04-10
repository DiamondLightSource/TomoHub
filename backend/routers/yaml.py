from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
import yaml
import re
from Models.YamlModels import YamlGenerateRequest
from utils.deployment import restrict_endpoint

yaml_router = APIRouter(
    prefix="/yaml",
    tags=["yaml"],
)

@yaml_router.post("/generate")
@restrict_endpoint(allow_local=True, allow_deployment=True)
async def generate_yaml(request: YamlGenerateRequest):
    try:
        # Convert data to YAML
        yaml_content = yaml.dump(request.data, sort_keys=False, default_flow_style=False)
        
        # Post-process the YAML string to add custom tags if needed
        if request.sweepConfig:
            method_id = request.sweepConfig.methodId
            param_name = request.sweepConfig.paramName
            sweep_type = request.sweepConfig.sweepType
            tag = "!SweepRange" if sweep_type == "range" else "!Sweep"
            
            # Split YAML content into entries (each method is a separate entry)
            yaml_entries = yaml_content.split('- method:')
            header = yaml_entries[0]  # Store any header content
            entries = ['- method:' + entry for entry in yaml_entries[1:]]  # Restore the "- method:" prefix
            
            # Process each entry
            for i, entry in enumerate(entries):
                # Check if this is the target method
                if f"method: {method_id}" in entry.split('\n')[0]:
                    # Replace parameter in this entry only
                    param_pattern = f"(\\s+{param_name}:)(\\s+)"
                    entries[i] = re.sub(param_pattern, f"\\1 {tag}\\2", entry)
                    break
            
            # Reconstruct the YAML content
            yaml_content = header + ''.join(entries)
        
        # Set the response headers for file download
        filename = f"{request.fileName}.yaml"
        headers = {
            'Content-Disposition': f'attachment; filename="{filename}"',
            'Content-Type': 'application/x-yaml',
        }
        
        return Response(
            content=yaml_content, 
            media_type='application/x-yaml',
            headers=headers
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating YAML: {str(e)}")