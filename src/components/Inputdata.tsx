import React from "react";
import { TextField } from "@mui/material";

const InputOutput: React.FC = () => {
  return (
    <TextField
      id="outPutPath--input"
      size="small"
      label="Data"
      variant="outlined"
      required
      helperText="enter the path to your tomography data"
      fullWidth
    />
  );
};

export default InputOutput;
