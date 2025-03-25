import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useLoader } from "../contexts/LoaderContext";
import apiClient from "../api/client";
import LogViewer from "../components/LogViewer";
import { useMethods } from '../contexts/MethodsContext';
import { useSweep } from '../contexts/SweepContext';

const Run = () => {
  // State for form inputs
  const [configSource, setConfigSource] = useState<"app" | "custom">("app");
  const [customConfigFile, setCustomConfigFile] = useState<File | null>(null);
  const [dataFilePath, setDataFilePath] = useState("");
  const [outputDirPath, setOutputDirPath] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [logPath, setLogPath] = useState<string | null>(null);
  const { methods } = useMethods();
  const { activeSweep } = useSweep();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "error" | "info" | "warning",
  });

  // References
  const configFileInputRef = useRef<HTMLInputElement>(null);

  // Get the loader context for app-generated config
  const loaderContext = useLoader();

  // Handle snackbar close
  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle config source change
  const handleConfigSourceChange = (
    event: React.MouseEvent<HTMLElement>,
    newConfigSource: "app" | "custom" | null
  ) => {
    if (newConfigSource !== null) {
      setConfigSource(newConfigSource);
    }
  };

  // Handle custom config file selection
  const handleConfigFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCustomConfigFile(e.target.files[0]);
    }
  };

  // Handle output directory browser click
  const handleBrowseOutputDir = () => {
    setSnackbar({
      open: true,
      message: "Directory selection is not fully implemented. Please enter the path manually.",
      severity: "info",
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (configSource === "custom" && !customConfigFile) {
      setSnackbar({
        open: true,
        message: "Please select a configuration file",
        severity: "error",
      });
      return;
    }

    if (configSource === "app" && (!loaderContext || !loaderContext.isContextValid())) {
      setSnackbar({
        open: true,
        message: "Please configure the app parameters before running HTTOMO",
        severity: "error",
      });
      return;
    }

    if (!dataFilePath) {
      setSnackbar({
        open: true,
        message: "Please specify the data file path",
        severity: "error",
      });
      return;
    }

    if (!outputDirPath) {
      setSnackbar({
        open: true,
        message: "Please specify the output directory path",
        severity: "error",
      });
      return;
    }

    setIsRunning(true);
    setLogPath(null);

    try {
      // Create form data
      const formData = new FormData();
      
      if (configSource === "custom" && customConfigFile) {
        // Use uploaded config file
        formData.append("config_file", customConfigFile);
      } else if (configSource === "app" && loaderContext) {
        // Generate config from app data
        const { method, module_path, parameters } = loaderContext;
        
        // Get methods from context and transform them
        const transformedMethods = methods.reduce((acc: any[], method) => {
          // Base transformed method
          const transformedMethod = {
            method: method.method_name,
            module_path: method.method_module,
            parameters: { ...method.parameters },
          };

          // If we encounter rescale_to_int, add calculate_stats before it
          if (method.method_name === 'rescale_to_int') {
            acc.push({
              method: 'calculate_stats',
              module_path: 'httomo.methods',
              parameters: {},
              id: 'statistics',
              side_outputs: {
                glob_stats: 'glob_stats'
              }
            });
          }

          // Handle the centering methods case
          if (method.method_name === 'find_center_vo' || method.method_name === 'find_center_pc') {
            acc.push({
              ...transformedMethod,
              id: 'centering',
              sideoutput: { cor: 'center_of_rotation' },
            });
          } else {
            // Add the regular transformed method
            acc.push(transformedMethod);
          }

          return acc;
        }, []);

        // Combine LoaderContext and MethodsContext data
        const loaderContextObject = {
          method,
          module_path,
          parameters,
        };
        
        const combinedData = [loaderContextObject, ...transformedMethods];
        
        // Add config data to form
        formData.append("config_data", JSON.stringify(combinedData));
        
        // Add sweep config if available
        if (activeSweep) {
          formData.append("sweep_config", JSON.stringify(activeSweep));
        }
      }
      
      formData.append("data_path", dataFilePath);
      formData.append("output_path", outputDirPath);

      // Call the API endpoint to run HTTOMO locally
      const response = await apiClient.post("/api/httomo/run", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("HTTOMO execution started:", response.data);

      // Save log path
      if (response.data.log_path) {
        setLogPath(response.data.log_path);
      }

      // Poll for execution status
      const checkInterval = setInterval(async () => {
        try {
          const statusResponse = await apiClient.get("/api/httomo/status");

          if (statusResponse.data.status === "completed") {
            setIsRunning(false);
            clearInterval(checkInterval);
            
            setSnackbar({
              open: true,
              message: "HTTOMO execution completed successfully!",
              severity: "success",
            });
          } else if (statusResponse.data.status === "failed") {
            setIsRunning(false);
            clearInterval(checkInterval);
            
            setSnackbar({
              open: true,
              message: `HTTOMO execution failed: ${statusResponse.data.error || "Unknown error"}`,
              severity: "error",
            });
          }
        } catch (error) {
          console.error("Error checking HTTOMO status:", error);
        }
      }, 2000);
    } catch (error) {
      console.error("Error starting HTTOMO:", error);
      setSnackbar({
        open: true,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
        severity: "error",
      });
      setIsRunning(false);
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
          Run HTTOMO
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Execute HTTOMO reconstruction with your configuration
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <Card
            variant="outlined"
            sx={{
              border: "1px solid #89987880",
              borderRadius: "4px",
              boxShadow: "none",
              mb: 2,
            }}
          >
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                HTTOMO Configuration
              </Typography>
              <Divider sx={{ mb: 1 }} />

              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Config file
                  </Typography>
                  <ToggleButtonGroup
                    color="primary"
                    value={configSource}
                    exclusive
                    onChange={handleConfigSourceChange}
                    aria-label="Configuration Source"
                    fullWidth
                    sx={{ mb: 1 }}
                    size="small"
                  >
                    <ToggleButton value="app"  aria-label="app configuration">
                      Use Tomohub 
                    </ToggleButton>
                    <ToggleButton value="custom" aria-label="custom configuration">
                      Use your own
                    </ToggleButton>
                  </ToggleButtonGroup>

                  {configSource === "custom" && (
                    <Box sx={{ mt: 1 }}>
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        sx={{ width: "100%" }}
                      >
                        Select Config File
                        <input
                          type="file"
                          hidden
                          ref={configFileInputRef}
                          onChange={handleConfigFileChange}
                          accept=".yaml,.yml"
                        />
                      </Button>
                      {customConfigFile && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Selected: {customConfigFile.name}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>

                <Divider sx={{ mb:1 }} />

                {/* Data File Path - Just TextField */}
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Data File Path
                  </Typography>
                  <TextField
                    fullWidth
                    label="Path to data file"
                    value={dataFilePath}
                    onChange={(e) => setDataFilePath(e.target.value)}
                    placeholder="/path/to/your/data"
                    helperText="Enter the full path to your data file"
                    size="small"
                  />
                </Box>

                {/* Output Directory Path */}
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Output Directory Path
                  </Typography>
                  <TextField
                    fullWidth
                    label="Path to output directory"
                    value={outputDirPath}
                    onChange={(e) => setOutputDirPath(e.target.value)}
                    placeholder="/path/to/output/directory"
                    helperText="Enter the full path where results will be saved"
                    size="small"
                  />
                </Box>

                {/* Submit Button */}
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<PlayArrowIcon />}
                    disabled={isRunning}
                  >
                    {isRunning ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={20} color="inherit" />
                        <span>Running HTTOMO...</span>
                      </Stack>
                    ) : (
                      "Run HTTOMO"
                    )}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>

          {/* Log Viewer */}
          <LogViewer logPath={logPath} isRunning={isRunning} />
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default Run;