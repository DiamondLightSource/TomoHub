import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Alert,
  Box, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress, 
  Container, 
  Divider, 
  FormControl, 
  Grid, 
  InputLabel, 
  MenuItem, 
  Select, 
  Slider, 
  Stack, 
  TextField, 
  Typography,
  SelectChangeEvent,
  Snackbar,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useLoader } from "../contexts/LoaderContext";
import apiClient from "../api/client";
import { reconstructionService } from "../api/services";
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import Loader from '../components/Loader'
import { useCenter } from "../contexts/CenterContext";
import LogViewer from '../components/LogViewer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';

const CenterFinding = () => {
  // State for form inputs
  const [file, setFile] = useState<File | null>(null);
  const [algorithm, setAlgorithm] = useState("gridrec");
  const [start, setStart] = useState(30);
  const [stop, setStop] = useState(200);
  const [step, setStep] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "error" | "info" | "warning"
  });
  // State for results
  const [centerImages, setCenterImages] = useState<Record<string, string>>({});
  const [centerValues, setCenterValues] = useState<string[]>([]);
  const [currentCenterIndex, setCurrentCenterIndex] = useState(0);
  const [currentImagePath, setCurrentImagePath] = useState("");

  // Add state for previous job info
  const [previousFileName, setPreviousFileName] = useState<string | null>(null);

  // Get the loader context
  const loaderContext = useLoader();
  const { setSelectedCenter } = useCenter(); // Access the context

  // Add these new state variables with your other state
  const [logPath, setLogPath] = useState<string | null>(null);

  // Update center values when centerImages changes
  useEffect(() => {
    if (Object.keys(centerImages).length > 0) {
      const values = Object.keys(centerImages).sort((a, b) => Number(a) - Number(b));
      setCenterValues(values);
      
      // Set default to first image
      if (values.length > 0) {
        setCurrentCenterIndex(0);
        setCurrentImagePath(centerImages[values[0]]);
      }
    }
  }, [centerImages]);

  // Update current image when slider value changes
  useEffect(() => {
    if (centerValues.length > 0 && currentCenterIndex < centerValues.length) {
      const centerValue = centerValues[currentCenterIndex];
      setCurrentImagePath(centerImages[centerValue]);
    }
  }, [currentCenterIndex, centerValues, centerImages]);

  // Check for previous job data on component mount
  useEffect(() => {
    const checkPreviousJob = async () => {
      try {
        const previousJob = await reconstructionService.getPreviousJob();
        if (previousJob) {
          console.log("Found previous job:", previousJob);
          
          // Update form parameters
          setStart(previousJob.start);
          setStop(previousJob.stop);
          setStep(previousJob.step);
          
          // Store the file name (we don't have the actual File object)
          setPreviousFileName(previousJob.filename);
          
          // Load center images
          setCenterImages(previousJob.center_images);
          
          // Set the log path to display logs from previous run
          if (previousJob.log_path) {
            setLogPath(previousJob.log_path);
            console.log("Restored log path from previous job:", previousJob.log_path);
          }
          
          setSnackbar({
            open: true,
            message: "Previous reconstruction results loaded successfully!",
            severity: "info"
          });
        }
      } catch (error) {
        console.error("Error checking for previous job:", error);
      }
    };
    
    checkPreviousJob();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  // Handle algorithm selection
  const handleAlgorithmChange = (e: SelectChangeEvent) => {
    setAlgorithm(e.target.value);
  };
  
  // Handle slider change
  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    setCurrentCenterIndex(newValue as number);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!file) {
      setSnackbar({
        open: true,
        message: "Please select a file",
        severity: "error"
      });
      return;
    }
    
    // Add loader validation check
    if (!loaderContext || !loaderContext.isContextValid()) {
      setSnackbar({
        open: true,
        message: "Please configure the loader properly before starting your reconstruction.",
        severity: "error"
      });
      return;
    }
  
    setIsLoading(true);
    setCenterImages({});
    setCenterValues([]);
    setLogPath(null); // Reset log path
  
    try {
      await apiClient.delete("/reconstruction/tempdir");
      console.log("Deleted old temporary directories.");
      
      // Create form data to send the file and other values
      const formData = new FormData();
      formData.append("file", file);
      formData.append("algorithm", algorithm);
      formData.append("start", start.toString());
      formData.append("stop", stop.toString());
      formData.append("step", step.toString());
      
      if (loaderContext) {
        formData.append("loader_context", JSON.stringify(loaderContext));
      } else {
        throw new Error("Loader context is not available");
      }

      // First, start the reconstruction process
      const response = await apiClient.post("/api/reconstruction/centre", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log("Reconstruction started:", response.data);
      
      // Save temp_dir and filename for status checking
      const tempDir = response.data.temp_dir;
      const jobFilename = response.data.filename || file.name; // Get filename from response or use the original file
      
      // Find the log file path using temp_dir
      const findLogResponse = await apiClient.get("/api/reconstruction/find-log", {
        params: { temp_dir: tempDir }
      });
      
      if (findLogResponse.data.found || findLogResponse.data.log_path) {
        console.log("Log path:", findLogResponse.data.log_path);
        setLogPath(findLogResponse.data.log_path);
      } else {
        // If log file isn't found immediately, try again in a short while
        const findLogInterval = setInterval(async () => {
          try {
            const retryLogResponse = await apiClient.get("/api/reconstruction/find-log", {
              params: { temp_dir: tempDir }
            });
            
            if (retryLogResponse.data.found || retryLogResponse.data.log_path) {
              console.log("Found log file:", retryLogResponse.data.log_path);
              setLogPath(retryLogResponse.data.log_path);
              clearInterval(findLogInterval);
            }
          } catch (error) {
            console.error("Error finding log:", error);
          }
        }, 500);
        
        // Auto-clear after 10 seconds to avoid leaking intervals
        setTimeout(() => clearInterval(findLogInterval), 10000);
      }
      
      
      // Start polling for completion
      const checkInterval = setInterval(async () => {
        try {
          console.log("Checking job status for:", tempDir);
          const statusResponse = await apiClient.get("/reconstruction/job-status", {
            params: { 
              temp_dir: tempDir,
              start: start,     // Pass the center parameters
              stop: stop,
              step: step,
              filename: jobFilename, // Add the filename parameter here
            }
          });
          
          console.log("Job status:", statusResponse.data);
          
          if (statusResponse.data.status === "completed") {
            console.log("Job complete! Images:", statusResponse.data.images);
            
            // Update UI with results
            setCenterImages(statusResponse.data.images);
            if (Object.keys(statusResponse.data.images).length > 0) {
              // Set the center values and default to first image
              const values = Object.keys(statusResponse.data.images)
                .sort((a, b) => Number(a) - Number(b));
              setCenterValues(values);
              setCurrentCenterIndex(0);
            }
            
            // IMPORTANT: Only set isLoading to false when job is complete
            setIsLoading(false);
            
            setSnackbar({
              open: true,
              message: "Reconstruction completed successfully!",
              severity: "success"
            });
            
            clearInterval(checkInterval);
          }
        } catch (error) {
          console.error("Error checking job status:", error);
        }
      }, 2000); // Check every 2 seconds
      
    } catch (error) {
      console.error("Error submitting form:", error);
      setSnackbar({
        open: true,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
        severity: "error"
      });
      setIsLoading(false); // Only set to false on error
    }
    // REMOVE the finally block that sets isLoading to false
  };

  // Handle center selection
  const handleCenterSelection = () => {
    if (centerValues.length > 0) {
      const selectedCenter = Number(centerValues[currentCenterIndex]); // Convert to number
      setSelectedCenter(selectedCenter); // Update the context state
      setSnackbar({
        open: true,
        message: `Center value ${selectedCenter} selected!`,
        severity: "success",
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      
      <Button
        component={Link}
        to=".."
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2, color: "#899878" }}
      >
        Back
      </Button>
      
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Center Finding
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Find the optimal center of rotation for your tomography data
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
        <Loader/>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card 
            variant="outlined" 
            sx={{
              border: "1px solid #89987880",
              borderRadius: "4px",
              boxShadow: "none"
            }}
          >
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Reconstruction Parameters
              </Typography>
              <Divider sx={{ mb: 1 }} />
              
              <form onSubmit={handleSubmit}>
                {/* File Input */}
                <Box sx={{ mb: 2 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 1, width: "100%" }}
                  >
                    Select Data File
                    <input
                      type="file"
                      hidden
                      onChange={handleFileChange}
                      accept=".h5,.hdf5,.nxs,.tif,.tiff"
                    />
                  </Button>
                  {(file || previousFileName) && (
                    <Typography variant="body2" color="text.secondary">
                      Selected: {file ? file.name : previousFileName}
                      {!file && previousFileName && " (previous job)"}
                    </Typography>
                  )}
                </Box>

                {/* Algorithm Selection */}
                <FormControl fullWidth sx={{ mb: 1 }}>
                  <InputLabel id="algorithm-select-label">Reconstruction Algorithm</InputLabel>
                  <Select
                    labelId="algorithm-select-label"
                    value={algorithm}
                    label="Reconstruction Algorithm"
                    onChange={handleAlgorithmChange}
                    size="small"
                  >
                    <MenuItem value="fbp">FBP</MenuItem>
                    <MenuItem value="gridrec">Gridrec</MenuItem>
                  </Select>
                </FormControl>

                {/* Start, Stop, Step Inputs */}
                <Grid container spacing={2} sx={{ mb: 1 }}>
                  <Grid item xs={4}>
                    <Tooltip
                      title={start < 0 ? "Must be ≥ 0" : ""}
                      open={start < 0}
                      placement="bottom"
                      arrow
                    >
                      <TextField
                        label="Start"
                        type="number"
                        value={start}
                        onChange={(e) => setStart(Number(e.target.value))}
                        fullWidth
                        size="small"
                        inputProps={{ min: 0 }}
                        error={start < 0}
                      />
                    </Tooltip>
                  </Grid>
                  <Grid item xs={4}>
                    <Tooltip
                      title={stop <= start ? "Must be > Start" : ""}
                      open={stop <= start}
                      placement="bottom"
                      arrow
                    >
                      <TextField
                        label="Stop"
                        type="number"
                        value={stop}
                        onChange={(e) => setStop(Number(e.target.value))}
                        fullWidth
                        size="small"
                        inputProps={{ min: start + step }}
                        error={stop <= start}
                      />
                    </Tooltip>
                  </Grid>
                  <Grid item xs={4}>
                    <Tooltip
                      title={step <= 0 ? "Must be > 0" : ""}
                      open={step <= 0}
                      placement="bottom"
                      arrow
                    >
                      <TextField
                        label="Step"
                        type="number"
                        value={step}
                        onChange={(e) => setStep(Number(e.target.value))}
                        fullWidth
                        size="small"
                        inputProps={{ min: 1 }}
                        error={step <= 0}
                      />
                    </Tooltip>
                  </Grid>
                </Grid>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<PlayArrowIcon />}
                  disabled={
                    isLoading || 
                    ((!file && !previousFileName) || stop <= start || step <= 0 || !loaderContext)
                  }
                  sx={{ mb: 1 }}
                >
                  {isLoading ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={20} color="inherit" />
                      <span>Processing...</span>
                    </Stack>
                  ) : (
                    "Find Centre"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={12}>

          {centerValues.length > 0 ? (
            <Card 
              variant="outlined" 
              sx={{
                border: "1px solid #89987880",
                borderRadius: "4px",
                boxShadow: "none",
                mb:2
              }}
            >
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Reconstruction Results
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                {/* Image Preview */}
                <Box sx={{ mb: 3, textAlign: "center" }}>
                  <Box 
                    sx={{ 
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 500,
                      width: '100%',
                      overflow: 'hidden'
                    }}
                  >
                    {currentImagePath ? (
                      <img
                        src={reconstructionService.getImageUrl(currentImagePath)}
                        alt={`Reconstruction with center ${centerValues[currentCenterIndex]}`}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '100%', 
                          objectFit: 'contain' 
                        }}
                        onError={(e) => {
                          console.error("Error loading image:", e);
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iMTIiIHk9IjEyIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmaWxsPSIjYWFhYWFhIj5JbWFnZSBFcnJvcjwvdGV4dD48L3N2Zz4=';
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
                  />
                </Box>

                {/* Center the button */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCenterSelection}
                    disabled={centerValues.length === 0}
                    startIcon={<BookmarkAddedIcon/>}
                  >
                    Select Centre
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : ("")}


              
              <LogViewer 
                logPath={logPath} 
                isRunning={isLoading} 
              />


        </Grid>
      </Grid>

      {/* Remove the Alert component and add Snackbar at the end */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default CenterFinding;