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
} from '@mui/material';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import { useSweep } from '../../contexts/SweepContext';
import { yamlService } from '@/api/services';
import { Link } from 'react-router-dom';
import { useHTTOMOConfig } from '@/hooks/useHTTOMOConfig';

const YMLG = () => {
  const [yamlFileName, setYamlFileName] = React.useState<string>('config');
  const { activeSweep } = useSweep();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClusterCommands, setShowClusterCommands] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'error' as 'success' | 'error' | 'info' | 'warning',
  });

  const { generateHTTOMOConfig } = useHTTOMOConfig();
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
    try {
      const combinedData = generateHTTOMOConfig();
      const requestData = {
        data: combinedData,
        fileName: yamlFileName,
        sweepConfig: activeSweep || null,
      };

      const blobData = await yamlService.generateYaml(requestData);
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

    setSnackbarState({
      open: true,
      message: 'Configuration file generated successfully',
      severity: 'info',
    });
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarState({
      ...snackbarState,
      open: false,
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
            disabled={isLoading}
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
            to="/workflow-run"
            startIcon={<PlayArrowIcon />}
            size="small"
          >
            Run HTTOMO (Workflow Run)
          </Button>
        </ButtonGroup>
      </Box>

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
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#8bc34a' }}>
            HPC Cluster Commands
          </Typography>

          <Box
            sx={{
              whiteSpace: 'pre-wrap',
              overflow: 'auto',
              maxHeight: '300px',
              fontSize: '0.9rem',
              py: 1,
            }}
          >
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
