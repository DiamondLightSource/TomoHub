import { Box, TextField, Typography } from "@mui/material";
import { RawProjectionWorkflowArguments } from "./SubmissionFormRawProjections";

interface MandatoryParametersProps {
  submittedWorkflowArguments: RawProjectionWorkflowArguments;
  setSubmittedWorkflowArguments: (args: RawProjectionWorkflowArguments) => void;
}

export default function MandatoryParameters({
  submittedWorkflowArguments,
  setSubmittedWorkflowArguments,
}: MandatoryParametersProps) {
  return (
    <Box>
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
        }}
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
        }}
      />
    </Box>
  );
}
