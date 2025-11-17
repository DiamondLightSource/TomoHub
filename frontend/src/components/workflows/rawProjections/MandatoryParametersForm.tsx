import { Box, Stack, TextField, Theme, Typography } from "@mui/material";
import {
  RawProjectionWorkflowArguments,
  RawProjectionWorkflowErrors,
} from "./SubmissionFormRawProjections";

interface MandatoryParametersProps {
  submittedWorkflowArguments: RawProjectionWorkflowArguments;
  setSubmittedWorkflowArguments: (args: RawProjectionWorkflowArguments) => void;
  formErrors: RawProjectionWorkflowErrors;
  setFormErrors: (args: RawProjectionWorkflowErrors) => void;
  theme: Theme;
}

export default function MandatoryParameters({
  submittedWorkflowArguments,
  setSubmittedWorkflowArguments,
  formErrors,
  setFormErrors,
  theme,
}: MandatoryParametersProps) {
  return (
    <Stack direction="column" spacing={theme.spacing(2)}>
      <Typography variant="h6">Mandatory Parameters</Typography>
      <TextField
        label="Input"
        type="string"
        fullWidth
        size="small"
        placeholder="/dls/beamline/..."
        onChange={(e) => {
          setSubmittedWorkflowArguments({
            ...submittedWorkflowArguments,
            input: e.target.value,
          });
          setFormErrors({
            ...formErrors,
            inputEmpty: e.target.value === "",
          });
        }}
        error={formErrors.inputEmpty}
      />
      <TextField
        label="Key"
        type="string"
        fullWidth
        size="small"
        placeholder="/entry1/tomo_entry/data/data"
        onChange={(e) => {
          setSubmittedWorkflowArguments({
            ...submittedWorkflowArguments,
            "dataset-path": e.target.value,
          });
          setFormErrors({
            ...formErrors,
            keyEmpty: e.target.value === "",
          });
        }}
        error={formErrors.keyEmpty}
      />
      <Box sx={{ height: "8px" }}>
        {formErrors.inputEmpty ? (
          <Typography align="center" color="red">
            Input field cannot be empty
          </Typography>
        ) : (
          formErrors.keyEmpty && (
            <Typography align="center" color="red">
              Key field cannot be empty
            </Typography>
          )
        )}
      </Box>
    </Stack>
  );
}
