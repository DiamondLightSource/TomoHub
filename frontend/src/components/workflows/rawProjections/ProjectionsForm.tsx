import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  Stack,
  TextField,
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
}

export default function ProjectionsForm({
  submittedProjectionIndicesValues,
  setProjectionIndicesValues,
  submittedProjectionIndicesMethod,
  setIndicesMethod,
  firstIndex,
  lastIndex,
}: ProjectionsFormProps) {
  return (
    <Box>
      <Typography variant="h6">Projections</Typography>
      <Stack
        direction="row"
        spacing={4}
        alignItems="center"
        justifyContent="space-between"
        sx={{ height: "100px" }}
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
          {/* can definitely make a function to reduce the code needed in these onClick functions */}
          {/* but also I want to keep functionality of them nearby??
              TODO: Ask Yousef about this */}
          {submittedProjectionIndicesMethod ===
            ProjectionIndicesMethod.Checkbox && (
            <FormGroup row>
              <Stack
                direction="row"
                justifyContent={"space-evenly"}
                sx={{ width: "100%" }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        submittedProjectionIndicesValues.boxesChecked.start
                      }
                      onChange={(e) => {
                        setProjectionIndicesValues({
                          ...submittedProjectionIndicesValues,
                          boxesChecked: {
                            ...submittedProjectionIndicesValues.boxesChecked,
                            start: e.target.checked,
                          },
                        });
                      }}
                    />
                  }
                  label="Start"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        submittedProjectionIndicesValues.boxesChecked.mid
                      }
                      onChange={(e) => {
                        setProjectionIndicesValues({
                          ...submittedProjectionIndicesValues,
                          boxesChecked: {
                            ...submittedProjectionIndicesValues.boxesChecked,
                            mid: e.target.checked,
                          },
                        });
                      }}
                    />
                  }
                  label="Mid"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        submittedProjectionIndicesValues.boxesChecked.end
                      }
                      onChange={(e) => {
                        setProjectionIndicesValues({
                          ...submittedProjectionIndicesValues,
                          boxesChecked: {
                            ...submittedProjectionIndicesValues.boxesChecked,
                            end: e.target.checked,
                          },
                        });
                      }}
                    />
                  }
                  label="End"
                />
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
                {/* TODO: can definitely make a function for these onClick functions */}
                <TextField
                  label="Start"
                  type="number"
                  defaultValue={
                    submittedProjectionIndicesValues.intervalValues.start
                  }
                  onChange={(e) => {
                    const raw = e.target.value;
                    const parsed = raw === "" ? 0 : Number(raw);
                    setProjectionIndicesValues({
                      ...submittedProjectionIndicesValues,
                      intervalValues: {
                        ...submittedProjectionIndicesValues.intervalValues,
                        start: parsed ?? firstIndex,
                      },
                    });
                  }}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Stop"
                  type="number"
                  defaultValue={
                    submittedProjectionIndicesValues.intervalValues.stop
                  }
                  onChange={(e) => {
                    const raw = e.target.value;
                    const parsed = raw === "" ? 0 : Number(raw);
                    setProjectionIndicesValues({
                      ...submittedProjectionIndicesValues,
                      intervalValues: {
                        ...submittedProjectionIndicesValues.intervalValues,
                        stop: parsed ?? lastIndex,
                      },
                    });
                  }}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Step"
                  type="number"
                  defaultValue={
                    submittedProjectionIndicesValues.intervalValues.step
                  }
                  onChange={(e) => {
                    const raw = e.target.value;
                    const parsed = raw === "" ? 0 : Number(raw);
                    setProjectionIndicesValues({
                      ...submittedProjectionIndicesValues,
                      intervalValues: {
                        ...submittedProjectionIndicesValues.intervalValues,
                        start: parsed ?? 100,
                      },
                    });
                  }}
                  fullWidth
                  size="small"
                />
              </Stack>
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
