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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useLoader } from "../contexts/LoaderContext";
import apiClient from "../api/client";
import { imageService } from "../api/services";
import MuiAlert, { AlertProps } from '@mui/material/Alert';

const CenterFinding = () => {
  // State for form inputs
  const [file, setFile] = useState<File | null>(null);
  const [algorithm, setAlgorithm] = useState("fbp");
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

  // Get the loader context
  const loaderContext = useLoader();

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
  
    setIsLoading(true);
    setCenterImages({});
    setCenterValues([]);
  
    try {
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

      const response = await apiClient.post("/api/reconstruction", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Reconstruction response:", response.data);
      
      setSnackbar({
        open: true,
        message: response.data.message || "Reconstruction completed successfully!",
        severity: "success"
      });
      
      if (response.data.center_images) {
        setCenterImages(response.data.center_images);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSnackbar({
        open: true,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
        severity: "error"
      });
    } finally {
      setIsLoading(false);
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
      
      <Grid container spacing={3}>
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
              <Divider sx={{ mb: 3 }} />
              
              <form onSubmit={handleSubmit}>
                {/* File Input */}
                <Box sx={{ mb: 3 }}>
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
                  {file && (
                    <Typography variant="body2" color="text.secondary">
                      Selected: {file.name}
                    </Typography>
                  )}
                </Box>

                {/* Algorithm Selection */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="algorithm-select-label">Reconstruction Algorithm</InputLabel>
                  <Select
                    labelId="algorithm-select-label"
                    value={algorithm}
                    label="Reconstruction Algorithm"
                    onChange={handleAlgorithmChange}
                    size="small"
                  >
                    <MenuItem value="fbp">FBP</MenuItem>
                    <MenuItem value="art">ART</MenuItem>
                    <MenuItem value="bart">BART</MenuItem>
                    <MenuItem value="gridrec">Gridrec</MenuItem>
                  </Select>
                </FormControl>

                {/* Start, Stop, Step Inputs */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={4}>
                    <TextField
                      label="Start"
                      type="number"
                      value={start}
                      onChange={(e) => setStart(Number(e.target.value))}
                      fullWidth
                      size="small"
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Stop"
                      type="number"
                      value={stop}
                      onChange={(e) => setStop(Number(e.target.value))}
                      fullWidth
                      size="small"
                      inputProps={{ min: start + step }}
                      error={stop <= start}
                      helperText={stop <= start ? "Must be > Start" : ""}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Step"
                      type="number"
                      value={step}
                      onChange={(e) => setStep(Number(e.target.value))}
                      fullWidth
                      size="small"
                      inputProps={{ min: 1 }}
                      error={step <= 0}
                      helperText={step <= 0 ? "Must be > 0" : ""}
                    />
                  </Grid>
                </Grid>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isLoading || !file || stop <= start || step <= 0 || !loaderContext}
                  sx={{ mb: 2 }}
                >
                  {isLoading ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={20} color="inherit" />
                      <span>Processing...</span>
                    </Stack>
                  ) : (
                    "Start Reconstruction"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {/* Results Section with Slider */}
          {centerValues.length > 0 ? (
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
                        src={imageService.getImageUrl(currentImagePath)}
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
                    Center Value: {centerValues[currentCenterIndex]}
                  </Typography>
                </Box>
                
                {/* Slider Control */}
                <Box sx={{ px: 2 }}>
                  <Typography id="center-slider" gutterBottom>
                    Center Value
                  </Typography>
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
              </CardContent>
            </Card>
          ) : (
            <Card 
              variant="outlined" 
              sx={{
                border: "1px solid #89987880",
                borderRadius: "4px",
                boxShadow: "none",
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Results Yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Set parameters and start reconstruction to see results here
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Remove the Alert component and add Snackbar at the end */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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