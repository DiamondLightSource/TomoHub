import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import {
  Visit,
  VisitInput,
  visitToText,
} from "@diamondlightsource/sci-react-ui";
import { SubmissionFormSharedFragment$key } from "./__generated__/SubmissionFormSharedFragment.graphql";
import { JSONObject } from "../../types";
import React, { useState } from "react";
import WorkflowStatus from "./WorkflowStatus";
import { WorkflowStatusSubscription$data } from "./__generated__/WorkflowStatusSubscription.graphql";
import { useFragment } from "react-relay";
import { useTifURLContext } from "../../contexts/CropContext";
import { sharedFragment } from "./Submission";

interface SubmissionFormRawProjectionsProps {
  template: SubmissionFormSharedFragment$key;
  prepopulatedParameters?: JSONObject;
  visit?: Visit;
  onSubmit: (
    visit: Visit,
    parameters: object,
    onSuccess?: (workflowName: string) => void
  ) => void;
}

export default function SubmissionFormRawProjections({
  template,
  prepopulatedParameters,
  visit,
  onSubmit: submitWorkflow,
}: SubmissionFormRawProjectionsProps) {
  // TODO: take these in as actual props instead of assuming
  const firstIndex = 100;
  const lastIndex = 3700;

  const templateData = useFragment(sharedFragment, template);
  console.log(templateData);
  const theme = useTheme();
  const { setTifURL } = useTifURLContext();
  const [workflowSubmitted, setWorkflowSubmitted] = useState(false);
  const [retryButtonVisible, setRetryButtonVisible] = useState(false);

  const [workflowName, setWorkflowName] = useState<undefined | string>(
    undefined
  );

  const [submittedWorkflowArguments, setSubmittedWorkflowArguments] = useState({
    input: "",
    "tmpdir-path": templateData.arguments.properties["tmpdir-path"].default,
    "dataset-path": "",
    memory: templateData.arguments.properties.memory.default,
    nprocs: Number(templateData.arguments.properties.nprocs.default),
    "output-filename":
      templateData.arguments.properties["output-filename"].default,
  });
  const [submittedVisit, setSubmittedVisit] = useState<undefined | Visit>(
    undefined
  );

  const [showAdvancedIndicesOptions, setShowAdvancedIndicesOptions] =
    useState(false);

  enum ProjectionIndicesMethod {
    Checkbox,
    Interval,
    List,
  }
  const [submittedProjecitonIndicesMethod, setIndicesMethod] =
    useState<ProjectionIndicesMethod>(ProjectionIndicesMethod.Checkbox);

  const [submittedProjectionIndicesValues, setProjectionIndicesValues] =
    useState({
      boxesChecked: { start: true, mid: true, end: true },
      intervalValues: { start: firstIndex, stop: lastIndex, step: 100 },
      indexList: "",
    });

  function onRawProjectionsFormSubmit(visit: Visit) {
    setSubmittedVisit(visit);
    let indices = "";
    if (submittedProjecitonIndicesMethod === ProjectionIndicesMethod.Checkbox) {
      if (submittedProjectionIndicesValues.boxesChecked.start) {
        indices += String(firstIndex);
      }
      if (submittedProjectionIndicesValues.boxesChecked.mid) {
        if (indices !== "") {
          indices += ", ";
        }
        indices += String((firstIndex + lastIndex) / 2);
      }
      if (submittedProjectionIndicesValues.boxesChecked.end) {
        if (indices !== "") {
          indices += ", ";
        }
        indices += String(lastIndex);
      }
    } else if (
      submittedProjecitonIndicesMethod === ProjectionIndicesMethod.Interval
    ) {
      const start: number =
        submittedProjectionIndicesValues.intervalValues.start;
      const stop: number = submittedProjectionIndicesValues.intervalValues.stop;
      const step: number = submittedProjectionIndicesValues.intervalValues.step;
      for (let i = start; i < stop; i += step) {
        indices += i + ", ";
      }
      indices += stop;
    } else if (
      submittedProjecitonIndicesMethod === ProjectionIndicesMethod.List
    ) {
      // TODO: error handling either here or on the textfield to make sure input is of the right form
      indices = submittedProjectionIndicesValues.indexList;
    }

    // TODO: error handling here to replace empty strings with null in some cases??
    const parameters = {
      ...submittedWorkflowArguments,
      "projection-indices": indices,
    };

    function workflowSuccessfullySubmitted(submittedWorkflowName: string) {
      setWorkflowName(submittedWorkflowName);
      setWorkflowSubmitted(true);
    }

    // TODO: Also handle authentication errors here
    submitWorkflow(visit, parameters, workflowSuccessfullySubmitted);
  }

  function onWorkflowDataChange(data: WorkflowStatusSubscription$data) {
    const c = data.workflow.status;
    if (c === null || c === undefined) {
      return;
    }
    if (
      c.__typename === "WorkflowErroredStatus" ||
      c.__typename === "WorkflowFailedStatus"
    ) {
      setRetryButtonVisible(true);
      return;
    }
    setRetryButtonVisible(false);

    if ("tasks" in c) {
      const zipFilesList = c.tasks[0].artifacts.filter(
        (a) => a.name === "projections.tif"
      );
      if (zipFilesList.length !== 0) {
        setTifURL(
          c.tasks[0].artifacts.filter((a) => a.name === "projections.tif")[0]
            .url
        );
      }
    }
  }

  return (
    <div>
      {workflowSubmitted && workflowName !== undefined ? (
        <div>
          <WorkflowStatus
            workflow={workflowName}
            visit={visitToText(submittedVisit)}
            onWorkflowDataChange={onWorkflowDataChange}
          />
          {retryButtonVisible && (
            <Button
              onClick={() => {
                setWorkflowSubmitted(false);
                setRetryButtonVisible(false);
                setSubmittedVisit(undefined);
                setWorkflowName(undefined);
              }}
              variant={"outlined"}
            >
              Refill form
            </Button>
          )}
        </div>
      ) : (
        <Stack direction="column" spacing={theme.spacing(2)}>
          <Typography variant="h4" align="center">
            Workflow:{" "}
            {templateData.title ? templateData.title : templateData.name}
          </Typography>
          <Divider />
          <Typography variant="h6">Mandatory Parameters</Typography>
          <TextField
            label="Dataset Path"
            type="string"
            fullWidth
            size="small"
            onChange={(e) => {
              setSubmittedWorkflowArguments({
                ...submittedWorkflowArguments,
                "dataset-path": e.target.value,
              });
            }}
          />
          <TextField
            label="Input"
            type="string"
            fullWidth
            size="small"
            onChange={(e) => {
              setSubmittedWorkflowArguments({
                ...submittedWorkflowArguments,
                input: e.target.value,
              });
            }}
          />
          <Divider />
          <Typography variant="h6">Projections</Typography>
          <Stack
            direction="row"
            spacing={4}
            alignItems="center"
            justifyContent="space-between"
          >
            {/* not sure I like the layout of this bit */}
            {/* TODO: change or gather more opinions */}
            <Box
              onClick={() => {
                setIndicesMethod(ProjectionIndicesMethod.Checkbox);
              }}
              sx={{
                padding: "10px",
                "border-radius": "5px",
                ...(submittedProjecitonIndicesMethod ===
                  ProjectionIndicesMethod.Checkbox && showAdvancedIndicesOptions
                  ? { border: "2px solid grey" }
                  : { border: "2px solid transparent" }),
              }}
            >
              {/* can definitely make a function for these onClick functions */}
              {/* but also I want to keep functionality of them nearby??
              TODO: Ask Yousef about this */}
              <FormGroup row>
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
                  sx={{ "margin-left": 30, "margin-right": 30 }}
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
                  sx={{ "margin-left": 30, "margin-right": 30 }}
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
                  sx={{ "margin-left": 30, "margin-right": 30 }}
                />
              </FormGroup>
            </Box>
            {!showAdvancedIndicesOptions ? (
              <Button
                variant="outlined"
                onClick={() => {
                  setShowAdvancedIndicesOptions(true);
                  setIndicesMethod(ProjectionIndicesMethod.Checkbox);
                }}
                data-testid="wf-advanced-toggle"
                sx={{ flexShrink: 0, minWidth: "120px" }}
                startIcon={<ExpandMoreIcon />}
              >
                Advanced
              </Button>
            ) : (
              <IconButton
                onClick={() => setShowAdvancedIndicesOptions(false)}
                sx={{ flexShrink: 0, minWidth: "40px" }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Stack>
          {showAdvancedIndicesOptions && (
            <Box>
              <Stack
                direction="row"
                spacing={2}
                onClick={() => {
                  setIndicesMethod(ProjectionIndicesMethod.Interval);
                }}
                sx={{
                  padding: "10px",
                  "border-radius": "5px",
                  ...(submittedProjecitonIndicesMethod ===
                  ProjectionIndicesMethod.Interval
                    ? { border: "2px solid grey" }
                    : { border: "2px solid transparent" }),
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
              <Box
                onClick={() => {
                  setIndicesMethod(ProjectionIndicesMethod.List);
                }}
                sx={{
                  padding: "10px",
                  "border-radius": "5px",
                  ...(submittedProjecitonIndicesMethod ===
                  ProjectionIndicesMethod.List
                    ? { border: "2px solid grey" }
                    : { border: "2px solid transparent" }),
                }}
              >
                <TextField
                  label="Indices List"
                  fullWidth
                  size="small"
                  defaultValue={submittedProjectionIndicesValues.indexList}
                  onChange={(e) => {
                    setProjectionIndicesValues({
                      ...submittedProjectionIndicesValues,
                      indexList: e.target.value,
                    });
                  }}
                />
              </Box>
            </Box>
          )}
          <Divider />
          <Typography variant="h6">Advanced Parameters</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
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
          <Divider />
          <VisitInput
            visit={visit}
            onSubmit={onRawProjectionsFormSubmit}
            parameters={prepopulatedParameters}
            submitOnReturn={false}
            submitButton={true}
          />
          <Divider />
        </Stack>
      )}
    </div>
  );
}
