import ParameterSweepForm from "./sweepPipeline/ParameterSweepForm";
import WorkflowParametersForm from "./WorkflowParametersForm";
import { SweepValues } from "./sweepPipeline/ParameterSweepForm";
import { Button, TextField, Typography } from "@mui/material";
import { WorkflowParamsValues } from "./WorkflowParametersForm";
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
import { useTifURLContext } from "../../contexts/CropContext";

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
  template: _,
  prepopulatedParameters,
  visit,
  onSubmit: submitWorkflow,
}: SubmissionFormRawProjectionsProps) {
  const { setTifURL } = useTifURLContext();
  const [workflowSubmitted, setWorkflowSubmitted] = useState(false);
  const [retryButtonVisible, setRetryButtonVisible] = useState(false);

  const [workflowName, setWorkflowName] = useState<undefined | string>(
    undefined
  );
  const [submittedVisit, setSubmittedVisit] = useState<undefined | Visit>(
    undefined
  );
  const [inputFormValue, setInputFormValue] = useState<string>("");
  const [sweepFormValue, setSweepFormValue] = useState<SweepValues>({
    start: 100,
    stop: 3700,
    step: 100,
  });
  const [keyFormValue, setKeyFormValue] = useState<string | undefined>(
    undefined
  );
  const [wfparamFormValue, setWFParamFormValue] =
    useState<WorkflowParamsValues>({
      input: "",
      output: "",
      nprocs: 1,
      memory: "20Gi",
      httomo_outdir_name: "/tmp",
    });

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
    setKey(keyFormValue);

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
        (a) => a.name === "projections.zip"
      );
      if (zipFilesList.length !== 0) {
        setTifURL(
          c.tasks[0].artifacts.filter((a) => a.name === "projections.zip")[0]
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
        <div>
          <TextField
            label="Input"
            type="string"
            fullWidth
            size="small"
            onChange={(e) => {
              setInputFormValue(e.target.value);
            }}
          />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Frames to Crop
          </Typography>
          <ParameterSweepForm
            values={sweepFormValue}
            onChange={setSweepFormValue}
          />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Workflow Parameters
          </Typography>
          <WorkflowParametersForm
            values={wfparamFormValue}
            onChange={setWFParamFormValue}
          />
          <TextField
            label="Auth Token"
            type="string"
            fullWidth
            size="small"
            onChange={(e) => {
              setKeyFormValue(e.target.value);
            }}
          />
          <VisitInput
            visit={visit}
            onSubmit={onRawProjectionsFormSubmit}
            parameters={prepopulatedParameters}
            submitOnReturn={false}
            submitButton={true}
          />
        </div>
      )}
    </div>
  );
}
