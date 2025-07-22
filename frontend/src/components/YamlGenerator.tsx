import { useMethods } from "../contexts/MethodsContext";
import {
  Button,
  Box,
  Alert,
  ButtonGroup,
  Tooltip,
  Paper,
  Typography,
  IconButton,
  Snackbar,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import React, { useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import { useLoader } from "../contexts/LoaderContext";
import { useSweep } from "../contexts/SweepContext";
import { yamlService } from "../api/services";
import { Link } from "react-router-dom";
import Loader from "./Loader";

const YMLG = () => {
  const { methods } = useMethods();
  const [yamlFileName, setYamlFileName] = React.useState<string>("config");
  const {
    method,
    module_path,
    parameters,
    isContextValid,
    setDataPath,
    setImageKeyPath,
    setRotationAnglesDataPath,
  } = useLoader();
  const { activeSweep } = useSweep();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // New state variables for cluster commands
  const [showClusterCommands, setShowClusterCommands] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  // Add snackbar state for loader validation
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: "",
    severity: "error" as "success" | "error" | "info" | "warning",
  });

  // Generate cluster commands based on current configuration
  const getClusterCommands = () => {
    return [
      `# Log in to the cluster`,
      `ssh wilson`,
      ``,
      `# Load httomo module`,
      `module load httomo`,
      ``,
      `# Run HTTOMO with your configuration`,
      `httomo_mpi [address to your data file] ${yamlFileName}.yaml [address to your output directory]`,
    ].join("\n");
  };

  // Function to handle copying command to clipboard
  const handleCopyCommand = () => {
    navigator.clipboard.writeText(getClusterCommands());
    setCopySuccess(true);
  };

  // Function to run HTTOMO on cluster (display commands)
  const runClusterHTTOMO = () => {
    setShowClusterCommands(true);
  };

  const changeFileName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setYamlFileName(event.target.value);
  };

  const generateAndDownloadYAML = async () => {
    // Create a local copy of the parameters object
    let updatedParameters = { ...parameters };
  
    // Check if loader context is valid
    if (!isContextValid()) {
      // Automatically set required fields to "auto"
      if (!updatedParameters.data_path || updatedParameters.data_path.trim() === "") {
        updatedParameters.data_path = "auto";
        setDataPath("auto");
      }
      if (
        typeof updatedParameters.rotation_angles === "string" ||
        !updatedParameters.rotation_angles ||
        !updatedParameters.rotation_angles.data_path ||
        updatedParameters.rotation_angles.data_path.trim() === ""
      ) {
        updatedParameters.rotation_angles = "auto";
        // Also update in the context (this is optional)
        setRotationAnglesDataPath("auto");
      }
      
      // Check if we have darks and flats
      const hasDarks = updatedParameters.darks && updatedParameters.darks.file && updatedParameters.darks.file.trim() !== "";
      const hasFlats = updatedParameters.flats && updatedParameters.flats.file && updatedParameters.flats.file.trim() !== "";
      
      // If we have both darks and flats, remove image_key_path
      if (hasDarks && hasFlats) {
        delete updatedParameters.image_key_path;
      }
      // Otherwise, set it to "auto" if it's empty
      else if (!updatedParameters.image_key_path || updatedParameters.image_key_path.trim() === "") {
        updatedParameters.image_key_path = "auto";
        setImageKeyPath("auto");
      }
    }
  
    // Ensure preview is always set with null start and stop for both detector_x and detector_y
    // This happens regardless of the context validation
    updatedParameters.preview = {
      detector_x: {
        start: null,
        stop: null,
      },
      detector_y: {
        start: null,
        stop: null,
      },
    };
  
    try {
      setIsLoading(true);
      setError(null);
  
      const loaderContextObject = {
        method,
        module_path,
        parameters: updatedParameters, // Use the updated parameters object
      };
  
      // Transform methods and inject calculate_stats where needed
      const transformedMethods = methods.reduce((acc: any[], method) => {
        const transformedMethod = {
          method: method.method_name,
          module_path: method.method_module,
          parameters: { ...method.parameters },
        };
  
        if (method.method_name === "rescale_to_int") {
          acc.push({
            method: "calculate_stats",
            module_path: "httomo.methods",
            parameters: {},
            id: "statistics",
            side_outputs: {
              glob_stats: "glob_stats",
            },
          });
        }
  
        if (
          method.method_name === "find_center_vo" ||
          method.method_name === "find_center_pc"
        ) {
          acc.push({
            ...transformedMethod,
            id: "centering",
            sideoutput: { cor: "center_of_rotation" },
          });
        } else {
          acc.push(transformedMethod);
        }
  
        return acc;
      }, []);
  
      const combinedData = [loaderContextObject, ...transformedMethods];
  
      const requestData = {
        data: combinedData,
        fileName: yamlFileName,
        sweepConfig: activeSweep || null,
      };
  
      const blobData = await yamlService.generateYaml(requestData);
  
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${yamlFileName}.yaml`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating YAML:", err);
      setError("Failed to generate YAML file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  
    setSnackbarState({
      open: true,
      message: "Configuration file generated successfully",
      severity: "info",
    });
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarState({
      ...snackbarState,
      open: false,
    });
  };

  const processDataForJson = (data: any): any => {
    // Create a deep copy to avoid modifying the original
    const processedData = JSON.parse(JSON.stringify(data));

    // Helper function to recursively process objects
    const processObject = (obj: any): void => {
      for (const key in obj) {
        if (typeof obj[key] === "object" && obj[key] !== null) {
          if (Array.isArray(obj[key])) {
            processArray(obj[key]);
          } else {
            processObject(obj[key]);
          }
        } else if (
          typeof obj[key] === "string" &&
          obj[key].includes("${") &&
          !obj[key].includes("${{")
        ) {
          // Replace ${something} with ${{something}}
          obj[key] = obj[key].replace(/\$\{([^}]+)\}/g, "${{$1}}");
        }
      }
    };

    // Helper function to process arrays
    const processArray = (arr: any[]): void => {
      for (let i = 0; i < arr.length; i++) {
        if (typeof arr[i] === "object" && arr[i] !== null) {
          if (Array.isArray(arr[i])) {
            processArray(arr[i]);
          } else {
            processObject(arr[i]);
          }
        } else if (
          typeof arr[i] === "string" &&
          arr[i].includes("${") &&
          !arr[i].includes("${{")
        ) {
          // Replace ${something} with ${{something}}
          arr[i] = arr[i].replace(/\$\{([^}]+)\}/g, "${{$1}}");
        }
      }
    };

    // Start processing
    if (Array.isArray(processedData)) {
      processArray(processedData);
    } else if (typeof processedData === "object" && processedData !== null) {
      processObject(processedData);
    }

    return processedData;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 10 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <TextField
          id="standard-basic"
          label="Select a name for your config file"
          sx={{ flex: 2.5 }}
          variant="standard"
          value={yamlFileName}
          onChange={changeFileName}
        />

        <ButtonGroup variant="contained" aria-label="Basic button group">
          <Button
            startIcon={<DownloadIcon />}
            onClick={generateAndDownloadYAML}
            size="small"
            disabled={isLoading} // Only disable during loading, not for validation
          >
            {isLoading ? "Generating..." : "Get Config"}
          </Button>
          <Button
            startIcon={<PlayArrowIcon />}
            onClick={runClusterHTTOMO}
            size="small"
          >
            Run HTTOMO (cluster)
          </Button>
          <Button
            component={Link}
            to="/workflow-run"
            startIcon={<PlayArrowIcon />}
            size="small"
          >
            Run HTTOMO (Workflow Run)
          </Button>
        </ButtonGroup>
      </Box>

      {/* Cluster commands display box */}
      {showClusterCommands && (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mt: 2,
            bgcolor: "#2b2b2b",
            color: "#f8f8f8",
            position: "relative",
            fontFamily: "monospace",
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, color: "#8bc34a" }}>
            HPC Cluster Commands
          </Typography>

          <Box
            sx={{
              whiteSpace: "pre-wrap",
              overflow: "auto",
              maxHeight: "300px",
              fontSize: "0.9rem",
              py: 1,
            }}
          >
            {getClusterCommands()}
          </Box>

          <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex" }}>
            <Tooltip title="Copy to clipboard">
              <IconButton
                size="small"
                onClick={handleCopyCommand}
                sx={{ color: "#f8f8f8" }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton
                size="small"
                onClick={() => setShowClusterCommands(false)}
                sx={{ color: "#f8f8f8" }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      )}

      {/* Copy success notification */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        message="Commands copied to clipboard"
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setCopySuccess(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />

      {/* Loader validation error snackbar */}
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={handleSnackbarClose}
          severity={snackbarState.severity}
          sx={{ width: "100%" }}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default YMLG;
