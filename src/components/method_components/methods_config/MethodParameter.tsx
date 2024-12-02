import React from 'react';
import { Grid, TextField, Select, MenuItem,FormControl,InputLabel, FormControlLabel,Switch, Tooltip,FormHelperText } from "@mui/material";
import { UIParameterType } from '../uitypes';

interface MethodParameterProps {
  methodId: string;
  paramName: string;
  paramDetails: UIParameterType;
  value: any ;
  isEnabled: boolean;
  onChange: (value: any) => void;
}

export const MethodParameter: React.FC<MethodParameterProps> = ({
  paramName,
  paramDetails: [type,isParamRequired ,helperText, defaultValue,options],
  value,
  isEnabled,
  onChange,
}) => {
const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
) => {
    const inputValue = event.target.value as string;

    let newValue: any;

    switch (type) {
        case "int":
            if (inputValue === '' || inputValue === '-') {
                newValue = null;
            } else if (/^-?\d+$/.test(inputValue)) {
                newValue = parseInt(inputValue, 10);
            } else {
                return;
            }
            break;

        case "float":
            if (inputValue === '' || inputValue === '-' || inputValue === '.' || inputValue === '-.') {
                newValue = null;
            } else if (/^-?\d*\.?\d*$/.test(inputValue)) {
                newValue = parseFloat(inputValue);
            } else {
                return; 
            }
            break;

        case "bool":
            newValue = (event.target as HTMLInputElement).checked;
            break;

        default:
            newValue = inputValue;
    }

    onChange(newValue);
};

  const renderInput = () => {
    switch (type) {
      case "int":
      case "float":
        return (
          <Tooltip title={`${type} - default : ${defaultValue}`} placement="top-start">
            <TextField
              label={paramName}
              type="number"
              value={value ?? ''}
              onChange={handleInputChange}
              variant="outlined"
              disabled={!isEnabled}
              size="small"
              fullWidth
              helperText={helperText}
              required={isParamRequired}
            />
          </Tooltip>
        );
      case "string":
        return (
        <Tooltip title={`${type} - default : ${defaultValue}`} placement="top-start">
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
            required={isParamRequired}
          />
          </Tooltip>
        );
    case "bool":
        return (
            <Tooltip title={helperText} placement="top-start">
            <FormControl sx={{display:'flex',justifyContent:'center'}}>
            <FormControlLabel
                control={ <Switch disabled={!isEnabled} checked={value ?? defaultValue} onChange={handleInputChange} name="gilad" /> }
                label={paramName} labelPlacement='bottom'
            />
            </FormControl>
            </Tooltip>

        )
        case "list":
            return (
                <FormControl required variant="standard" fullWidth>
                    <InputLabel id={`${paramName}-label-id`}>{paramName}</InputLabel>
                    <Select
                        labelId={`${paramName}-label-id`}
                        id={`${paramName}-select-id`}
                        label={paramName}
                        size="medium"
                        value={value ?? defaultValue}
                        onChange={(event) => onChange(event.target.value)}
                        disabled={!isEnabled}
                        required={isParamRequired}
                    >
                        {
                        options?.map((item) => (
                            <MenuItem key={item} value={item}>
                                {item}
                            </MenuItem>
                        ))
                        }
                    </Select>
                    <FormHelperText>{helperText}</FormHelperText>
                </FormControl>
            );
      default:
        return null;
    }
  };

  return <Grid item xs={6}>{renderInput()}</Grid>;
};