import React from "react";
import { TextField, Tooltip } from "@mui/material";

interface TextInputProps {
  paramName: string;
  paramDetails: any;
  value: any;
  isEnabled: boolean;
  onChange: (value: any) => void;
}

const TextInput: React.FC<TextInputProps> = ({
  paramName,
  paramDetails,
  value,
  isEnabled,
  onChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <Tooltip
      title={`${paramDetails.type} - default: ${paramDetails.value ?? "None"}`}
      placement="top-start"
    >
      <TextField
        label={paramName}
        type="text"
        value={value ?? paramDetails.value}
        onChange={handleChange}
        variant="outlined"
        disabled={!isEnabled}
        size="small"
        fullWidth
        helperText={paramDetails.desc}
      />
    </Tooltip>
  );
};

export default TextInput;
