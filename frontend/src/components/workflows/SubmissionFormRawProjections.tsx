import ParameterSweepForm from "./sweepPipeline/ParameterSweepForm";
import WorkflowParametersForm from "./WorkflowParametersForm";
import { SweepValues } from "./sweepPipeline/ParameterSweepForm";
import { TextField, Typography } from "@mui/material";
import { WorkflowParamsValues } from "./WorkflowParametersForm";
import { Visit, VisitInput } from "@diamondlightsource/sci-react-ui";
import { SubmissionFormSharedFragment$key } from "./__generated__/SubmissionFormSharedFragment.graphql";
import { JSONObject } from "../../types";
import { useState } from "react";
import { setKey } from "../../devKey";
import WorkflowStatus from "./WorkflowStatus";
import { WorkflowStatusQuery$data } from "./__generated__/WorkflowStatusQuery.graphql";

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
  const [authTokenUpdated, setAuthTokenUpdated] = useState(false);

  function onWorkflowDataChange(data: WorkflowStatusQuery$data) {
    console.log(data);
    const c = data.workflow.status;
    if (c !== null && c !== undefined) {
      if ("tasks" in c) {
        const zipFilesList = c.tasks[0].artifacts.filter(
          (a) => a.name === "projections.zip"
        );
        if (zipFilesList.length !== 0) {
          setZipURL(
            c.tasks[0].artifacts.filter((a) => a.name === "projections.zip")[0]
              .url
          );
        }
      }
    }
  }

  const [zipURL, setZipURL] = useState<string | undefined>(undefined);
  const [inputFormValue, setInputFormValue] = useState<string>("");
  const [keyFormValue, setKeyFormValue] = useState<string | undefined>(
    undefined
  );
  const [sweepFormValue, setSweepFormValue] = useState<SweepValues>({
    start: 100,
    stop: 3700,
    step: 100,
  });
  const [wfparamFormValue, setWFParamFormValue] =
    useState<WorkflowParamsValues>({
      input: "",
      output: "",
      nprocs: 1,
      memory: "20Gi",
      httomo_outdir_name: "/tmp",
    });

  function onRawProjectionsFormSubmit(visit: Visit) {
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
    // TODO: add on success function as final paramter (load data and set data loaded to true)
    // submitWorkflow(visit, parameters);
    setAuthTokenUpdated(true);
  }

  return (
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
      {!authTokenUpdated || (
        <WorkflowStatus
          workflow={"extract-raw-projections-r4fb9"} // test for success
          // workflow={"extract-raw-projections-tk4nt"} // test for failed
          // workflow={"extract-raw-projections-7"} // test for errored
          // have to make a live one to test for pending and running
          visit={"cm40628-2"}
          onWorkflowDataChange={onWorkflowDataChange}
        />
      )}
    </div>
  );
}
