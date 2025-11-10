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
import { useState } from "react";
import WorkflowStatus from "./WorkflowStatus";
import { WorkflowStatusSubscription$data } from "./__generated__/WorkflowStatusSubscription.graphql";
import { setKey } from "../../devKey";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";
import { SubmissionFormRawProjectionsQuery } from "./__generated__/SubmissionFormRawProjectionsQuery.graphql";
import { useTifURLContext } from "../../contexts/CropContext";
import { sharedFragment } from "./Submission";

const query = graphql`
  query SubmissionFormRawProjectionsQuery {
    workflow(
      name: "extract-raw-projections-trh5f"
      visit: { proposalCode: "cm", proposalNumber: 40628, number: 2 }
    ) {
      name
      status {
        ... on WorkflowSucceededStatus {
          tasks {
            artifacts {
              name
              url
            }
          }
        }
      }
    }
  }
`;

function CallQuery({
  setTifURL,
}: {
  setTifURL: (url: string | undefined) => void;
}): JSX.Element {
  const data = useLazyLoadQuery<SubmissionFormRawProjectionsQuery>(query, {});
  console.log(data);

  const c = data.workflow.status;
  if (c === null || c === undefined) {
    return <p>first</p>;
  }

  if (c.tasks !== undefined) {
    const zipFilesList = c.tasks[0].artifacts.filter(
      (a) => a.name === "projections.tif"
    );
    if (zipFilesList.length !== 0) {
      // SET DATA HERE!!
      console.log(
        "tiff url: " +
          c.tasks[0].artifacts.filter((a) => a.name === "projections.tif")[0]
            .url
      );
      setTifURL(
        c.tasks[0].artifacts.filter((a) => a.name === "projections.tif")[0].url
      );
    }
  }
  return <Box></Box>;
}

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
  const templateData = useFragment(sharedFragment, template);
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
  const [zipURL, setZipURL] = useState<string | undefined>(undefined);
  const [submitteddatasetPath, setSubmittedDatasetPath] = useState("");
  const [submittedInput, setSubmittedInput] = useState("");
  // is there a way to get the defualt parameter values to put in here??
  const [submittedMemory, setSubmittedMemory] = useState("20Gi");
  const [submittedNprocs, setSubmittedNprocs] = useState<number | string>(1);
  const [submittedOutputFilename, setSubmittedOutputFilename] =
    useState("projections.tif");
  const [submittedTmpdirPath, setSubmittedTmpdirPath] = useState("/tmp");
  const [keyFormValue, setKeyFormValue] = useState<string | undefined>(
    undefined
  );

  const [showAdvancedIndicesOptions, setShowAdvancedIndicesOptions] =
    useState(false);

  // convert this to an enum
  const [indicesMethod, setIndicesMethod] = useState<
    "Checkbox" | "Interval" | "List"
  >("Checkbox");

  function onRawProjectionsFormSubmit(visit: Visit) {
    setSubmittedVisit(visit);
    let indices = "";
    const start: number =
      sweepFormValue.start === "" ? 100 : sweepFormValue.start;
    const stop: number =
      sweepFormValue.stop === "" ? 3600 : sweepFormValue.stop;
    const step: number = sweepFormValue.step === "" ? 100 : sweepFormValue.step;
    for (let i = start; i < stop; i += step) {
      indices += i + ", ";
    }
    indices += stop;

    // TODO: error handling here to replace empty strings with null in some cases??
    const parameters = {
      input: inputFormValue,
      "tmpdir-path": wfparamFormValue.httomo_outdir_name,
      "dataset-path": wfparamFormValue.input,
      memory: wfparamFormValue.memory,
      nprocs: wfparamFormValue.nprocs,
      "projection-indices": indices,
      "output-filename": wfparamFormValue.output,
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
            <Box
              onClick={() => {
                setIndicesMethod("Checkbox");
              }}
              sx={
                indicesMethod === "Checkbox"
                  ? {
                      border: "2px solid grey",
                      "border-radius": 5,
                      padding: "10px",
                    }
                  : { padding: "10px" }
              }
            >
              <FormGroup row>
                <FormControlLabel
                  control={<Checkbox />}
                  label="Start"
                  sx={{ "margin-left": 30, "margin-right": 30 }}
                />
                <FormControlLabel
                  control={<Checkbox />}
                  label="Mid"
                  sx={{ "margin-left": 30, "margin-right": 30 }}
                />
                <FormControlLabel
                  control={<Checkbox />}
                  label="End"
                  sx={{ "margin-left": 30, "margin-right": 30 }}
                />
              </FormGroup>
            </Box>
            {!showAdvancedIndicesOptions ? (
              <Button
                variant="outlined"
                onClick={() => setShowAdvancedIndicesOptions(true)}
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
                  setIndicesMethod("Interval");
                }}
                sx={
                  indicesMethod === "Interval"
                    ? {
                        border: "2px solid grey",
                        "border-radius": 5,
                        padding: "10px",
                      }
                    : { padding: "10px" }
                }
              >
                <TextField
                  label="Start"
                  type="number"
                  value={100}
                  // onChange={handleNum("start")}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Stop"
                  type="number"
                  value={3600}
                  // onChange={handleNum("stop")}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Step"
                  type="number"
                  value={100}
                  // onChange={handleNum("step")}
                  fullWidth
                  size="small"
                />
              </Stack>
              <Box
                onClick={() => {
                  setIndicesMethod("List");
                }}
                sx={
                  indicesMethod === "List"
                    ? {
                        "margin-top": 10,
                        border: "2px solid grey",
                        "border-radius": 5,
                        padding: "10px",
                      }
                    : { "margin-top": 10, padding: "10px" }
                }
              >
                <TextField label="Indices List" fullWidth size="small" />
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
