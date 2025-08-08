import {
  Typography,
  Button,
  Box,
  ButtonGroup,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import React, { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ScienceIcon from '@mui/icons-material/Science';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import yaml from 'js-yaml';
import { useLoader, PreviewType } from '../contexts/LoaderContext';
import { useMethods, Method as MethodType } from '../contexts/MethodsContext';

const Alert = React.forwardRef<
  HTMLDivElement,
  import('@mui/material').AlertProps
>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Header() {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get context functions
  const loaderContext = useLoader();
  const methodsContext = useMethods();

  // Snackbar state
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarState({ ...snackbarState, open: false });
  };

  const handleConfigFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
        const reader = new FileReader();
        reader.onload = e => {
          const content = e.target?.result;
          if (typeof content === 'string') {
            try {
              const loadedData = yaml.load(content) as Array<any>;

              if (!Array.isArray(loadedData) || loadedData.length === 0) {
                setSnackbarState({
                  open: true,
                  message:
                    'Invalid YAML structure: Expected a HTTOMO YAML config file.',
                  severity: 'error',
                });
                return;
              }

              // Process Loader Configuration
              const loaderConfig = loadedData[0];
              if (loaderConfig && loaderConfig.parameters) {
                const params = loaderConfig.parameters;

                loaderContext.setDataPath(params.data_path || '');
                loaderContext.setImageKeyPath(params.image_key_path || '');

                if (params.rotation_angles?.data_path) {
                  loaderContext.setRotationAnglesDataPath(
                    params.rotation_angles.data_path
                  );
                } else if (params.rotation_angles?.user_defined) {
                  loaderContext.setUserDefinedRotationAngles(
                    params.rotation_angles.user_defined.start_angle || '',
                    params.rotation_angles.user_defined.stop_angle || '',
                    params.rotation_angles.user_defined.angles_total || ''
                  );
                } else {
                  // Clear rotation angles if not present
                  loaderContext.setRotationAnglesDataPath('');
                }

                loaderContext.removeDarksAndFlats(); // Clear existing
                if (params.darks) {
                  loaderContext.setDarks(
                    params.darks.file || '',
                    params.darks.data_path || ''
                  );
                }
                if (params.flats) {
                  loaderContext.setFlats(
                    params.flats.file || '',
                    params.flats.data_path || ''
                  );
                }

                loaderContext.removePreview(); // Clear existing
                if (params.preview?.detector_x) {
                  loaderContext.setDetectorX(
                    params.preview.detector_x as PreviewType
                  );
                }
                if (params.preview?.detector_y) {
                  loaderContext.setDetectorY(
                    params.preview.detector_y as PreviewType
                  );
                }
              } else {
                setSnackbarState({
                  open: true,
                  message:
                    'Warning: Loader configuration missing or invalid in YAML.',
                  severity: 'warning',
                });
              }

              // Process Methods Configuration
              const methodConfigs = loadedData.slice(1);
              const newMethods: MethodType[] = methodConfigs
                .filter(
                  mc =>
                    !(mc.method === 'calculate_stats' && mc.id === 'statistics')
                ) // Filter out auto-injected stats
                .map((mc: any) => ({
                  method_name: mc.method,
                  method_module: mc.module_path,
                  parameters: mc.parameters || {}, // Assuming parameters structure matches MethodType
                }))
                .filter(method => method.method_name && method.method_module); // Ensure basic validity

              methodsContext.setMethods(newMethods);

              setSnackbarState({
                open: true,
                message: 'Configuration loaded successfully!',
                severity: 'success',
              });
            } catch (error) {
              console.error(
                'Error parsing YAML or applying configuration:',
                error
              );
              setSnackbarState({
                open: true,
                message: `Failed to load configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
                severity: 'error',
              });
            }
          }
        };
        reader.onerror = () => {
          setSnackbarState({
            open: true,
            message: 'Failed to read the file.',
            severity: 'error',
          });
        };
        reader.readAsText(file);
      } else {
        setSnackbarState({
          open: true,
          message: 'Please select a YAML file (.yaml or .yml)',
          severity: 'warning',
        });
      }
    }
    // Reset the file input to allow selecting the same file again if needed
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleLoadConfigClick = () => {
    fileInputRef.current?.click(); // Trigger click on the hidden file input
  };

  return (
    <Box
      component="header"
      sx={{
        textAlign: 'center',
        py: 3,
        px: 2,
        backgroundColor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '60%', // Consider making this responsive or removing if not needed
      }}
    >
      <Typography
        variant="h3"
        component="h2"
        gutterBottom
        sx={{ fontWeight: 'bold', color: 'primary.main' }}
      >
        TomoHub | GUI for HTTOMO
      </Typography>
      <ButtonGroup
        variant="outlined"
        aria-label="main navigation button group"
        sx={{ mt: 1 }} // Adjusted margin top
        fullWidth // Makes the button group take full width of its container
      >
        <Button
          component={Link}
          to="/"
          startIcon={<MenuBookIcon />}
          sx={{
            backgroundColor: isActive('/') ? 'primary.main' : 'transparent',
            color: isActive('/') ? 'white' : 'primary.main',
            '&:hover': {
              backgroundColor: isActive('/')
                ? 'primary.dark'
                : 'rgba(25, 118, 210, 0.04)',
            },
          }}
        >
          Guide
        </Button>
        <Button
          component={Link}
          to="/methods"
          startIcon={<ScienceIcon />}
          sx={{
            backgroundColor: isActive('/methods')
              ? 'primary.main'
              : 'transparent',
            color: isActive('/methods') ? 'white' : 'primary.main',
            '&:hover': {
              backgroundColor: isActive('/methods')
                ? 'primary.dark'
                : 'rgba(25, 118, 210, 0.04)',
            },
          }}
        >
          Methods
        </Button>
        {/* Hidden file input */}
        <input
          type="file"
          accept=".yaml,.yml"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleConfigFileUpload}
        />
        <Button
          onClick={handleLoadConfigClick}
          startIcon={<UploadFileIcon />}
          variant={'outlined'}
          color="primary"
        >
          Load Config
        </Button>
        <Button
          component={Link}
          to={'/workflow-cor'}
          startIcon={<CenterFocusStrongIcon />}
          sx={{
            backgroundColor: isActive('/corfinder')
              ? 'primary.main'
              : 'transparent',
            color: isActive('/corfinder') ? 'white' : 'primary.main',
            '&:hover': {
              backgroundColor: isActive('/corfinder')
                ? 'primary.dark'
                : 'rgba(25, 118, 210, 0.04)',
              cursor: 'pointer',
            },
          }}
        >
          Centre finder
        </Button>
        <Button
          component={Link}
          to="/fullpipelines"
          startIcon={<AutoFixHighIcon />}
          sx={{
            backgroundColor: isActive('/fullpipelines')
              ? 'primary.main'
              : 'transparent',
            color: isActive('/fullpipelines') ? 'white' : 'primary.main',
            '&:hover': {
              backgroundColor: isActive('/fullpipelines')
                ? 'primary.dark'
                : 'rgba(25, 118, 210, 0.04)',
            },
          }}
        >
          Full pipelines
        </Button>
      </ButtonGroup>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarState.severity}
          sx={{ width: '100%' }}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Header;
