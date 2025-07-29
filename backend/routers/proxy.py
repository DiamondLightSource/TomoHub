from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
import httpx
import logging

logger = logging.getLogger(__name__)

proxy_router = APIRouter(prefix="/proxy", tags=["proxy"])

@proxy_router.get("/tiff")
async def proxy_tiff(url: str = Query(..., description="The S3 URL to proxy")):
    """
    Proxy endpoint to fetch TIFF files from S3 and return them to avoid CORS issues.
    """
    try:
        logger.info(f"Proxying TIFF file from URL: {url}")
        
        # Validate that it's a reasonable URL (basic security)
        if not url.startswith(("https://", "http://")):
            raise HTTPException(status_code=400, detail="Invalid URL scheme")
        
        # Use httpx to fetch the file
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(url)
            
            if response.status_code != 200:
                logger.error(f"Failed to fetch file: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"Failed to fetch file: {response.status_code}"
                )
            
            # Get the content type from the original response
            content_type = response.headers.get("content-type", "image/tiff")
            
            logger.info(f"Successfully fetched file, size: {len(response.content)} bytes")
            
            # Return the file content with appropriate headers
            return Response(
                content=response.content,
                media_type=content_type,
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET",
                    "Access-Control-Allow-Headers": "*",
                    "Content-Length": str(len(response.content)),
                    "Cache-Control": "public, max-age=3600"  # Cache for 1 hour
                }
            )
            
    except httpx.TimeoutException:
        logger.error(f"Timeout while fetching URL: {url}")
        raise HTTPException(status_code=504, detail="Timeout while fetching file")
    
    except httpx.HTTPError as e:
        logger.error(f"HTTP error while fetching URL {url}: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Error fetching file: {str(e)}")
    
    except Exception as e:
        logger.error(f"Unexpected error while proxying URL {url}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")