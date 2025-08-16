import React, { useState } from 'react';
import { Stack, TextField, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Import the close icon
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Import the expand icon

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
  const [showAdvanced, setShowAdvanced] = useState(false); 

  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          label="Input Path"
          value={values.input ?? ''}
          onChange={e => onChange({ ...values, input: e.target.value })}
          disabled={disabled}
          fullWidth
          size='small'
        />
        <TextField
          label="Output Path"
          value={values.output ?? ''}
          onChange={e => onChange({ ...values, output: e.target.value })}
          disabled={disabled}
          fullWidth
          size='small'
        />
        {!showAdvanced ? (
          <Button
            variant="outlined"
            onClick={() => setShowAdvanced(true)} 
            data-testid="wf-advanced-toggle"
            sx={{ flexShrink: 0, minWidth: '120px' }} 
            startIcon={<ExpandMoreIcon />} 
          >
            Advanced
          </Button>
        ) : (
          <IconButton
            onClick={() => setShowAdvanced(false)} 
            data-testid="wf-close-advanced"
            sx={{ flexShrink: 0, minWidth: '40px' }} 
          >
            <CloseIcon />
          </IconButton>
        )}
      </Stack>

      {/* Second Stack (Advanced Fields) */}
      {showAdvanced && (
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
            size='small'
          />
          <TextField
            label="Memory"
            value={values.memory ?? ''}
            onChange={e => onChange({ ...values, memory: e.target.value })}
            disabled={disabled}
            fullWidth
            size='small'
          />
          <TextField
            label="Output Directory Name"
            value={values.httomo_outdir_name ?? ''}
            onChange={e =>
              onChange({ ...values, httomo_outdir_name: e.target.value })
            }
            disabled={disabled}
            fullWidth
            size='small'
          />
        </Stack>
      )}
    </Stack>
  );
}
