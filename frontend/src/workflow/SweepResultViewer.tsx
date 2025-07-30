import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Slider, 
  CircularProgress, 
  Alert,
  Divider 
} from '@mui/material';
import { proxyService } from '../api/services';

interface SweepResultViewerProps {
  workflowData: any; // The workflow data from WorkflowStatus
  start: number;
  stop: number;
  step: number;
}

interface CenterImages {
  [centerValue: string]: string; // center value -> image URL
}

interface LoadingStates {
  [centerValue: string]: boolean; // center value -> loading state
}

interface TiffMetadata {
  page_count: number;
  width: number;
  height: number;
  format: string;
  mode: string;
}

const SweepResultViewer: React.FC<SweepResultViewerProps> = ({ 
  workflowData, 
  start, 
  stop, 
  step 
}) => {
  console.log('SweepResultViewer: Received props:', {
    workflowData,
    start,
    stop,
    step
  });

  const [centerImages, setCenterImages] = useState<CenterImages>({});
  const [centerValues, setCenterValues] = useState<string[]>([]);
  const [currentCenterIndex, setCurrentCenterIndex] = useState(0);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({});
  const [error, setError] = useState<string | null>(null);
  const [tiffMetadata, setTiffMetadata] = useState<TiffMetadata | null>(null);

  // Generate center values based on start, stop, step
  const generateCenterValues = (): string[] => {
    const values: string[] = [];
    for (let i = start; i < stop; i += step) {
      values.push(i.toString());
    }
    return values;
  };

  // Extract multi-page TIFF artifact from workflow data
  const getTiffArtifact = () => {
    console.log('SweepResultViewer: getTiffArtifact called with workflowData:', workflowData);
    
    if (!workflowData?.workflow?.status) {
      console.log('SweepResultViewer: No workflow status found');
      return null;
    }

    if (workflowData.workflow.status.__typename !== 'WorkflowSucceededStatus') {
      console.log('SweepResultViewer: Workflow not in succeeded status:', workflowData.workflow.status.__typename);
      return null;
    }

    const tasks = workflowData.workflow.status.tasks || [];
    console.log('SweepResultViewer: Found tasks:', tasks);

    const generateSweepTask = tasks.find((task: any) => 
      task.name === 'generate-sweep-artifact' && task.stepType === 'Pod'
    );

    console.log('SweepResultViewer: Found generate-sweep-artifact task:', generateSweepTask);

    if (!generateSweepTask) return null;

    const tiffArtifact = generateSweepTask.artifacts?.find((artifact: any) => 
      artifact.name === 'multi-page-tiff.tif' && artifact.mimeType === 'image/tiff'
    );

    console.log('SweepResultViewer: Found TIFF artifact:', tiffArtifact);

    return tiffArtifact;
  };

  // Load individual page from server
  const loadPage = useCallback(async (tiffUrl: string, pageIndex: number, centerValue: string) => {
    if (centerImages[centerValue] || loadingStates[centerValue]) {
      return; // Already loaded or loading
    }

    console.log(`SweepResultViewer: Loading page ${pageIndex} for center ${centerValue}`);
    
    setLoadingStates(prev => ({ ...prev, [centerValue]: true }));

    try {
      const imageUrl = await proxyService.getTiffPage(tiffUrl, pageIndex);
      
      setCenterImages(prev => ({
        ...prev,
        [centerValue]: imageUrl
      }));

      console.log(`SweepResultViewer: Loaded page ${pageIndex} for center ${centerValue}`);
    } catch (err) {
      console.error(`SweepResultViewer: Error loading page ${pageIndex}:`, err);

    } finally {
      setLoadingStates(prev => ({ ...prev, [centerValue]: false }));
    }
  }, [centerImages, loadingStates]);

  // Preload adjacent pages for smooth slider experience
  const preloadAdjacentPages = useCallback(async (tiffUrl: string, currentIndex: number, centerVals: string[]) => {
    const preloadPromises: Promise<void>[] = [];
    
    // Preload current, previous, and next pages
    for (let offset = -1; offset <= 1; offset++) {
      const index = currentIndex + offset;
      if (index >= 0 && index < centerVals.length) {
        const centerValue = centerVals[index];
        if (!centerImages[centerValue] && !loadingStates[centerValue]) {
          preloadPromises.push(loadPage(tiffUrl, index, centerValue));
        }
      }
    }

    await Promise.all(preloadPromises);
  }, [centerImages, loadingStates, loadPage]);

  // Initialize TIFF processing
  const initializeTiffProcessing = async (tiffUrl: string) => {
    setIsInitialLoading(true);
    setError(null);

    try {
      console.log('SweepResultViewer: Getting TIFF metadata for URL:', tiffUrl);
      
      // Get TIFF metadata
      const metadata = await proxyService.getTiffMetadata(tiffUrl);
      console.log('SweepResultViewer: Received TIFF metadata:', metadata);
      
      setTiffMetadata(metadata);

      // Generate center values
      const centerVals = generateCenterValues();
      console.log('SweepResultViewer: Generated center values:', centerVals);

      // Validate page count matches expected center values
      if (metadata.page_count < centerVals.length) {
        console.warn(`SweepResultViewer: TIFF has ${metadata.page_count} pages but expected ${centerVals.length}`);
      }

      setCenterValues(centerVals);
      
      // Load first page immediately
      if (centerVals.length > 0) {
        setCurrentCenterIndex(0);
        await loadPage(tiffUrl, 0, centerVals[0]);
        setCurrentImageUrl(centerImages[centerVals[0]] || '');
        
        // Preload adjacent pages
        preloadAdjacentPages(tiffUrl, 0, centerVals);
      }

    } catch (err) {
      console.error('SweepResultViewer: Error initializing TIFF processing:', err);
      setError(`Failed to process TIFF file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Handle slider change
  const handleSliderChange = async (_: Event, newValue: number | number[]) => {
    const index = newValue as number;
    const centerValue = centerValues[index];
    
    setCurrentCenterIndex(index);

    if (centerImages[centerValue]) {
      // Image already loaded
      setCurrentImageUrl(centerImages[centerValue]);
    } else {
      // Load image if not already loaded
      const tiffArtifact = getTiffArtifact();
      if (tiffArtifact) {
        await loadPage(tiffArtifact.url, index, centerValue);
        setCurrentImageUrl(centerImages[centerValue] || '');
      }
    }

    // Preload adjacent pages
    const tiffArtifact = getTiffArtifact();
    if (tiffArtifact) {
      preloadAdjacentPages(tiffArtifact.url, index, centerValues);
    }
  };

  // Initialize component
  useEffect(() => {
    const tiffArtifact = getTiffArtifact();
    if (tiffArtifact) {
      console.log('SweepResultViewer: Found TIFF artifact, initializing:', tiffArtifact);
      initializeTiffProcessing(tiffArtifact.url);
    } else {
      console.log('SweepResultViewer: No TIFF artifact found');
    }
  }, [workflowData]);

  // Update current image URL when centerImages changes
  useEffect(() => {
    if (centerValues.length > 0 && currentCenterIndex < centerValues.length) {
      const currentCenterValue = centerValues[currentCenterIndex];
      if (centerImages[currentCenterValue]) {
        setCurrentImageUrl(centerImages[currentCenterValue]);
      }
    }
  }, [centerImages, currentCenterIndex, centerValues]);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(centerImages).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [centerImages]);

  // Don't render if not a successful COR workflow
  const tiffArtifact = getTiffArtifact();
  console.log('SweepResultViewer: Final tiffArtifact result:', tiffArtifact);
  
  if (!tiffArtifact) {
    console.log('SweepResultViewer: No TIFF artifact found, not rendering component');
    return null;
  }

  console.log('SweepResultViewer: Rendering component with TIFF artifact');

  const currentCenterValue = centerValues[currentCenterIndex];
  const isCurrentImageLoading = loadingStates[currentCenterValue];

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'grey.300',
        borderRadius: 1,
        p: 2,
        mt: 2,
        backgroundColor: 'grey.50',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6">
          Sweep Results
        </Typography>
        {(isInitialLoading || isCurrentImageLoading) && (
          <CircularProgress size={16} />
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isInitialLoading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading TIFF metadata and first image...
          </Typography>
        </Box>
      )}

      {!isInitialLoading && !error && centerValues.length > 0 && (
        <>
          <Divider sx={{ mb: 3 }} />
          
          {/* Image Preview */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Box 
              sx={{ 
                mb: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 400,
                width: '100%',
                overflow: 'hidden',
                border: 1,
                borderColor: 'grey.300',
                borderRadius: 1,
                backgroundColor: 'white',
                position: 'relative'
              }}
            >
              {isCurrentImageLoading && (
                <Box sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2
                }}>
                  <CircularProgress size={24} />
                </Box>
              )}
              
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt={`Reconstruction with center ${currentCenterValue}`}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    objectFit: 'contain',
                    opacity: isCurrentImageLoading ? 0.5 : 1,
                    transition: 'opacity 0.2s ease-in-out'
                  }}
                  onError={(e) => {
                    console.error("Error loading image:", e);
                    setError("Failed to load image");
                  }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {isCurrentImageLoading ? 'Loading image...' : 'Image not available'}
                </Typography>
              )}
            </Box>
            
            <Typography variant="subtitle1" fontWeight="medium">
              Centre Value: {currentCenterValue}
              {tiffMetadata && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {tiffMetadata.width} × {tiffMetadata.height}
                </Typography>
              )}
            </Typography>
          </Box>
          
          {/* Slider Control */}
          <Box sx={{ px: 2 }}>
            <Slider
              value={currentCenterIndex}
              onChange={handleSliderChange}
              min={0}
              max={centerValues.length - 1}
              step={1}
              marks={centerValues.map((value, index) => ({ 
                value: index, 
                label: index % Math.max(1, Math.floor(centerValues.length / 10)) === 0 ? value : '' 
              }))}
              valueLabelDisplay="auto"
              valueLabelFormat={(index) => centerValues[index] || ""}
              aria-labelledby="center-slider"
              sx={{ mb: 2 }}
            />
          </Box>

        </>
      )}
    </Box>
  );
};

export default SweepResultViewer;