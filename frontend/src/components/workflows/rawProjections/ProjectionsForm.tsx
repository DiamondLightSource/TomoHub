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
  RawProjectionWorkflowErrors,
} from "./SubmissionFormRawProjections";

interface ProjectionsFormProps {
  submittedProjectionIndicesValues: RawProjectionIndicesArguments;
  setProjectionIndicesValues: (args: RawProjectionIndicesArguments) => void;
  submittedProjectionIndicesMethod: ProjectionIndicesMethod;
  setIndicesMethod: (method: ProjectionIndicesMethod) => void;
  formErrors: RawProjectionWorkflowErrors;
  setFormErrors: (args: RawProjectionWorkflowErrors) => void;
  theme: Theme;
}
// needs to be defined outside the render function
// or textfield blurs as soon as anything is typed
function ProjectionsNumberInput({
  label,
  field,
  submittedProjectionIndicesValues,
  setProjectionIndicesValues,
  formErrors,
  setFormErrors,
}: {
  label: string;
  field: "start" | "stop" | "step";
  submittedProjectionIndicesValues: RawProjectionIndicesArguments;
  setProjectionIndicesValues: (args: RawProjectionIndicesArguments) => void;
  formErrors: RawProjectionWorkflowErrors;
  setFormErrors: (args: RawProjectionWorkflowErrors) => void;
}) {
  const projectionIndicesObject: RawProjectionIndicesArguments = {
    ...submittedProjectionIndicesValues,
  };
  const formErrorsObject: RawProjectionWorkflowErrors = {
    ...formErrors,
  };
  return (
    <TextField
      label={label}
      type="number"
      value={submittedProjectionIndicesValues.intervalValues[field]}
      onChange={(e) => {
        const raw = e.target.value;
        const numberValue = Number(raw);
        let error = false;
        if (raw === "") {
          error = true;
        } else if (numberValue < 1 || !Number.isInteger(numberValue)) {
          // TODO: could add a different field for this case (with a different error message)
          error = true;
        } else {
          projectionIndicesObject.intervalValues[field] = numberValue;
        }
        formErrorsObject.projectionsIntervalNaN[field] = false; // error;
        setProjectionIndicesValues(projectionIndicesObject);
        formErrorsObject.projectionsIntervalNaN[field] = error;
        setFormErrors({ ...formErrorsObject });
      }}
      onBlur={() => {
        const formErrorsObject: RawProjectionWorkflowErrors = {
          ...formErrors,
        };
        formErrorsObject.projectionsIntervalNaN[field] = false;
        setFormErrors(formErrorsObject);
      }}
      fullWidth
      size="small"
      error={formErrors.projectionsIntervalNaN[field]}
    />
  );
}

export default function ProjectionsForm({
  submittedProjectionIndicesValues,
  setProjectionIndicesValues,
  submittedProjectionIndicesMethod,
  setIndicesMethod,
  formErrors,
  setFormErrors,
  theme,
}: ProjectionsFormProps) {
  const allBoxesUnchecked =
    !submittedProjectionIndicesValues.boxesChecked.start &&
    !submittedProjectionIndicesValues.boxesChecked.mid &&
    !submittedProjectionIndicesValues.boxesChecked.end;
  if (formErrors.allBoxesUnchecked !== allBoxesUnchecked) {
    setFormErrors({
      ...formErrors,
      allBoxesUnchecked: allBoxesUnchecked,
    });
  }
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
            checked={submittedProjectionIndicesValues.boxesChecked[value]}
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
            "border-radius": "5px",
            ...(submittedProjectionIndicesMethod ===
              ProjectionIndicesMethod.Checkbox && formErrors.allBoxesUnchecked
              ? { border: "2px solid red" }
              : { border: "2px solid transparent" }),
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
                  submittedProjectionIndicesValues={
                    submittedProjectionIndicesValues
                  }
                  setProjectionIndicesValues={setProjectionIndicesValues}
                  formErrors={formErrors}
                  setFormErrors={setFormErrors}
                />
                <ProjectionsNumberInput
                  label="Stop"
                  field="stop"
                  submittedProjectionIndicesValues={
                    submittedProjectionIndicesValues
                  }
                  setProjectionIndicesValues={setProjectionIndicesValues}
                  formErrors={formErrors}
                  setFormErrors={setFormErrors}
                />
                <ProjectionsNumberInput
                  label="Step"
                  field="step"
                  submittedProjectionIndicesValues={
                    submittedProjectionIndicesValues
                  }
                  setProjectionIndicesValues={setProjectionIndicesValues}
                  formErrors={formErrors}
                  setFormErrors={setFormErrors}
                />
              </Stack>
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
