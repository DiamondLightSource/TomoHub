from fastapi import FastAPI, HTTPException
import importlib
from generator import generate_method_template
from schemas import AllTemplates
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define method categories
METHOD_CATEGORIES = {
    "image-saving": {
        "httomolib.misc.images": ["save_to_images"],
        "httomolibgpu.misc.rescale": ["rescale_to_int"]
    },
    "segmentation": {
        "httomolib.misc.segm": ["binary_thresholding"]
    },
    "morphological": {
        "httomolib.misc.morph": ["data_reducer"],
        "httomolibgpu.misc.morph": ["sino_360_to_180", "data_resampler"]
    },
    "normalization": {
        "httomolibgpu.prep.normalize": ["normalize"]
    },
    "phase-retrieval": {
        "httomolib.prep.phase": ["paganin_filter"],
        "httomolibgpu.prep.phase": ["paganin_filter_savu", "paganin_filter_tomopy"]
    },
    "stripe-removal": {
        "httomolibgpu.prep.stripe": [
            "remove_stripe_based_sorting",
            "remove_stripe_ti",
            "remove_all_stripe",
            "raven_filter"
        ]
    },
    "distortion-correction": {
        "httomolibgpu.prep.alignment": ["distortion_correction_proj_discorpy"]
    },
    "rotation-center": {
        "httomolibgpu.recon.rotation": [
            "find_center_vo",
            "find_center_360",
            "find_center_pc"
        ]
    },
    "reconstruction": {
        "httomolibgpu.recon.algorithm": ["FBP", "LPRec", "SIRT", "CGLS"]
    }
}

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