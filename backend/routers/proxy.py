from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response, JSONResponse
import httpx
import logging
from PIL import Image
from io import BytesIO
import json
import numpy as np

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

@proxy_router.get("/tiff-pages")
async def proxy_tiff_pages(
    url: str = Query(..., description="The S3 URL to proxy"),
    page: int = Query(None, description="Page number to extract (0-based). If not provided, returns metadata.")
):
    """
    Process multi-page TIFF files server-side using Pillow.
    Returns metadata (page count, dimensions) when no page parameter is provided.
    Returns individual pages as PNG when page parameter is provided.
    """
    try:
        logger.info(f"Processing TIFF pages from URL: {url}, page: {page}")
        
        # Validate URL
        if not url.startswith(("https://", "http://")):
            raise HTTPException(status_code=400, detail="Invalid URL scheme")
        
        # Fetch the TIFF file
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(url)
            
            if response.status_code != 200:
                logger.error(f"Failed to fetch TIFF file: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"Failed to fetch TIFF file: {response.status_code}"
                )
            
            logger.info(f"Fetched TIFF file, size: {len(response.content)} bytes")
        
        # Process TIFF with Pillow
        tiff_data = BytesIO(response.content)
        
        with Image.open(tiff_data) as img:
            # If no page specified, return metadata
            if page is None:
                # Count pages
                page_count = 0
                try:
                    while True:
                        img.seek(page_count)
                        page_count += 1
                except EOFError:
                    pass
                
                # Get dimensions from first page
                img.seek(0)
                width, height = img.size
                
                metadata = {
                    "page_count": page_count,
                    "width": width,
                    "height": height,
                    "format": img.format,
                    "mode": img.mode
                }
                
                logger.info(f"TIFF metadata: {metadata}")
                
                return JSONResponse(
                    content=metadata,
                    headers={
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET",
                        "Access-Control-Allow-Headers": "*",
                        "Cache-Control": "public, max-age=3600"
                    }
                )
            
            # Extract specific page
            else:
                try:
                    img.seek(page)
                    logger.info(f"Extracting page {page}, size: {img.size}")
                    
                    # Convert to RGB if necessary (TIFF might be in different modes)
                    if img.mode not in ('RGB', 'RGBA'):
                        if img.mode == 'I;16':
                            array = np.array(img)
                            normalized = (array.astype(np.uint16) - array.min()) * 255.0 / (array.max() - array.min())
                            img = Image.fromarray(normalized.astype(np.uint8))
                        img = img.convert('RGB')
                    
                    # Save as PNG to BytesIO
                    png_buffer = BytesIO()
                    img.save(png_buffer, format='PNG', optimize=True)
                    png_data = png_buffer.getvalue()
                    
                    logger.info(f"Converted page {page} to PNG, size: {len(png_data)} bytes")
                    
                    return Response(
                        content=png_data,
                        media_type="image/png",
                        headers={
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods": "GET",
                            "Access-Control-Allow-Headers": "*",
                            "Content-Length": str(len(png_data)),
                            "Cache-Control": "public, max-age=3600"
                        }
                    )
                    
                except EOFError:
                    logger.error(f"Page {page} does not exist in TIFF")
                    raise HTTPException(status_code=404, detail=f"Page {page} not found")
                except Exception as e:
                    logger.error(f"Error processing page {page}: {str(e)}")
                    raise HTTPException(status_code=500, detail=f"Error processing page: {str(e)}")
    
    except httpx.TimeoutException:
        logger.error(f"Timeout while fetching URL: {url}")
        raise HTTPException(status_code=504, detail="Timeout while fetching file")
    
    except httpx.HTTPError as e:
        logger.error(f"HTTP error while fetching URL {url}: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Error fetching file: {str(e)}")
    
    except Exception as e:
        logger.error(f"Unexpected error processing TIFF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")