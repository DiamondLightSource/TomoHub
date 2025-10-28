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
  onSubmit,
}: SubmissionFormRawProjectionsProps) {
  const data = useFragment(sharedFragment, template);

  const sweepValues: SweepValues = { start: "", stop: "", step: "" };
  const placeholderSetter = (s: SweepValues) => {
    console.log("run");
  };

  const workflowValues: WorkflowParamsValues = {
    input: "",
    output: "",
    nprocs: 1,
    memory: "20Gi",
    httomo_outdir_name: "/tmp",
  };

  const otherPlaceHolderSetter = (w: WorkflowParamsValues) => {
    console.log("other run");
  };

  const anotherPlaceHolderSetter = (visit: Visit, parameters?: object) => {
    onSubmit(visit, parameters || {});
  };

  return (
    <div>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Frames to Crop
      </Typography>
      <ParameterSweepForm values={sweepValues} onChange={placeholderSetter} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Workflow Parameters
      </Typography>
      <WorkflowParametersForm
        values={workflowValues}
        onChange={otherPlaceHolderSetter}
      />
      <TextField label="Auth Token" type="string" fullWidth size="small" />
      <VisitInput
        visit={visit}
        onSubmit={anotherPlaceHolderSetter}
        parameters={prepopulatedParameters}
        submitOnReturn={false}
        submitButton={true}
      />
    </div>
  );
}
