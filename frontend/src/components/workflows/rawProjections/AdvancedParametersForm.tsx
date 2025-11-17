import { Box, Stack, TextField, Theme, Typography } from "@mui/material";
import {
  RawProjectionWorkflowArguments,
  RawProjectionWorkflowErrors,
} from "./SubmissionFormRawProjections";

interface AdvancedParametersProps {
  submittedWorkflowArguments: RawProjectionWorkflowArguments;
  setSubmittedWorkflowArguments: (args: RawProjectionWorkflowArguments) => void;
  formErrors: RawProjectionWorkflowErrors;
  setFormErrors: (args: RawProjectionWorkflowErrors) => void;
  theme: Theme;
}

export default function AdvancedParameters({
  submittedWorkflowArguments,
  setSubmittedWorkflowArguments,
  formErrors,
  setFormErrors,
  theme,
}: AdvancedParametersProps) {
  return (
    <Box>
      <Typography variant="h6">Advanced Parameters</Typography>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ "margin-top": theme.spacing(2) }}
      >
        <TextField
          label="Memory"
          type="string"
          fullWidth
          size="small"
          value={submittedWorkflowArguments.memory}
          onChange={(e) => {
            setSubmittedWorkflowArguments({
              ...submittedWorkflowArguments,
              memory: e.target.value,
            });
            setFormErrors({
              ...formErrors,
              memoryFormatInvalid: !e.target.checkValidity(),
            });
          }}
          error={formErrors.memoryFormatInvalid}
          slotProps={{
            htmlInput: {
              pattern: "[0-9]+[GMK]i",
            },
          }}
        />
        <TextField
          label="Nprocs"
          type="number"
          fullWidth
          size="small"
          value={Number(submittedWorkflowArguments.nprocs)}
          onChange={(e) => {
            const raw = e.target.value;
            const numberValue = Number(raw);
            let error = false;
            if (raw === "") {
              error = true;
            } else if (numberValue < 1 || !Number.isInteger(numberValue)) {
              error = true;
            } else {
              setSubmittedWorkflowArguments({
                ...submittedWorkflowArguments,
                nprocs: Number(e.target.value),
              });
            }
            setFormErrors({ ...formErrors, nprocsNaN: error });
          }}
          onBlur={() => {
            setFormErrors({ ...formErrors, nprocsNaN: false });
          }}
          error={formErrors.nprocsNaN}
        />
        <TextField
          label="Output Filename"
          type="string"
          fullWidth
          size="small"
          value={submittedWorkflowArguments["output-filename"]}
          onChange={(e) => {
            setSubmittedWorkflowArguments({
              ...submittedWorkflowArguments,
              "output-filename": e.target.value,
            });
            setFormErrors({
              ...formErrors,
              outputNameInvalid: !e.target.checkValidity(),
            });
          }}
          error={formErrors.outputNameInvalid}
          slotProps={{
            htmlInput: {
              // TODO: allow "-" too
              pattern: "[a-zA-Z0-9][a-zA-Z0-9_]*.tif",
            },
          }}
        />
        <TextField
          label="Tmpdir Path"
          type="string"
          fullWidth
          size="small"
          value={submittedWorkflowArguments["tmpdir-path"]}
          onChange={(e) => {
            setSubmittedWorkflowArguments({
              ...submittedWorkflowArguments,
              "tmpdir-path": e.target.value,
            });
            // TODO: not sure what to error check here, if its necessary??
          }}
          error={formErrors.tmpdirPathInvalid}
        />
      </Stack>
      <Box sx={{ height: "10px", "margin-top": "8px" }}>
        {formErrors.memoryFormatInvalid ? (
          <Typography align="center" color="red">
            Memory format invalid
          </Typography>
        ) : formErrors.nprocsNaN ? (
          <Typography align="center" color="red">
            Nprocs must be a positive integer
          </Typography>
        ) : formErrors.outputNameInvalid ? (
          <Typography align="center" color="red">
            Output filename can only include letters, number and underscores and
            must end in .tif
          </Typography>
        ) : (
          formErrors.tmpdirPathInvalid && (
            <Typography align="center" color="red">
              Tmpdirpath format invalid
            </Typography>
          )
        )}
      </Box>
    </Box>
  );
}
