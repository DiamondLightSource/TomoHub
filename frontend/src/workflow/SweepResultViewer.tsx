import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Slider, 
  CircularProgress, 
  Alert,
  Card,
  CardContent,
  Divider 
} from '@mui/material';

interface SweepResultViewerProps {
  workflowData: any; // The workflow data from WorkflowStatus
  start: number;
  stop: number;
  step: number;
}

interface CenterImages {
  [centerValue: string]: string; // center value -> image URL
}

const SweepResultViewer: React.FC<SweepResultViewerProps> = ({ 
  workflowData, 
  start, 
  stop, 
  step 
}) => {
  const [centerImages, setCenterImages] = useState<CenterImages>({});
  const [centerValues, setCenterValues] = useState<string[]>([]);
  const [currentCenterIndex, setCurrentCenterIndex] = useState(0);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!workflowData?.workflow?.status || workflowData.workflow.status.__typename !== 'WorkflowSucceededStatus') {
      return null;
    }

    const tasks = workflowData.workflow.status.tasks || [];
    const generateSweepTask = tasks.find((task: any) => 
      task.name === 'generate-sweep-artifact' && task.stepType === 'Pod'
    );

    if (!generateSweepTask) return null;

    const tiffArtifact = generateSweepTask.artifacts?.find((artifact: any) => 
      artifact.name === 'multi-page-tiff.tif' && artifact.mimeType === 'image/tiff'
    );

    return tiffArtifact;
  };

  // Process multi-page TIFF using Sharp library (frontend processing)
  const processTiffFile = async (tiffUrl: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch the TIFF file
      const response = await fetch(tiffUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch TIFF file: ${response.statusText}`);
      }

      const tiffBuffer = await response.arrayBuffer();
      
      // Note: Sharp doesn't work directly in browser, we need a different approach
      // Using TIFF.js for frontend TIFF processing instead
      const TIFF = await import('tiff.js');
      const tiff = new TIFF.default({ buffer: tiffBuffer });
      
      const centerVals = generateCenterValues();
      const images: CenterImages = {};

      // Process each page of the multi-page TIFF
      for (let i = 0; i < tiff.countDirectory(); i++) {
        if (i < centerVals.length) {
          tiff.setDirectory(i);
          const canvas = tiff.toCanvas();
          
          // Convert canvas to PNG blob URL
          const pngUrl = await new Promise<string>((resolve) => {
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(URL.createObjectURL(blob));
              }
            }, 'image/png');
          });
 
          images[centerVals[i]] = pngUrl;
        }
      }

      setCenterImages(images);
      setCenterValues(centerVals);
      
      // Set initial image
      if (centerVals.length > 0) {
        setCurrentCenterIndex(0);
        setCurrentImageUrl(images[centerVals[0]]);
      }

    } catch (err) {
      console.error('Error processing TIFF file:', err);
      setError(`Failed to process TIFF file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle slider change
  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    const index = newValue as number;
    setCurrentCenterIndex(index);
    if (centerValues.length > 0 && centerValues[index]) {
      setCurrentImageUrl(centerImages[centerValues[index]]);
    }
  };

  // Initialize component
  useEffect(() => {
    const tiffArtifact = getTiffArtifact();
    if (tiffArtifact) {
      processTiffFile(tiffArtifact.url);
    }
  }, [workflowData]);

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
  if (!tiffArtifact) {
    return null;
  }

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
        {isLoading && (
          <CircularProgress size={16} />
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Processing multi-page TIFF file...
          </Typography>
        </Box>
      )}

      {!isLoading && !error && centerValues.length > 0 && (
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
                backgroundColor: 'white'
              }}
            >
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt={`Reconstruction with center ${centerValues[currentCenterIndex]}`}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    objectFit: 'contain' 
                  }}
                  onError={(e) => {
                    console.error("Error loading image:", e);
                    setError("Failed to load image");
                  }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Image not available
                </Typography>
              )}
            </Box>
            
            <Typography variant="subtitle1" fontWeight="medium">
              Centre Value: {centerValues[currentCenterIndex]}
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

          <Typography variant="caption" color="text.secondary">
            {centerValues.length} images processed from center range {start} to {stop} with step {step}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default SweepResultViewer;