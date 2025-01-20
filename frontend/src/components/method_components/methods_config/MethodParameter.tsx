import React from 'react';
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
} from '@mui/material';
import { UIParameterType } from '../uitypes';

interface MethodParameterProps {
  methodId: string;
  paramName: string;
  paramDetails: UIParameterType;
  value: any;
  isEnabled: boolean;
  onChange: (value: any) => void;
}

export const MethodParameter: React.FC<MethodParameterProps> = ({
  paramName,
  paramDetails,
  value,
  isEnabled,
  onChange,
}) => {
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const inputValue = event.target.value as string;
    let newValue: any;

    // Handle Optional types
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

  const renderInput = () => {
    let actualType = paramDetails.type;
    // Handle Optional types
    if (actualType.includes('Optional[')) {
      actualType = actualType.replace('Optional[', '').replace(']', '');
    }

    if (actualType.startsWith('Literal[')) {
      // Extract the values from the Literal type string
      const literals = actualType
        .replace('Literal[', '')
        .replace(']', '')
        .split(', ')
        .map((literal) => {
          // Remove quotes if present
          if (literal.startsWith("'") && literal.endsWith("'")) {
            return literal.slice(1, -1);
          }
          return literal;
        });

      // Determine the current value or fallback to the default value
      const currentValue = value ?? paramDetails.value;

      return (
        <Tooltip title={paramDetails.desc} placement="top-start">
          <FormControl component="fieldset" disabled={!isEnabled} sx={{ display: 'flex', justifyContent: 'center' }}>
            <FormLabel component="legend" sx={{ m: 'auto' }}>{paramName}</FormLabel>
            <RadioGroup
              value={currentValue} // Use the current value or default value
              onChange={(event) => {
                // Convert to number if the literal is a number
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
          <Tooltip
            title={`${actualType} - default: ${paramDetails.value ?? 'None'}`}
            placement="top-start"
          >
            <TextField
              label={paramName}
              type="text"
              value={paramName === 'axis' ? (value ?? 'auto') : (value ?? '')}
              onChange={handleInputChange}
              variant="outlined"
              disabled={!isEnabled || (typeof value === 'string' && (value.startsWith('$') || paramName === "axis"))}
              size="small"
              fullWidth
              helperText={paramDetails.desc}
            />
          </Tooltip>
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