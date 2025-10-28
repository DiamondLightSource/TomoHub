import ParameterSweepForm from "./sweepPipeline/ParameterSweepForm";
import WorkflowParametersForm from "./WorkflowParametersForm";
import { SweepValues } from "./sweepPipeline/ParameterSweepForm";
import { TextField, Typography } from "@mui/material";
import { WorkflowParamsValues } from "./WorkflowParametersForm";
import { Visit, VisitInput } from "@diamondlightsource/sci-react-ui";
import { SubmissionFormSharedFragment$key } from "./__generated__/SubmissionFormSharedFragment.graphql";
import { JSONObject } from "../../types";
import { useFragment } from "react-relay";
import { sharedFragment } from "./Submission";
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
  template,
  prepopulatedParameters,
  visit,
  onSubmit: submitWorkflow,
}: SubmissionFormRawProjectionsProps) {
  const DEVactuallyRunAWorkflow = true;
  const [keyFormValue, setKeyFormValue] = useState<string | undefined>(
    undefined
  );
  const [sweepFormValue, setSweepFormValue] = useState<SweepValues>({
    start: 100,
    stop: 100,
    step: 3600,
  });
  const [wfparamFormValue, setWFParamFormValue] =
    useState<WorkflowParamsValues>({
      input: "",
      output: "",
      nprocs: 1,
      memory: "20Gi",
      httomo_outdir_name: "/tmp",
    });

  const data = useFragment(sharedFragment, template);

  function onSubmit(visit: Visit, parameters?: object) {
    if (parameters === undefined) {
      return;
    }
    if (!DEVactuallyRunAWorkflow) {
      return;
    }
    setKey(keyFormValue);

    submitWorkflow(visit, parameters);
  }

  return (
    <div>
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
