from fastapi import FastAPI, HTTPException
import importlib
from generator import generate_method_template
from schemas import AllTemplates

app = FastAPI()

@app.get("/methods", response_model=AllTemplates)
async def get_all_methods():
    try:
        modules_list = [
            "httomolib.prep.phase",
            "httomolib.misc.images",
            "httomolib.misc.morph",
            "httomolib.misc.segm",
            "httomolibgpu.misc.morph",
            "httomolibgpu.misc.rescale",
            "httomolibgpu.prep.alignment",
            "httomolibgpu.prep.normalize",
            "httomolibgpu.prep.phase",
            "httomolibgpu.prep.stripe",
            "httomolibgpu.recon.algorithm",
            "httomolibgpu.recon.rotation"
        ]
        
        all_templates = {}
        for module_name in modules_list:
            try:
                imported_module = importlib.import_module(str(module_name))
                module_templates = {}
                
                methods_list = imported_module.__all__
                
                for method_name in methods_list:
                    template = generate_method_template(module_name, method_name)
                    module_templates[method_name] = template
                
                all_templates[module_name] = module_templates
            except ImportError:
                print(f"Could not import module {module_name}")
        
        return AllTemplates(root=all_templates)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))