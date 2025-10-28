import ParameterSweepForm from "./sweepPipeline/ParameterSweepForm";
import WorkflowParametersForm from "./WorkflowParametersForm";
import { SweepValues } from "./sweepPipeline/ParameterSweepForm";
import { TextField, Typography } from "@mui/material";
import { WorkflowParamsValues } from "./WorkflowParametersForm";
import { Visit, VisitInput } from "@diamondlightsource/sci-react-ui";
import { SubmissionFormSharedFragment$key } from "./__generated__/SubmissionFormSharedFragment.graphql";
import { JSONObject } from "../../types";
import { setKey } from "../../devKey";
import { useState } from "react";

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
  const [inputFormValue, setInputFormValue] = useState<string>("");
  const [keyFormValue, setKeyFormValue] = useState<string | undefined>(
    undefined
  );
  const [sweepFormValue, setSweepFormValue] = useState<SweepValues>({
    start: 100,
    stop: 3600,
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

  function onSubmit(visit: Visit) {
    const indices = "";

    // error handling here to replace empty strings with null in some cases??
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
    // add on success function as final paramter (load data and set data loaded to true)
    submitWorkflow(visit, parameters);
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
        onSubmit={onSubmit}
        parameters={prepopulatedParameters}
        submitOnReturn={false}
        submitButton={true}
      />
    </div>
  );
}
