import React from 'react';
import { Stack, TextField } from '@mui/material';

export interface SweepValues {
  start: number | '';
  stop: number | '';
  step: number | '';
}

export default function ParameterSweepForm({
  values,
  onChange,
  disabled,
}: {
  values: SweepValues;
  onChange: (next: SweepValues) => void;
  disabled?: boolean;
}) {
  const handleNum =
    (key: keyof SweepValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const raw = e.target.value;
      const parsed = raw === '' ? '' : Number(raw);
      onChange({ ...values, [key]: Number.isNaN(parsed) ? '' : parsed });
    };

  return (
    <Stack direction="row" spacing={2}>
      <TextField
        label="Start"
        type="number"
        value={values.start}
        onChange={handleNum('start')}
        disabled={disabled}
        fullWidth
        size='small'
      />
      <TextField
        label="Stop"
        type="number"
        value={values.stop}
        onChange={handleNum('stop')}
        disabled={disabled}
        fullWidth
        size='small'
      />
      <TextField
        label="Step"
        type="number"
        value={values.step}
        onChange={handleNum('step')}
        disabled={disabled}
        fullWidth
        size='small'
      />
    </Stack>
  );
}
