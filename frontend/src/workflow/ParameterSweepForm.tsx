import React from 'react';
import { Box, Card, Grid2, TextField, Typography } from '@mui/material';

interface ParameterSweepFormProps {
  start: number;
  startSetter: (_: number) => void;
  stop: number;
  stopSetter: (_: number) => void;
  step: number;
  stepSetter: (_: number) => void;
}

type LabelHandlerTuple = [string, number, (_: number) => void];

const ParameterSweepForm = ({
  start,
  startSetter,
  stop,
  stopSetter,
  step,
  stepSetter,
}: ParameterSweepFormProps) => {
  const tupleHelper: [LabelHandlerTuple, LabelHandlerTuple, LabelHandlerTuple] =
    [
      ['start', start, startSetter],
      ['stop', stop, stopSetter],
      ['step', step, stepSetter],
    ];

  return (
    <Card
      variant="outlined"
      sx={{
        mx: 'auto',
        mb: 2,
        p: 2,
        border: '1px solid #89987880',
        borderRadius: '4px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          <strong>Parameter Sweep</strong>
        </Typography>
      </Box>
      <Grid2 container spacing={2}>
        {tupleHelper.map(([label, val, handler]) => {
          return (
            <TextField
              key={label}
              label={label}
              type="number"
              variant="outlined"
              size="small"
              value={val}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                handler(Number(event.target.value))
              }
            />
          );
        })}
      </Grid2>
    </Card>
  );
};

export default ParameterSweepForm;
