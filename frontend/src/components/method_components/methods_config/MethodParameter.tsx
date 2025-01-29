import React, { useState } from 'react';
import {
  Grid,
  TextField,
  Tooltip,
  FormControl,
  FormControlLabel,
  FormLabel,
  Switch,
  RadioGroup,
  Radio,
  InputAdornment,
  IconButton,
  Modal,
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import { UIParameterType } from '../uitypes';
import { useSweep } from '../../../contexts/SweepContext';

// Define the props structure for the MethodParameter component
interface MethodParameterProps {
  methodId: string;        // Unique identifier for the method
  paramName: string;       // Name of the parameter
  paramDetails: UIParameterType; // Detailed information about the parameter
  value: any;              // Current value of the parameter
  isEnabled: boolean;      // Whether the parameter input is enabled
  onChange: (value: any) => void; // Callback function when parameter value changes
}

export const MethodParameter: React.FC<MethodParameterProps> = ({
  methodId,
  paramName,
  paramDetails,
  value,
  isEnabled,
  onChange,
}) => {
  // State for managing the sweep configuration modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State to track which tab is active in the sweep modal (range or values)
  const [activeTab, setActiveTab] = useState(0);
  
  // States for range sweep configuration
  const [start, setStart] = useState<number | null>(null);
  const [stop, setStop] = useState<number | null>(null);
  const [step, setStep] = useState<number | null>(null);
  
  // State for manual values sweep
  const [values, setValues] = useState<string>('');

  // Access sweep context to manage active sweeps
  const { activeSweep, setActiveSweep, clearActiveSweep } = useSweep();

  // Check if a sweep is active for a different parameter
  const isSweepActiveForOtherParam = activeSweep && (activeSweep.methodId !== methodId || activeSweep.paramName !== paramName);
  // Check if a sweep is active for this specific parameter
  const isSweepActiveForThisParam = activeSweep?.methodId === methodId && activeSweep?.paramName === paramName;

  // Validate sweep form based on active tab
  const isFormValid = () => {
    if (activeTab === 0) {
      // Range sweep requires start, stop, and step
      return start !== null && stop !== null && step !== null;
    } else {
      // Values sweep requires non-empty input
      return values.trim() !== '';
    }
  };

  // Generate display text for the current sweep configuration
  const getSweepDisplayText = () => {
    if (activeTab === 0) {
      return `RangeSweep start:${start ?? 'null'} stop:${stop ?? 'null'} step:${step ?? 'null'}`;
    } else {
      return `Sweep ${values}`;
    }
  };

  // Convert sweep input to actual values
  const getSweepValue = () => {
    if (activeTab === 0) {
      // For range sweep, return start, stop, and step
      return { start, stop, step };
    } else {
      // For values sweep, parse comma-separated input
      return values
        .split(',')
        .map((val) => val.trim())
        .map((val) => (val.includes('.') ? parseFloat(val) : parseInt(val, 10)));
    }
  };

  // Handle input changes for different parameter types
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const inputValue = event.target.value as string;
    let newValue: any;

    // Remove Optional[] wrapper if present
    const actualType = paramDetails.type.replace('Optional[', '').replace(']', '');
    if (paramName === 'glob_stats' && actualType === 'tuple[float, float, float, int]') {
      // If the switch is toggled on, set the newValue to the default value
      // If the switch is toggled off, set the newValue to null
      newValue = (event.target as HTMLInputElement).checked ? paramDetails.value : null;
      onChange(newValue);
      return;
    }
    // Type-specific parsing logic
    switch (actualType) {
      case 'int':
        // Handle integer input with validation
        if (inputValue === '' || inputValue === '-') {
          newValue = null;
        } else if (/^-?\d+$/.test(inputValue)) {
          newValue = parseInt(inputValue, 10);
        } else {
          return;
        }
        break;

      case 'float':
        // Handle float input with validation
        if (
          inputValue === '' ||
          inputValue === '-' ||
          inputValue === '.' ||
          inputValue === '-.'
        ) {
          newValue = null;
        } else if (/^-?\d*\.?\d*$/.test(inputValue)) {
          newValue = parseFloat(inputValue);
        } else {
          return;
        }
        break;

      case 'bool':
        // Handle boolean input (checkbox/switch)
        newValue = (event.target as HTMLInputElement).checked;
        break;

      default:
        // Default to string input
        newValue = inputValue;
    }

    // Call onChange with the parsed value
    onChange(newValue);
  };

  // Finalize sweep configuration
  const handleSweepDone = () => {
    const sweepValue = getSweepValue();
    const sweepType = activeTab === 0 ? 'range' : 'values';
    
    // Update parameter value
    onChange(sweepValue);
    
    // Set active sweep in context
    setActiveSweep(methodId, paramName, sweepType);
    
    // Close modal
    setIsModalOpen(false);
  };

  // Cancel and clear sweep configuration
  const handleCancelSweep = () => {
    clearActiveSweep();
    
    // Reset sweep states
    setStart(null);
    setStop(null);
    setStep(null);
    setValues('');
    
    // Reset parameter value
    onChange(null);
  };

  // Render appropriate input based on parameter type
  const renderInput = () => {
    // Handle Optional[] type wrapping
    let actualType = paramDetails.type;
    if (actualType.includes('Optional[')) {
      actualType = actualType.replace('Optional[', '').replace(']', '');
    }

    // Handle Literal[] type (radio button group)
    if (actualType.startsWith('Literal[')) {
      const literals = actualType
        .replace('Literal[', '')
        .replace(']', '')
        .split(', ')
        .map((literal) => {
          // Remove quotes from string literals
          if (literal.startsWith("'") && literal.endsWith("'")) {
            return literal.slice(1, -1);
          }
          return literal;
        });

      const currentValue = value ?? paramDetails.value;

      return (
        <Tooltip title={paramDetails.desc} placement="top-start">
          <FormControl component="fieldset" disabled={!isEnabled} sx={{ display: 'flex', justifyContent: 'center' }}>
            <FormLabel component="legend" sx={{ m: 'auto' }}>{paramName}</FormLabel>
            <RadioGroup
              value={currentValue}
              onChange={(event) => {
                // Convert to number if possible
                const newValue = isNaN(Number(event.target.value)) ? event.target.value : Number(event.target.value);
                onChange(newValue);
              }}
              row
              sx={{ m: 'auto' }}
            >
              {literals.map((literal) => (
                <FormControlLabel
                  key={literal}
                  value={literal}
                  control={<Radio />}
                  label={literal}
                  labelPlacement="bottom"
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Tooltip>
      );
    }

    // Render input based on parameter type
    switch (actualType) {
      case 'int':
      case 'float':
        return (
          <>
            {/* Numeric input with sweep functionality */}
            <Tooltip
              title={`${actualType} - default: ${paramDetails.value ?? 'None'}`}
              placement="top-start"
            >
              <TextField
                label={paramName}
                type="text"
                value={
                  isSweepActiveForThisParam
                    ? getSweepDisplayText()
                    : value ?? ''
                }
                onChange={handleInputChange}
                variant="outlined"
                disabled={!isEnabled || isSweepActiveForThisParam || (typeof value === 'string' && (value.startsWith('$') || paramName === "axis"))}
                size="small"
                fullWidth
                helperText={paramDetails.desc}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={
                          isSweepActiveForOtherParam
                            ? undefined
                            : isSweepActiveForThisParam
                            ? handleCancelSweep
                            : () => setIsModalOpen(true)
                        }
                        edge="end"
                        disabled={!isEnabled || !!isSweepActiveForOtherParam}
                      >
                        {isSweepActiveForThisParam ? <ClearIcon /> : <SettingsIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Tooltip>
            
            {/* Sweep configuration modal */}
            <Modal
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              aria-labelledby="modal-title"
              aria-describedby="modal-description"
            >
              {/* Modal content for sweep configuration */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 400,
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 2,
                  borderRadius: 1,
                }}
              >
                {/* Modal header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography id="modal-title" sx={{ fontSize: 15 }}>
                    <strong>Sweep {paramName} Parameter</strong>
                  </Typography>
                  <IconButton onClick={() => setIsModalOpen(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>

                {/* Tabs for range and values sweep */}
                <Tabs
                  value={activeTab}
                  onChange={(event, newValue) => setActiveTab(newValue)}
                  aria-label="tabs"
                >
                  <Tab sx={{ width: '50%' }} label="Range" />
                  <Tab sx={{ width: '50%' }} label="Values" />
                </Tabs>

                {/* Range sweep inputs */}
                {activeTab === 0 && (
                  <Box sx={{ mt: 1 }}>
                    <TextField
                      label="Start"
                      type="number"
                      fullWidth
                      required
                      size='small'
                      value={start ?? ''}
                      onChange={(e) => setStart(parseFloat(e.target.value))}
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      label="Stop"
                      type="number"
                      fullWidth
                      required
                      size='small'
                      value={stop ?? ''}
                      onChange={(e) => setStop(parseFloat(e.target.value))}
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      label="Step"
                      type="number"
                      fullWidth
                      required
                      size='small'
                      value={step ?? ''}
                      onChange={(e) => setStep(parseFloat(e.target.value))}
                      sx={{ mb: 1 }}
                    />
                  </Box>
                )}
                
                {/* Manual values sweep input */}
                {activeTab === 1 && (
                  <Box sx={{ mt: 1 }}>
                    <TextField
                      label="Values"
                      type="text"
                      fullWidth
                      size='small'
                      required
                      value={values}
                      onChange={(e) => setValues(e.target.value)}
                      sx={{ mb: 1 }}
                      placeholder='Enter comma-separated numbers (e.g., 1, 2, 3)'
                    />
                  </Box>
                )}

                {/* Done button for sweep configuration */}
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    onClick={handleSweepDone}
                    disabled={!isFormValid()}
                    fullWidth
                  >
                    Done
                  </Button>
                </Box>
              </Box>
            </Modal>
          </>
        );

      // Render inputs for other parameter types
      case 'str':
      case 'list':
      case 'Union[float, str, NoneType]':
      case 'ndarray':
        return (
          <Tooltip
            title={`${actualType} - default: ${paramDetails.value ?? 'None'}`}
            placement="top-start"
          >
            <TextField
              label={paramName}
              type="text"
              value={value ?? paramDetails.value}
              onChange={handleInputChange}
              variant="outlined"
              disabled={!isEnabled}
              size="small"
              fullWidth
              helperText={paramDetails.desc}
            />
          </Tooltip>
        );

      // Render boolean switch
      case 'bool':
        return (
          <Tooltip title={paramDetails.desc} placement="top-start">
            <FormControl sx={{ display: 'flex', justifyContent: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    disabled={!isEnabled}
                    checked={value ?? paramDetails.value}
                    onChange={handleInputChange}
                  />
                }
                label={paramName}
                labelPlacement="bottom"
              />
            </FormControl>
          </Tooltip>
        );
        case 'tuple[float, float, float, int]':
  return (
    <Tooltip title={paramDetails.desc} placement="top-start">
      <FormControl sx={{ display: 'flex',alignItems:'center', justifyContent: 'center' }}>
        <Typography gutterBottom>
          glob_stats
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            // Toggle between the default value and null
            const newValue = value === null ? paramDetails.value : null;
            onChange(newValue);
          }}
          fullWidth
          disabled={!isEnabled}
          sx={{
            backgroundColor: value !== null ? 'primary.main' : 'grey.500',
            '&:hover': {
              backgroundColor: value !== null ? 'primary.dark' : 'grey.600',
            },
          }}
        >
          {value !== null ? 'On' : 'Off'}
        </Button>
      </FormControl>
    </Tooltip>
  );

      // Fallback for unknown types
      default:
        return null;
    }
  };

  // Render the parameter input in a grid item
  return <Grid item xs={6}>{renderInput()}</Grid>;
};