import { Box, Stack, TextField, Theme, Typography } from "@mui/material";
import { RawProjectionWorkflowArguments } from "./SubmissionFormRawProjections";

interface AdvancedParametersProps {
  submittedWorkflowArguments: RawProjectionWorkflowArguments;
  setSubmittedWorkflowArguments: (args: RawProjectionWorkflowArguments) => void;
  theme: Theme;
}

export default function AdvancedParameters({
  submittedWorkflowArguments,
  setSubmittedWorkflowArguments,
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
          }}
        />
        <TextField
          label="Nprocs"
          type="number"
          fullWidth
          size="small"
          value={Number(submittedWorkflowArguments.nprocs)}
          onChange={(e) => {
            setSubmittedWorkflowArguments({
              ...submittedWorkflowArguments,
              nprocs: Number(e.target.value),
            });
          }}
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
          }}
        />
      </Stack>
    </Box>
  );
}
