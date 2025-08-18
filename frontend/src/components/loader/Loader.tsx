import React, { useState, useEffect } from 'react'; // Added useEffect
import {
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  Modal,
  Tooltip,
  InputAdornment, // Added InputAdornment
} from '@mui/material';
import ContrastIcon from '@mui/icons-material/Contrast';
import PreviewIcon from '@mui/icons-material/Visibility'; // Icon for the preview button
import { useLoader } from '@/contexts/LoaderContext'; // Import the custom hook
import LoaderPreview from '@/components/loader/LoaderPreview'; // Import the new modal component
import InfoIcon from '@mui/icons-material/Info';

const Loader: React.FC = () => {
  const {
    parameters,
    setDataPath,
    setImageKeyPath,
    setRotationAnglesDataPath,
    setUserDefinedRotationAngles,
    setDarks,
    setFlats,
    removeDarksAndFlats,
  } = useLoader();

  const [mode, setMode] = useState('setAddress');
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // State for auto toggles
  const [autoToggles, setAutoToggles] = useState({
    dataPath: parameters.data_path === 'auto',
    imagePath: parameters.image_key_path === 'auto',
    rotationAnglePath: parameters.rotation_angles?.data_path === 'auto',
  });

  // Effect to sync autoToggles if parameters change from elsewhere (e.g. context reset)
  useEffect(() => {
    setAutoToggles({
      dataPath: parameters.data_path === 'auto',
      imagePath: parameters.image_key_path === 'auto',
      rotationAnglePath: parameters.rotation_angles?.data_path === 'auto',
    });
  }, [
    parameters.data_path,
    parameters.image_key_path,
    parameters.rotation_angles?.data_path,
  ]);

  const handleModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: string | null
  ) => {
    if (newMode !== null) {
      setMode(newMode);
      if (newMode === 'defineCustom' && autoToggles.rotationAnglePath) {
        handleAutoToggle('rotationAnglePath'); 
      }
    }
  };

  const toggleExtraFields = () => {
    if (showExtraFields) {
      removeDarksAndFlats();
    } else {
      if (autoToggles.imagePath) {
        setImageKeyPath('');
        setAutoToggles(prev => ({ ...prev, imagePath: false })); //
      }
    }
    setShowExtraFields(!showExtraFields);
  };

  const handlePreviewClick = () => {
    setIsPreviewModalOpen(true); 
  };

  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false); 
  };

  // Handler for the "auto" button toggle
  const handleAutoToggle = (
    field: 'dataPath' | 'imagePath' | 'rotationAnglePath'
  ) => {
    setAutoToggles(prevToggles => {
      const newAutoState = !prevToggles[field];
      const newValue = newAutoState ? 'auto' : '';

      if (field === 'dataPath') {
        setDataPath(newValue);
      } else if (field === 'imagePath') {
        // Only update imageKeyPath if extra fields are not shown (where imageKeyPath is visible)
        if (!showExtraFields) {
          setImageKeyPath(newValue);
        } else {
          if (newAutoState)
            setImageKeyPath('auto'); 
          else setImageKeyPath(''); 
        }
      } else if (field === 'rotationAnglePath') {
        // Only update rotationAnglesDataPath if mode is "setAddress"
        if (mode === 'setAddress') {
          setRotationAnglesDataPath(newValue);
        } else {
          if (newAutoState) setRotationAnglesDataPath('auto');
          else setRotationAnglesDataPath('');
        }
      }

      return { ...prevToggles, [field]: newAutoState };
    });
  };

  return (
    <Card
      variant="outlined"
      sx={{
        mx: 'auto',
        mb: 2,
        p: 2,
        border: '1px solid #89987880',
        borderRadius: '4px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography
          gutterBottom
          variant="h6"
          color="primary"
          component="div"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <strong>Loader</strong>
          <Tooltip
            title={
              <span>
                HTTOMO loader, used to load tomography data collected at DLS
                beamlines..{' '}
                <a
                  href="https://diamondlightsource.github.io/httomo/reference/loaders.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#90caf9', textDecoration: 'underline' }}
                >
                  Learn more
                </a>
              </span>
            }
            placement="top-start"
          >
            <InfoIcon sx={{ ml: 0.5 }} fontSize="small" />
          </Tooltip>
        </Typography>
        <Box>
          <Button
            variant="contained"
            onClick={toggleExtraFields}
            endIcon={<ContrastIcon />}
            sx={{ fontSize: '0.7rem', mr: 1 }} 
          >
            {showExtraFields ? 'Remove' : 'Load separate darks and flats'}
          </Button>
          <Button
            variant="contained"
            onClick={handlePreviewClick}
            endIcon={<PreviewIcon />}
            sx={{ fontSize: '0.7rem' }}
          >
            Enable Preview
          </Button>
        </Box>
      </Box>

      <TextField
        label="data path"
        variant="outlined"
        fullWidth
        size="small"
        value={autoToggles.dataPath ? 'auto' : parameters.data_path || ''}
        disabled={autoToggles.dataPath}
        onChange={e => {
          if (!autoToggles.dataPath) setDataPath(e.target.value);
        }}
        placeholder="path to the dataset in the input hdf5/NeXuS file containing image data"
        sx={{ mb: 1 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Button
                onClick={() => handleAutoToggle('dataPath')}
                variant={autoToggles.dataPath ? 'contained' : 'outlined'}
                size="small"
                sx={{ mr: -1 }}
              >
                auto
              </Button>
            </InputAdornment>
          ),
        }}
      />

      {!showExtraFields && (
        <TextField
          label="image path"
          variant="outlined"
          fullWidth
          size="small"
          value={
            autoToggles.imagePath ? 'auto' : parameters.image_key_path || ''
          }
          disabled={autoToggles.imagePath}
          onChange={e => {
            if (!autoToggles.imagePath) setImageKeyPath(e.target.value);
          }}
          placeholder="path to the image key in your data"
          sx={{ mb: 1 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  onClick={() => handleAutoToggle('imagePath')}
                  variant={autoToggles.imagePath ? 'contained' : 'outlined'}
                  size="small"
                  sx={{ mr: -1 }}
                >
                  auto
                </Button>
              </InputAdornment>
            ),
          }}
        />
      )}

      <ToggleButtonGroup
        value={mode}
        exclusive
        size="small"
        color="primary"
        onChange={handleModeChange}
        aria-label="Rotation Angle Mode"
        fullWidth
        sx={{ mb: 1 }}
      >
        <ToggleButton value="setAddress" aria-label="Set Address">
          use rotation angle within data
        </ToggleButton>
        <ToggleButton value="defineCustom" aria-label="Define Custom">
          set custom rotation angle
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Input Fields */}
      {mode === 'setAddress' ? (
        <TextField
          label="Path to rotation angle"
          variant="outlined"
          fullWidth
          size="small"
          value={
            autoToggles.rotationAnglePath
              ? 'auto'
              : parameters.rotation_angles.data_path || ''
          }
          disabled={autoToggles.rotationAnglePath}
          onChange={e => {
            if (!autoToggles.rotationAnglePath)
              setRotationAnglesDataPath(e.target.value);
          }}
          placeholder="Path to rotation angle dataset in your data"
          sx={{ mb: 1 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  onClick={() => handleAutoToggle('rotationAnglePath')}
                  variant={
                    autoToggles.rotationAnglePath ? 'contained' : 'outlined'
                  }
                  size="small"
                  sx={{ mr: -1 }}
                >
                  auto
                </Button>
              </InputAdornment>
            ),
          }}
        />
      ) : (
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={4}>
            <TextField
              label="Start angle"
              variant="outlined"
              fullWidth
              type="number"
              size="small"
              value={
                parameters.rotation_angles.user_defined?.start_angle || null
              }
              onChange={e =>
                setUserDefinedRotationAngles(
                  Number(e.target.value),
                  parameters.rotation_angles.user_defined?.stop_angle || 0,
                  parameters.rotation_angles.user_defined?.angles_total || 0
                )
              }
              placeholder="First angle"
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Stop angle"
              variant="outlined"
              fullWidth
              type="number"
              size="small"
              value={
                parameters.rotation_angles.user_defined?.stop_angle || null
              }
              onChange={e =>
                setUserDefinedRotationAngles(
                  parameters.rotation_angles.user_defined?.start_angle || 0,
                  Number(e.target.value),
                  parameters.rotation_angles.user_defined?.angles_total || 0
                )
              }
              placeholder="Last angle"
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Total angle"
              variant="outlined"
              fullWidth
              type="number"
              size="small"
              value={
                parameters.rotation_angles.user_defined?.angles_total || null
              }
              onChange={e =>
                setUserDefinedRotationAngles(
                  parameters.rotation_angles.user_defined?.start_angle || 0,
                  parameters.rotation_angles.user_defined?.stop_angle || 0,
                  Number(e.target.value)
                )
              }
              placeholder="Total angles between"
            />
          </Grid>
        </Grid>
      )}

      {showExtraFields && (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle1" gutterBottom>
              Darks
            </Typography>
            <TextField
              label="Path to darks file"
              variant="outlined"
              fullWidth
              type="text"
              size="small"
              value={parameters.darks?.file || ''}
              onChange={e =>
                setDarks(e.target.value, parameters.darks?.data_path || '')
              }
              sx={{ mb: 1 }}
              placeholder="path to the hdf5/NeXuS darks file "
            />
            <TextField
              label="Data path"
              variant="outlined"
              fullWidth
              size="small"
              type="text"
              value={parameters.darks?.data_path || ''}
              onChange={e =>
                setDarks(parameters.darks?.file || '', e.target.value)
              }
              sx={{ mb: 1 }}
              placeholder="dataset that contains the darks data"
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle1" gutterBottom>
              Flats
            </Typography>
            <TextField
              label="Path to flats file"
              variant="outlined"
              fullWidth
              size="small"
              type="text"
              value={parameters.flats?.file || ''}
              onChange={e =>
                setFlats(e.target.value, parameters.flats?.data_path || '')
              }
              sx={{ mb: 1 }}
              placeholder="path to the hdf5/NeXuS flats file"
            />
            <TextField
              label="Data path"
              type="text"
              variant="outlined"
              fullWidth
              size="small"
              value={parameters.flats?.data_path || ''}
              onChange={e =>
                setFlats(parameters.flats?.file || '', e.target.value)
              }
              sx={{ mb: 1 }}
              placeholder="dataset that contains the flats data"
            />
          </Grid>
        </Grid>
      )}

      <Modal open={isPreviewModalOpen} onClose={handleClosePreviewModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 1,
            borderRadius: 1,
          }}
        >
          <LoaderPreview onClose={handleClosePreviewModal} />{' '}
        </Box>
      </Modal>
    </Card>
  );
};

export default Loader;
