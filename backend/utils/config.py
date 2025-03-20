import os
from dotenv import dotenv_values

path_to_this_dir = os.path.dirname(os.path.abspath(__file__))

_default_values = {
    "TOMOHUB_DEPLOYMENT_MODE": "local",  # Default to local mode
    "TOMOHUB_ALLOW_EXTERNAL_ACCESS": "false",
}

config = {
    **_default_values,
    **dotenv_values(os.path.join(path_to_this_dir, "../.env")),  # load shared development variables
    **os.environ,  # override loaded values with environment variables
}
