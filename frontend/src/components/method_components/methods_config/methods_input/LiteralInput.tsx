import React from 'react';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Tooltip } from '@mui/material';

interface LiteralInputProps {
  paramName: string;
  paramDetails: any;
  value: any;
  isEnabled: boolean;
  onChange: (value: any) => void;
}

export const LiteralInput: React.FC<LiteralInputProps> = ({
  paramName,
  paramDetails,
  value,
  isEnabled,
  onChange,
}) => {
  const actualType = paramDetails.type.replace('Optional[', '').replace(']', '');
  const literals = actualType
    .replace('Literal[', '')
    .replace(']', '')
    .split(', ')
    .map(literal => literal.startsWith("'") && literal.endsWith("'") 
      ? literal.slice(1, -1) 
      : literal
    );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = isNaN(Number(event.target.value)) 
      ? event.target.value 
      : Number(event.target.value);
    onChange(newValue);
  };

  return (
    <Tooltip title={paramDetails.desc} placement="top-start">
      <FormControl component="fieldset" disabled={!isEnabled} sx={{ display: 'flex', justifyContent: 'center' }}>
        <FormLabel component="legend" sx={{ m: 'auto' }}>{paramName}</FormLabel>
        <RadioGroup
          value={value ?? paramDetails.value}
          onChange={handleChange}
          row
          sx={{ m: 'auto' }}
        >
          {literals.map(literal => (
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
};