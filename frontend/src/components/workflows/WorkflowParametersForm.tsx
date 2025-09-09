import React, { useState } from "react";
import { Stack, TextField, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export interface WorkflowParamsValues {
  input: string;
  output: string;
  nprocs: number | string;
  memory: string;
  httomo_outdir_name: string;
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
  const [memoryFieldError, setMemoryFieldError] = useState(false);
  function onMemoryFieldChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    onChange({ ...values, memory: e.target.value });
    setMemoryFieldError(!e.target.checkValidity());
  }

  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          label="Input Path"
          value={values.input ?? ""}
          onChange={(e) => onChange({ ...values, input: e.target.value })}
          disabled={disabled}
          fullWidth
          size="small"
        />
        <TextField
          label="Output Path"
          value={values.output ?? ""}
          onChange={(e) => onChange({ ...values, output: e.target.value })}
          disabled={disabled}
          fullWidth
          size="small"
        />
        {!showAdvanced ? (
          <Button
            variant="outlined"
            onClick={() => setShowAdvanced(true)}
            data-testid="wf-advanced-toggle"
            sx={{ flexShrink: 0, minWidth: "120px" }}
            startIcon={<ExpandMoreIcon />}
          >
            Advanced
          </Button>
        ) : (
          <IconButton
            onClick={() => setShowAdvanced(false)}
            data-testid="wf-close-advanced"
            sx={{ flexShrink: 0, minWidth: "40px" }}
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
            onChange={(e) =>
              onChange({
                ...values,
                nprocs: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
            disabled={disabled}
            fullWidth
            size="small"
          />
          <TextField
            error={memoryFieldError}
            slotProps={{
              htmlInput: {
                pattern: "[0-9]+[GMK]i",
              },
            }}
            label="Memory"
            value={values.memory ?? ""}
            onChange={(e) => onMemoryFieldChange(e)}
            disabled={disabled}
            fullWidth
            size="small"
            helperText={
              memoryFieldError
                ? "Must be a number followed by Ki, Mi or Gi"
                : " "
            }
          />
          <TextField
            label="Output Directory Name"
            value={values.httomo_outdir_name ?? ""}
            onChange={(e) =>
              onChange({ ...values, httomo_outdir_name: e.target.value })
            }
            disabled={disabled}
            fullWidth
            size="small"
          />
        </Stack>
      )}
    </Stack>
  );
}
