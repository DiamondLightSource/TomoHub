import { useMethods } from '../contexts/MethodsContext';
import { 
  Button, Box, Alert, ButtonGroup, Tooltip, 
  Paper, Typography, IconButton, Snackbar
} from '@mui/material';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import { useLoader } from '../contexts/LoaderContext';
import { useSweep } from '../contexts/SweepContext';
import { yamlService } from '../api/services';
import useDeployment from '../hooks/useDeployment';
import {Link} from "react-router-dom"

const YMLG = () => {
  const { methods } = useMethods();
  const [yamlFileName, setYamlFileName] = React.useState<string>('config');
  const { method, module_path, parameters, isContextValid } = useLoader();
  const { activeSweep } = useSweep();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLocal } = useDeployment();
  // New state variables for cluster commands
  const [showClusterCommands, setShowClusterCommands] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  // Add snackbar state for loader validation
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: "",
    severity: "error" as "success" | "error" | "info" | "warning"
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
      ].join('\n');
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
    // Check if loader context is valid before proceeding
    if (!isContextValid()) {
      setSnackbarState({
        open: true,
        message: "Please configure the loader before generating the config file.",
        severity: "error"
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const loaderContextObject = {
        method,
        module_path,
        parameters,
      };

      // Transform methods and inject calculate_stats where needed
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
      const combinedData = [loaderContextObject, ...transformedMethods];

      // Prepare data for the backend
      const requestData = {
        data: combinedData,
        fileName: yamlFileName,
        sweepConfig: activeSweep || null,
      };

      // Use the YAML service instead of directly using axios
      const blobData = await yamlService.generateYaml(requestData);

      // Create a download from the response blob
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${yamlFileName}.yaml`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error generating YAML:', err);
      setError('Failed to generate YAML file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarState({
      ...snackbarState,
      open: false
    });
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 10 }}>
      {error && <Alert severity="error">{error}</Alert>}
      
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
            {isLoading ? 'Generating...' : 'Get Config'}
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
            to="/run"
            startIcon={<PlayArrowIcon />}
            size="small"
            disabled={!isLocal}
          >
            Run HTTOMO (local)
          </Button>
        </ButtonGroup>
        
        {!isLocal && (
          <Tooltip title="Run HTTOMO only available in local mode">
            <HelpOutlineIcon color="disabled" sx={{ ml: 1 }} />
          </Tooltip>
        )}
      </Box>
      
      {/* Cluster commands display box */}
      {showClusterCommands && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            mt: 2, 
            bgcolor: '#2b2b2b', 
            color: '#f8f8f8',
            position: 'relative',
            fontFamily: 'monospace',
            borderRadius: 1
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#8bc34a' }}>
            HPC Cluster Commands
          </Typography>
          
          <Box sx={{ 
            whiteSpace: 'pre-wrap',
            overflow: 'auto',
            maxHeight: '300px',
            fontSize: '0.9rem',
            py: 1
          }}>
            {getClusterCommands()}
          </Box>
          
          <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex' }}>
            <Tooltip title="Copy to clipboard">
              <IconButton 
                size="small" 
                onClick={handleCopyCommand}
                sx={{ color: '#f8f8f8' }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton 
                size="small" 
                onClick={() => setShowClusterCommands(false)}
                sx={{ color: '#f8f8f8' }}
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={handleSnackbarClose}
          severity={snackbarState.severity}
          sx={{ width: '100%' }}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default YMLG;