import React from 'react';
import { FormControl, FormControlLabel, Switch, Tooltip } from '@mui/material';

interface BooleanInputProps {
  paramName: string;
  paramDetails: any;
  value: any;
  isEnabled: boolean;
  onChange: (value: any) => void;
}

export const BooleanInput: React.FC<BooleanInputProps> = ({
  paramName,
  paramDetails,
  value,
  isEnabled,
  onChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <Tooltip title={paramDetails.desc} placement="top-start">
      <FormControl sx={{ display: 'flex', justifyContent: 'center' }}>
        <FormControlLabel
          control={
            <Switch
              disabled={!isEnabled}
              checked={value ?? paramDetails.value}
              onChange={handleChange}
            />
          }
          label={paramName}
          labelPlacement="bottom"
        />
      </FormControl>
    </Tooltip>
  );
};
