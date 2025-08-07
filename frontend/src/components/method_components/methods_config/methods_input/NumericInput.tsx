import React from 'react';
import { TextField, Tooltip, InputAdornment, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ClearIcon from '@mui/icons-material/Clear';
import { useParameterValidation } from '../../../../hooks/useParameterValidation';

interface NumericInputProps {
  paramName: string;
  paramDetails: any;
  value: any;
  isEnabled: boolean;
  onChange: (value: any) => void;
  onSweepOpen?: () => void;
  onSweepCancel?: () => void;
  sweepDisplayText?: string;
  isSweepActive?: boolean;
  isSweepDisabled?: boolean;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  paramName,
  paramDetails,
  value,
  isEnabled,
  onChange,
  onSweepOpen,
  onSweepCancel,
  sweepDisplayText,
  isSweepActive = false,
  isSweepDisabled = false,
}) => {
  const { parseValue } = useParameterValidation();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const parsedValue = parseValue(inputValue, paramDetails.type);
    
    if (parsedValue !== undefined) {
      onChange(parsedValue);
    }
  };

  // Don't render sweep controls if no sweep handlers provided
  const showSweepControls = onSweepOpen && onSweepCancel;

  return (
    <Tooltip
      title={`${paramDetails.type} - default: ${paramDetails.value ?? 'None'}`}
      placement="top-start"
    >
      <TextField
        label={paramName}
        type="text"
        value={isSweepActive ? sweepDisplayText : value ?? ''}
        onChange={handleInputChange}
        variant="outlined"
        disabled={!isEnabled || isSweepActive || (typeof value === 'string' && paramName === "axis")}
        size="small"
        fullWidth
        helperText={paramDetails.desc}
        InputProps={showSweepControls ? {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={isSweepActive ? onSweepCancel : onSweepOpen}
                edge="end"
                disabled={!isEnabled || isSweepDisabled}
              >
                {isSweepActive ? <ClearIcon /> : <SettingsIcon />}
              </IconButton>
            </InputAdornment>
          ),
        } : undefined}
      />
    </Tooltip>
  );
};
