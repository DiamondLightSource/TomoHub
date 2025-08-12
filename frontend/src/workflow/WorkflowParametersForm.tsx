import React, { useState } from 'react';
import { Box, Card, Grid2, TextField, Typography } from '@mui/material';

interface WorkflowParametersFormProps {
  input: string;
  inputSetter: (_: string) => void;
  output: string;
  outputSetter: (_: string) => void;
  nprocs: number;
  nprocsSetter: (_: number) => void;
  memory: string;
  memorySetter: (_: string) => void;
  httomoOutputDir: string;
  httomoOutputDirSetter: (_: string) => void;
}

const memoryStringRegex = '^[0-9]+[GMK]i$';

const WorkflowParametersForm = ({
  input,
  inputSetter,
  output,
  outputSetter,
  nprocs,
  nprocsSetter,
  memory,
  memorySetter,
  httomoOutputDir,
  httomoOutputDirSetter: httomoOutputDirputSetter,
}: WorkflowParametersFormProps) => {
  const [isInputValid, setIsInputValid] = useState(false);
  const [isOutputValid, setIsOutputValid] = useState(false);
  const [isMemoryValid, setIsMemoryValid] = useState(true);

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
      <Typography variant="h6" gutterBottom>
        <strong>Workflow Parameters</strong>
      </Typography>
      <Box sx={{ paddingY: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          <strong> Basic</strong>
        </Typography>
        <Grid2 container spacing={2}>
          <TextField
            label="input"
            variant="outlined"
            size="small"
            value={input}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              inputSetter(event.target.value);
              setIsInputValid(event.target.validity.valid);
            }}
            error={!isInputValid}
            required
            helperText={isInputValid ? '' : 'Please provide path to input data'}
          />
          <TextField
            label="output"
            variant="outlined"
            size="small"
            value={output}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              outputSetter(event.target.value);
              setIsOutputValid(event.target.validity.valid);
            }}
            error={!isOutputValid}
            required
            helperText={
              isOutputValid ? '' : 'Please provide path to output folder'
            }
          />
        </Grid2>
      </Box>
      <Box sx={{ paddingY: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          <strong> Advanced</strong>
        </Typography>
        <Grid2 container spacing={2}>
          <TextField
            label="httomo-output-dir"
            variant="outlined"
            size="small"
            value={httomoOutputDir}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              httomoOutputDirputSetter(event.target.value)
            }
          />
          <TextField
            label="nprocs"
            variant="outlined"
            size="small"
            type="number"
            value={nprocs}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              nprocsSetter(Number(event.target.value))
            }
          />
          <TextField
            error={!isMemoryValid}
            label="memory"
            slotProps={{ htmlInput: { pattern: memoryStringRegex } }}
            variant="outlined"
            size="small"
            value={memory}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              memorySetter(event.target.value);
              setIsMemoryValid(event.target.validity.valid);
            }}
            helperText={
              isMemoryValid ? '' : `Must match pattern '${memoryStringRegex}'`
            }
          />
        </Grid2>
      </Box>
    </Card>
  );
};

export default WorkflowParametersForm;
