from fastapi import APIRouter,HTTPException,Request
from utils.deployment import is_deployment
from utils.deployment import restrict_endpoint
from fastapi.responses import StreamingResponse
import asyncio
import os

system_router = APIRouter(prefix="/system", tags=["system"])

@system_router.get("/deployment")
@restrict_endpoint(allow_local=True, allow_deployment=True)
async def get_deployment_info():
    """Return deployment mode and available features to the frontend"""
    mode = "deployment" if is_deployment() else "local"
        
    return {
        "mode": mode,
    }

@system_router.get("/stream-logs")
@restrict_endpoint(allow_local=True, allow_deployment=False)
async def stream_logs_sse(request: Request, log_path: str):
    """Stream log file as Server-Sent Events."""
    
    # Wait longer for log file to be created if it doesn't exist yet
    wait_count = 0
    while not os.path.exists(log_path) and wait_count < 20:  # Wait up to 10 seconds
        print(f"Waiting for log file at {log_path}, attempt {wait_count+1}/20")
        await asyncio.sleep(0.5)  # Check more frequently
        wait_count += 1
        
    if not os.path.exists(log_path):
        raise HTTPException(status_code=404, detail=f"Log file not found at {log_path} after waiting")
    
    print(f"Streaming log file: {log_path}")
    
    async def event_generator():
        """Generate SSE events from log file changes."""
        # Initial file size
        last_size = 0
        
        # Send headers for SSE
        yield "retry: 1000\n\n"  # Reconnection time in milliseconds
        
        # Initial content
        try:
            with open(log_path, 'r') as f:
                content = f.read()
                if content:
                    yield f"data: {content.replace(chr(10), chr(10)+'data: ')}\n\n"
                    last_size = len(content)
        except Exception as e:
            yield f"data: Error reading log: {str(e)}\n\n"
        
        # Keep checking for updates
        while True:
            if await request.is_disconnected():
                print("Client disconnected")
                break
                
            try:
                # Check if file exists
                if not os.path.exists(log_path):
                    yield "data: Log file no longer exists\n\n"
                    break
                
                # Check for new content
                current_size = os.path.getsize(log_path)
                
                if current_size > last_size:
                    with open(log_path, 'r') as f:
                        f.seek(last_size)
                        new_content = f.read()
                        if new_content:
                            # Format for SSE: each line needs to start with "data: "
                            # Replace newlines with "newline + data: " prefix
                            formatted = f"data: {new_content.replace(chr(10), chr(10)+'data: ')}\n\n"
                            yield formatted
                    
                    last_size = current_size
            except Exception as e:
                yield f"data: Error: {str(e)}\n\n"
                
            # Small delay between checks
            await asyncio.sleep(0.1)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )
