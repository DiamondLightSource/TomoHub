import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Tooltip,
} from '@mui/material';
import { useCenter } from '../../../../contexts/CenterContext';

interface CenterInputProps {
  paramName: string;
  paramDetails: any;
  value: any;
  isEnabled: boolean;
  onChange: (value: any) => void;
}

const CenterInput: React.FC<CenterInputProps> = ({
  paramName,
  paramDetails,
  value,
  isEnabled,
  onChange,
}) => {
  const { selectedCenter, setSelectedCenter } = useCenter();
  const [centerMode, setCenterMode] = useState<'auto' | 'manual'>(
    selectedCenter === 0 ? 'auto' : 'manual'
  );

  useEffect(() => {
    if (centerMode === 'manual' && paramName === 'center') {
      onChange(selectedCenter);
    }
  }, [selectedCenter, centerMode, paramName, onChange]);

  const handleCenterModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'auto' | 'manual'
  ) => {
    if (newMode) {
      setCenterMode(newMode);
      if (newMode === 'auto') {
        onChange(paramDetails.value);
      } else if (newMode === 'manual') {
        onChange(selectedCenter);
      }
    }
  };

  const handleManualValueChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.value === '' ? 0 : Number(event.target.value);
    setSelectedCenter(newValue); // Update context
    onChange(newValue); // Update component value
  };

  return (
    <Tooltip title={paramDetails.desc} placement="top-start">
      <Grid container direction="column" alignItems="center">
        <Typography variant="subtitle1" gutterBottom>
          {paramName}
        </Typography>
        <ToggleButtonGroup
          value={centerMode}
          exclusive
          onChange={handleCenterModeChange}
          disabled={!isEnabled}
          size="small"
          fullWidth
          color="primary"
        >
          <ToggleButton value="auto">Auto</ToggleButton>
          <ToggleButton value="manual">Manual</ToggleButton>
        </ToggleButtonGroup>
        {centerMode === 'manual' && (
          <TextField
            label="Manual Center"
            type="number"
            value={selectedCenter}
            onChange={handleManualValueChange}
            variant="outlined"
            size="small"
            fullWidth
            disabled={!isEnabled}
            sx={{ mt: 2 }}
            helperText="Enter the manual center value"
          />
        )}
      </Grid>
    </Tooltip>
  );
};

export default CenterInput;