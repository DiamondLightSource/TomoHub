import ParameterSweepForm from "./sweepPipeline/ParameterSweepForm";
import WorkflowParametersForm from "./WorkflowParametersForm";
import { SweepValues } from "./sweepPipeline/ParameterSweepForm";
import { Divider, Input, TextField, Typography } from "@mui/material";
import { WorkflowParamsValues } from "./WorkflowParametersForm";
import { Visit, VisitInput } from "@diamondlightsource/sci-react-ui";

export default function SubmissionFormRawProjections() {
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

  const visit: Visit = {
    proposalCode: "cm",
    proposalNumber: 40628,
    number: 2,
  };

  const anotherPlaceHolderSetter = (visit: Visit, parameters?: object) => {
    console.log("another run");
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
        submitOnReturn={false}
        submitButton={true}
      />
    </div>
  );
}
