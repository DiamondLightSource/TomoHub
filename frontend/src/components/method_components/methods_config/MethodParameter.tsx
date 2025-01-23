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

interface MethodParameterProps {
  methodId: string;
  paramName: string;
  paramDetails: UIParameterType;
  value: any;
  isEnabled: boolean;
  onChange: (value: any) => void;
}

export const MethodParameter: React.FC<MethodParameterProps> = ({
  methodId,
  paramName,
  paramDetails,
  value,
  isEnabled,
  onChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  const [stop, setStop] = useState<number | null>(null);
  const [step, setStep] = useState<number | null>(null);
  const [values, setValues] = useState<string>('');
  const { activeSweep, setActiveSweep, clearActiveSweep } = useSweep();

  const isSweepActiveForOtherParam = activeSweep && (activeSweep.methodId !== methodId || activeSweep.paramName !== paramName);

  const isFormValid = () => {
    if (activeTab === 0) {
      return start !== null && stop !== null && step !== null;
    } else {
      return values.trim() !== '';
    }
  };

  const getSweepDisplayText = () => {
    if (activeTab === 0) {
      return `RangeSweep start:${start ?? 'null'} stop:${stop ?? 'null'} step:${step ?? 'null'}`;
    } else {
      return `Sweep ${values}`;
    }
  };

  const getSweepValue = () => {
    if (activeTab === 0) {
      return { start, stop, step };
    } else {
      return values
        .split(',')
        .map((val) => val.trim())
        .map((val) => (val.includes('.') ? parseFloat(val) : parseInt(val, 10)));
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const inputValue = event.target.value as string;
    let newValue: any;

    const actualType = paramDetails.type.replace('Optional[', '').replace(']', '');

    switch (actualType) {
      case 'int':
        if (inputValue === '' || inputValue === '-') {
          newValue = null;
        } else if (/^-?\d+$/.test(inputValue)) {
          newValue = parseInt(inputValue, 10);
        } else {
          return;
        }
        break;

      case 'float':
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
        newValue = (event.target as HTMLInputElement).checked;
        break;

      default:
        newValue = inputValue;
    }

    onChange(newValue);
  };

  const handleSweepDone = () => {
    const sweepValue = getSweepValue();
    onChange(sweepValue);
    setActiveSweep(methodId, paramName);
    setIsModalOpen(false);
  };

  const handleCancelSweep = () => {
    clearActiveSweep();
    setStart(null);
    setStop(null);
    setStep(null);
    setValues('');
    onChange(null);
  };

  const renderInput = () => {
    let actualType = paramDetails.type;
    if (actualType.includes('Optional[')) {
      actualType = actualType.replace('Optional[', '').replace(']', '');
    }

    if (actualType.startsWith('Literal[')) {
      const literals = actualType
        .replace('Literal[', '')
        .replace(']', '')
        .split(', ')
        .map((literal) => {
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

    switch (actualType) {
      case 'int':
      case 'float':
      case 'tuple[float, float, float, int]':
        return (
          <>
            <Tooltip
              title={`${actualType} - default: ${paramDetails.value ?? 'None'}`}
              placement="top-start"
            >
              <TextField
                label={paramName}
                type="text"
                value={
                  activeSweep?.methodId === methodId && activeSweep?.paramName === paramName
                    ? getSweepDisplayText()
                    : value ?? ''
                }
                onChange={handleInputChange}
                variant="outlined"
                disabled={!isEnabled || (typeof value === 'string' && (value.startsWith('$') || paramName === "axis"))}
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
                            : () => setIsModalOpen(true)
                        }
                        edge="end"
                        disabled={!isEnabled || !!isSweepActiveForOtherParam}
                      >
                        {isSweepActiveForOtherParam ? null : <SettingsIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Tooltip>
            <Modal
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              aria-labelledby="modal-title"
              aria-describedby="modal-description"
            >
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography id="modal-title" sx={{ fontSize: 15 }}>
                    <strong>Sweep {paramName} Parameter</strong>
                  </Typography>
                  <IconButton onClick={() => setIsModalOpen(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>

                <Tabs
                  value={activeTab}
                  onChange={(event, newValue) => setActiveTab(newValue)}
                  aria-label="tabs"
                >
                  <Tab sx={{ width: '50%' }} label="Range" />
                  <Tab sx={{ width: '50%' }} label="Values" />
                </Tabs>

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

      default:
        return null;
    }
  };

  return <Grid item xs={6}>{renderInput()}</Grid>;
};