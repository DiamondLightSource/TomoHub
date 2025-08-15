import React from 'react';
import { Stack, TextField } from '@mui/material';

export interface WorkflowParamsValues {
  input: string;
  output: string;
  nprocs: number | string;
  memory: string;
  httomo_outdir_name: string; // mapped to 'httomo-outdir-name' on submit
}

export default function WorkflowParametersForm({
  values,
  onChange,
  disabled,
}: {
  values: WorkflowParamsValues;
  onChange: (next: WorkflowParamsValues) => void;
  disabled?: boolean;
}) {
  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="row" spacing={2}>
        <TextField
          label="Input Path"
          value={values.input ?? ''}
          onChange={e => onChange({ ...values, input: e.target.value })}
          disabled={disabled}
          fullWidth
          inputProps={{ 'data-testid': 'wf-input' }}
        />
        <TextField
          label="Output Path"
          value={values.output ?? ''}
          onChange={e => onChange({ ...values, output: e.target.value })}
          disabled={disabled}
          fullWidth
          inputProps={{ 'data-testid': 'wf-output' }}
        />
      </Stack>

      <Stack direction="row" spacing={2}>
        <TextField
          label="Number of Processes"
          type="number"
          value={values.nprocs}
          onChange={e =>
            onChange({
              ...values,
              nprocs: e.target.value === '' ? '' : Number(e.target.value),
            })
          }
          disabled={disabled}
          fullWidth
          inputProps={{ min: 1, 'data-testid': 'wf-nprocs' }}
        />
        <TextField
          label="Memory (e.g. 20Gi)"
          value={values.memory ?? ''}
          onChange={e => onChange({ ...values, memory: e.target.value })}
          disabled={disabled}
          fullWidth
          inputProps={{ 'data-testid': 'wf-memory' }}
        />
        <TextField
          label="HTTomo Output Directory"
          value={values.httomo_outdir_name ?? ''}
          onChange={e =>
            onChange({ ...values, httomo_outdir_name: e.target.value })
          }
          disabled={disabled}
          fullWidth
          inputProps={{ 'data-testid': 'wf-outdir' }}
        />
      </Stack>
    </Stack>
  );
}
