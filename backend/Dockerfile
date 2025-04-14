FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Install git (required for pip to install from GitHub)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Copy requirements file first to leverage Docker layer caching
COPY requirements.txt .

# Install dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Install the backend API dependency directly from GitHub
RUN pip install git+https://github.com/DiamondLightSource/httomo-backends.git --no-deps

# Install additional dependencies
RUN pip install httomolibgpu --no-deps

# Copy the rest of the application files
COPY . .

# Set deployment environment variables
ENV TOMOHUB_DEPLOYMENT_MODE=deployment
ENV TOMOHUB_ALLOW_EXTERNAL_ACCESS=false

# Expose the application port
EXPOSE 8000

# Start the FastAPI application with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
