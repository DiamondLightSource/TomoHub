from pydantic import BaseModel, Field, RootModel
from typing import Dict, Any, Optional, Union

class ParameterInfo(BaseModel):
    """Schema for parameter information"""
    type: str = Field(..., description="Type annotation of the parameter")
    value: Any = Field(..., description="Default or required value of the parameter")
    desc: str = Field(..., description="Description of the parameter")

class MethodTemplate(BaseModel):
    """Schema for individual method template"""
    method_name: str = Field(..., description="Name of the method")
    module_path: str = Field(..., description="Full path to the module containing the method")
    method_desc: str = Field(..., description="Description of what the method does")
    method_doc: str = Field(..., description="Link to Docs for the method")
    parameters: Dict[str, ParameterInfo] = Field(..., description="Dictionary of parameter information")

class ModuleTemplates(RootModel):
    """Schema for all methods in a module"""
    root: Dict[str, MethodTemplate] = Field(..., description="Dictionary of method templates in a module")

class AllTemplates(RootModel):
    """Schema for all modules and their methods"""
    root: Dict[str, Dict[str, MethodTemplate]] = Field(..., description="Dictionary of all modules and their method templates")
