import React from 'react';
import { Grid, TextField, Select, MenuItem, Tooltip } from "@mui/material";
import { ParameterType } from '../types';

interface MethodParameterProps {
  methodId: string;
  paramName: string;
  paramDetails: ParameterType;
  value: any;
  isEnabled: boolean;
  onChange: (value: any) => void;
}

export const MethodParameter: React.FC<MethodParameterProps> = ({
  paramName,
  paramDetails: [type, helperText, defaultValue],
  value,
  isEnabled,
  onChange,
}) => {
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const newValue =
      type === "int"
        ? parseInt(event.target.value as string)
        : type === "float"
        ? parseFloat(event.target.value as string)
        : event.target.value;
    onChange(newValue);
  };

  const renderInput = () => {
    switch (type) {
      case "int":
      case "float":
        return (
          <Tooltip title={`${type} value`} placement="top-start">
            <TextField
              label={paramName}
              type="number"
              value={value ?? defaultValue}
              onChange={handleInputChange}
              variant="outlined"
              disabled={!isEnabled}
              size="small"
              fullWidth
              helperText={helperText}
            />
          </Tooltip>
        );
      case "string":
        return (
          <TextField
            label={paramName}
            type="text"
            value={value ?? defaultValue}
            onChange={handleInputChange}
            variant="outlined"
            disabled={!isEnabled}
            size="small"
            fullWidth
            helperText={helperText}
          />
        );
    //   case "select":
    //     return (
    //       <Select
    //         value={value ?? defaultValue}
    //         onChange={handleInputChange}
    //         fullWidth
    //         variant="outlined"
    //         size="small"
    //       >
    //         <MenuItem value="Option 1">Option 1</MenuItem>
    //         <MenuItem value="Option 2">Option 2</MenuItem>
    //         <MenuItem value="Option 3">Option 3</MenuItem>
    //       </Select>
    //     );
      default:
        return null;
    }
  };

  return <Grid item xs={6}>{renderInput()}</Grid>;
};