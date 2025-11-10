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
import { setKey } from "../../devKey";
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
  const [submittedVisit, setSubmittedVisit] = useState<undefined | Visit>(
    undefined
  );
  const [submittedDatasetPath, setSubmittedDatasetPath] = useState("");
  const [submittedInput, setSubmittedInput] = useState("");
  const [submittedMemory, setSubmittedMemory] = useState(
    templateData.arguments.properties.memory.default
  );
  const [submittedNprocs, setSubmittedNprocs] = useState<number | string>(
    Number(templateData.arguments.properties.nprocs.default)
  );
  const [submittedOutputFilename, setSubmittedOutputFilename] = useState(
    templateData.arguments.properties["output-filename"].default
  );
  const [submittedTmpdirPath, setSubmittedTmpdirPath] = useState(
    templateData.arguments.properties["tmpdir-path"].default
  );
  const [keyFormValue, setKeyFormValue] = useState<string | undefined>(
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

  const [submittedProjectionBoxesChecked, setProjectionBoxesChecked] = useState(
    {
      start: true,
      mid: true,
      end: true,
    }
  );

  const [submittedProjectionIntervalValues, setProjectionIntervalValues] =
    useState({
      start: firstIndex,
      stop: lastIndex,
      step: 100,
    });

  const [submittedProjectionsListValue, setProjectionsListValue] = useState("");

  function onRawProjectionsFormSubmit(visit: Visit) {
    setSubmittedVisit(visit);
    let indices = "";
    if (submittedProjecitonIndicesMethod === ProjectionIndicesMethod.Checkbox) {
      if (submittedProjectionBoxesChecked.start) {
        indices += String(firstIndex);
      }
      if (submittedProjectionBoxesChecked.mid) {
        if (indices !== "") {
          indices += ", ";
        }
        indices += String((firstIndex + lastIndex) / 2);
      }
      if (submittedProjectionBoxesChecked.end) {
        if (indices !== "") {
          indices += ", ";
        }
        indices += String(lastIndex);
      }
    } else if (
      submittedProjecitonIndicesMethod === ProjectionIndicesMethod.Interval
    ) {
      const start: number = submittedProjectionIntervalValues.start;
      const stop: number = submittedProjectionIntervalValues.stop;
      const step: number = submittedProjectionIntervalValues.step;
      for (let i = start; i < stop; i += step) {
        indices += i + ", ";
      }
      indices += stop;
    } else if (
      submittedProjecitonIndicesMethod === ProjectionIndicesMethod.List
    ) {
      // TODO: error handling either here or on the textfield to make sure input is of the right form
      indices = submittedProjectionsListValue;
    }

    // TODO: error handling here to replace empty strings with null in some cases??
    const parameters = {
      input: submittedInput,
      "tmpdir-path": submittedTmpdirPath,
      "dataset-path": submittedDatasetPath,
      memory: submittedMemory,
      nprocs: submittedNprocs,
      "projection-indices": indices,
      "output-filename": submittedOutputFilename,
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
              setSubmittedDatasetPath(e.target.value);
            }}
          />
          <TextField
            label="Input"
            type="string"
            fullWidth
            size="small"
            onChange={(e) => {
              setSubmittedInput(e.target.value);
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
                      checked={submittedProjectionBoxesChecked.start}
                      onChange={(e) => {
                        setProjectionBoxesChecked({
                          ...submittedProjectionBoxesChecked,
                          start: e.target.checked as boolean,
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
                      checked={submittedProjectionBoxesChecked.mid}
                      onChange={(e) => {
                        setProjectionBoxesChecked({
                          ...submittedProjectionBoxesChecked,
                          mid: e.target.checked as boolean,
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
                      checked={submittedProjectionBoxesChecked.end}
                      onChange={(e) => {
                        setProjectionBoxesChecked({
                          ...submittedProjectionBoxesChecked,
                          end: e.target.checked as boolean,
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
                  defaultValue={submittedProjectionIntervalValues.start}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const parsed = raw === "" ? 0 : Number(raw);
                    setProjectionIntervalValues({
                      ...submittedProjectionIntervalValues,
                      start: parsed === undefined ? 100 : parsed,
                    });
                  }}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Stop"
                  type="number"
                  defaultValue={submittedProjectionIntervalValues.stop}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const parsed = raw === "" ? 0 : Number(raw);
                    setProjectionIntervalValues({
                      ...submittedProjectionIntervalValues,
                      stop: parsed === undefined ? 100 : parsed,
                    });
                  }}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Step"
                  type="number"
                  defaultValue={submittedProjectionIntervalValues.step}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const parsed = raw === "" ? 0 : Number(raw);
                    setProjectionIntervalValues({
                      ...submittedProjectionIntervalValues,
                      step: parsed === undefined ? 100 : parsed,
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
                  defaultValue={submittedProjectionsListValue}
                  onChange={(e) => {
                    setProjectionsListValue(e.target.value);
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
              value={submittedMemory}
              onChange={(e) => {
                setSubmittedMemory(e.target.value);
              }}
            />
            <TextField
              label="Nprocs"
              type="number"
              fullWidth
              size="small"
              value={submittedNprocs}
              onChange={(e) => {
                setSubmittedNprocs(
                  e.target.value === "" ? "" : Number(e.target.value)
                );
              }}
            />
            <TextField
              label="Output Filename"
              type="string"
              fullWidth
              size="small"
              value={submittedOutputFilename}
              onChange={(e) => {
                setSubmittedOutputFilename(e.target.value);
              }}
            />
            <TextField
              label="Tmpdir Path"
              type="string"
              fullWidth
              size="small"
              value={submittedTmpdirPath}
              onChange={(e) => {
                setSubmittedTmpdirPath(e.target.value);
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
          <TextField
            label="Auth Token"
            type="string"
            fullWidth
            size="small"
            onChange={(e) => {
              setKeyFormValue(e.target.value);
            }}
          />
        </Stack>
      )}
    </div>
  );
}
