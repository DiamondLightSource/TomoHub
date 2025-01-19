import argparse
import importlib
import inspect
import os
import re
from typing import Any, List, Dict
import yaml
import inspect
import importlib
from typing import Dict, Union

def _get_discard_params() -> List[str]:
    """
    Returns: a List of parameters to discard inorder to work with httomo as they are not needed
    for users
    """
    discard_params = [
        "in_file",
        "data_in",
        "tomo",
        "arr",
        "prj",
        "data",
        "ncore",
        "nchunk",
        "flats",
        "flat",
        "dark",
        "darks",
        "theta",
        "out",
        "ang",
        "comm_rank",
        "out_dir",
        "angles",
        "gpu_id",
        "comm",
        "offset",
        "shift_xy",
        "step_xy",
        "jpeg_quality",
        "watermark_vals",
    ]
    return discard_params

def _get_mustchange_params() ->List[str]:
    mustchange_params = [
        "proj1",
        "proj2",
        "axis",
        "asynchronous",
        "center",
        "glob_stats",
        "overlap"
    ]
    return mustchange_params

def set_param_value(name: str):
    if name in ["proj1", "proj2","axis"]:
        return "auto"            
    elif name == "kwargs":
        # params_dict["#additional parameters"] = "AVAILABLE"
        # parsing hashtag to yaml comes with quotes, for now we simply ignore the field
        pass
    elif name == "asynchronous":
        return True
    elif name == "center":
        # Temporary value
        return "${{centering.side_outputs.centre_of_rotation}}"
    elif name == "glob_stats":
        return "${{statistics.side_outputs.glob_stats}}"
    elif name == "overlap":
        return "${{centering.side_outputs.overlap}}"
    else:
        return "REQUIRED"

def generate_method_template(module_name: str, method_name: str) -> Dict:
    """
    Generate a comprehensive method template with detailed parameter information.
    
    Parameters
    ----------
    module_name : str
        The name of the module containing the method
    method_name : str
        The name of the method to analyze
    
    Returns
    -------
    Dict
        A dictionary containing method details and parameter information
    """
    
    # Getting the discarded params list 
    discard_params = _get_discard_params()
    mustchange_params = _get_mustchange_params()

    # Import the module
    imported_module = importlib.import_module(str(module_name))
    
    # Get the method 
    method = getattr(imported_module, method_name)
    
    # Get method signature and docstring
    method_signature = inspect.signature(method)
    method_docstring = inspect.getdoc(method) or ""
    
    # Parse docstring for parameter descriptions
    docstring_params = parse_docstring(method_docstring)

    # Prepare parameters dictionary
    parameters_dict = {}
    
    for name, param in method_signature.parameters.items():
        if name not in discard_params:
        
            # Get parameter type
            param_type = "Any"
            if param.annotation != inspect.Parameter.empty:
                param_type = _convert_type_to_string(param.annotation)
        
            # Get default value

            default_value = (
                    "REQUIRED" if (param.default == inspect.Parameter.empty and name not in mustchange_params) else
                    param.default if (name not in mustchange_params) 
                    else set_param_value(name)
            )
        
            # Get parameter description from docstring
            param_desc = ""
            if 'parameters' in docstring_params and name in docstring_params['parameters']:
                param_info = docstring_params['parameters'].get(name, {})
                param_desc = param_info.get('description', '')
            # Create parameter entry
            parameters_dict[name] = {
                "type": param_type,
                "value": default_value,
                "desc": param_desc,

            }
    
    # Construct method dictionary
    if(module_name.split(".")[0]=="httomolib"):
        linkToDoc = f"https://diamondlightsource.github.io/httomolib/api/{module_name}.html"
    else:
        linkToDoc = f"https://diamondlightsource.github.io/httomolibgpu/api/{module_name}.html"
        
    method_dict = {
        "method_name": method_name,
        "module_path": module_name,
        "method_desc" :docstring_params["desc"],
        "method_doc" : linkToDoc,
        "parameters": parameters_dict
    }
    
    return method_dict

import re

def parse_docstring(docstring):
    """
    Parse a docstring to extract description and parameter information.
    
    Parameters
    ----------
    docstring : str
        The docstring to parse
    
    Returns
    -------
    Dict
        A dictionary containing description and parameter details
    """
    # Remove citations in the format :cite:`something`
    docstring = re.sub(r':cite:`[^`]+`', '', docstring)
    
    # Split the docstring into sections
    sections = re.split(r'\n(Parameters|Raises|Returns)\n-+', docstring)
    
    # Clean and extract first sentence
    description_text = sections[0].strip().replace('\n', ' ')
    
    # Match the first sentence (ending with a period)
    first_sentence_match = re.match(r'^(.*?\.)(?:\s|$)', description_text)
    description = first_sentence_match.group(1).strip() if first_sentence_match else description_text
    
    # Initialize parameters dictionary
    parameters = {}
    
    # If there's a Parameters section
    if len(sections) > 1 and 'Parameters' in sections:
        # Find the index of the Parameters section
        param_index = sections.index('Parameters') + 1
        
        # Split parameters section into lines
        param_lines = sections[param_index].strip().split('\n')
        
        # Regex to match parameter definitions
        param_pattern = re.compile(r'^(\w+)\s*:\s*(.+)')
        
        current_param = None
        for line in param_lines:
            stripped = line.strip()
            
            # Check if line is a new parameter definition
            param_match = param_pattern.match(stripped)
            if param_match:
                current_param = param_match.group(1)
                param_type = param_match.group(2)
                parameters[current_param] = {
                    'type': param_type,
                    'description': ''
                }
            elif current_param:
                # Avoid adding lines that look like new parameter definitions
                if not re.match(r'^\w+\s*:', stripped) and stripped:
                    # Add to description, preserving first line if empty
                    if not parameters[current_param]['description']:
                        parameters[current_param]['description'] = stripped
                    else:
                        parameters[current_param]['description'] += ' ' + stripped
    
    return {
        'desc': description,
        'parameters': parameters
    }


def _convert_type_to_string(type_annotation):
    """Convert type annotation to a readable string representation"""
    # Handle Optional[X] which is Union[X, NoneType]
    if hasattr(type_annotation, '__origin__') and type_annotation.__origin__ is Union:
        args = type_annotation.__args__
        # Check if Union contains NoneType (Optional case)
        if len(args) == 2 and type(None) in args:
            # Find the non-NoneType argument
            non_none_arg = next(arg for arg in args if arg is not type(None))
            return f"Optional[{_convert_type_to_string(non_none_arg)}]"
        # General Union case
        return f"Union[{', '.join(_convert_type_to_string(arg) for arg in args)}]"

    # Handle complex generic types like List, Dict, etc.
    if hasattr(type_annotation, '__origin__'):
        origin = type_annotation.__origin__.__name__
        args = [_convert_type_to_string(arg) for arg in type_annotation.__args__]
        return f"{origin}[{', '.join(args)}]"

    # Handle standard types
    if hasattr(type_annotation, '__name__'):
        return type_annotation.__name__

    # Fallback for unknown annotations
    return str(type_annotation)


# if __name__ == "__main__":
#     current_dir = os.path.basename(os.path.abspath(os.curdir))
#     args = get_args()
#     path_to_modules = args.input
#     output_folder = args.output
#     return_val = yaml_generator(path_to_modules, output_folder)
#     if return_val == 0:
#         print("The methods as YAML templates have been successfully generated!")