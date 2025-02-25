from fastapi import FastAPI, HTTPException
from generator import generate_method_template
from Models.MethodsTemplate import AllTemplates
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import os
from methods import METHOD_CATEGORIES,standard_tomo_loader
from httomo_backends.scripts.json_pipelines_generator import process_all_yaml_files

# Disable libhdf5 file locking since h5grove is only reading files
# This needs to be done before any import of h5py, so before h5grove import
os.environ["HDF5_USE_FILE_LOCKING"] = "FALSE"
from h5grove.fastapi_utils import router 

app = FastAPI(root_path="/api")
app.include_router(router)

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
