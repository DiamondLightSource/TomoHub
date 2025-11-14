import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  Stack,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import {
  ProjectionIndicesMethod,
  RawProjectionIndicesArguments,
} from "./SubmissionFormRawProjections";

interface ProjectionsFormProps {
  submittedProjectionIndicesValues: RawProjectionIndicesArguments;
  setProjectionIndicesValues: (args: RawProjectionIndicesArguments) => void;
  submittedProjectionIndicesMethod: ProjectionIndicesMethod;
  setIndicesMethod: (method: ProjectionIndicesMethod) => void;
  firstIndex: number;
  lastIndex: number;
  theme: Theme;
}

export default function ProjectionsForm({
  submittedProjectionIndicesValues,
  setProjectionIndicesValues,
  submittedProjectionIndicesMethod,
  setIndicesMethod,
  firstIndex,
  lastIndex,
  theme,
}: ProjectionsFormProps) {
  function ProjectionsCheckbox({
    label,
    value,
  }: {
    label: string;
    value: "start" | "mid" | "end";
  }) {
    const projectionIndicesObject: RawProjectionIndicesArguments = {
      ...submittedProjectionIndicesValues,
    };
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={submittedProjectionIndicesValues.boxesChecked.start}
            onChange={(e) => {
              projectionIndicesObject.boxesChecked[value] = e.target.checked;
              setProjectionIndicesValues(projectionIndicesObject);
            }}
          />
        }
        label={label}
      />
    );
  }

  function ProjectionsNumberInput({
    label,
    field,
    defaultValue,
  }: {
    label: string;
    field: "start" | "stop" | "step";
    defaultValue: number;
  }) {
    const projectionIndicesObject: RawProjectionIndicesArguments = {
      ...submittedProjectionIndicesValues,
    };
    return (
      <TextField
        label={label}
        type="number"
        defaultValue={submittedProjectionIndicesValues.intervalValues[field]}
        onChange={(e) => {
          const raw = e.target.value;
          const parsed = raw === "" ? 0 : Number(raw);
          projectionIndicesObject.intervalValues[field] =
            parsed ?? defaultValue;
          setProjectionIndicesValues(projectionIndicesObject);
        }}
        fullWidth
        size="small"
      />
    );
  }

  return (
    <Box>
      <Typography variant="h6">Projections</Typography>
      <Stack
        direction="row"
        spacing={4}
        alignItems="center"
        justifyContent="space-between"
        sx={{ height: "60px", "margin-top": theme.spacing(2) }}
      >
        <Select
          defaultValue={submittedProjectionIndicesMethod}
          onChange={(e) => {
            if (typeof e.target.value !== "string") {
              setIndicesMethod(e.target.value);
            }
          }}
          sx={{ width: "150px" }}
        >
          <MenuItem value={ProjectionIndicesMethod.Checkbox}>Checkbox</MenuItem>
          <MenuItem value={ProjectionIndicesMethod.Interval}>Interval</MenuItem>
        </Select>
        <Box
          sx={{
            padding: "10px",
            width: "100%",
          }}
        >
          {submittedProjectionIndicesMethod ===
            ProjectionIndicesMethod.Checkbox && (
            <FormGroup row>
              <Stack
                direction="row"
                justifyContent={"space-evenly"}
                sx={{ width: "100%" }}
              >
                <ProjectionsCheckbox label={"Start"} value={"start"} />
                <ProjectionsCheckbox label={"Mid"} value={"mid"} />
                <ProjectionsCheckbox label={"End"} value={"end"} />
              </Stack>
            </FormGroup>
          )}
          {submittedProjectionIndicesMethod ===
            ProjectionIndicesMethod.Interval && (
            <Box>
              <Stack
                direction="row"
                spacing={2}
                onClick={() => {
                  setIndicesMethod(ProjectionIndicesMethod.Interval);
                }}
                sx={{
                  padding: "10px",
                }}
              >
                <ProjectionsNumberInput
                  label="Start"
                  field="start"
                  defaultValue={firstIndex}
                />
                <ProjectionsNumberInput
                  label="Stop"
                  field="stop"
                  defaultValue={lastIndex}
                />
                <ProjectionsNumberInput
                  label="Steo"
                  field="step"
                  defaultValue={100}
                />
              </Stack>
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
