import React from 'react';
import { FormControl, Typography, Button, Tooltip } from '@mui/material';

interface TupleInputProps {
  paramName: string;
  paramDetails: any;
  value: any;
  isEnabled: boolean;
  onChange: (value: any) => void;
}

const TupleInput: React.FC<TupleInputProps> = ({
  paramName,
  paramDetails,
  value,
  isEnabled,
  onChange,
}) => {
  const handleToggle = () => {
    const newValue = value === null ? paramDetails.value : null;
    onChange(newValue);
  };

  return (
    <Tooltip
      title={
        paramDetails.desc +
        "DO NOT CHANGE IF YOU DON'T WANT TO CALCULATE MIN/MAX FROM GIVEN DATA"
      }
      placement="top-start"
    >
      <FormControl
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Typography gutterBottom>{paramName}</Typography>
        <Button
          variant="contained"
          onClick={handleToggle}
          fullWidth
          disabled={!isEnabled}
          sx={{
            backgroundColor: value !== null ? 'primary.main' : 'grey.500',
            '&:hover': {
              backgroundColor: value !== null ? 'primary.dark' : 'grey.600',
            },
          }}
        >
          {value !== null ? 'On' : 'Off'}
        </Button>
      </FormControl>
    </Tooltip>
  );
};

export default TupleInput;