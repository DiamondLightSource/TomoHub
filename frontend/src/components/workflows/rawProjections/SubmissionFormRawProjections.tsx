import { Button, Divider, Stack, useTheme } from "@mui/material";
import {
  Visit,
  VisitInput,
  visitToText,
} from "@diamondlightsource/sci-react-ui";
import { SubmissionFormSharedFragment$key } from "../__generated__/SubmissionFormSharedFragment.graphql";
import { JSONObject } from "../../../types";
import { useState } from "react";
import WorkflowStatus from "../WorkflowStatus";
import { WorkflowStatusSubscription$data } from "../__generated__/WorkflowStatusSubscription.graphql";
import { useFragment } from "react-relay";
import { useTifURLContext } from "../../../contexts/CropContext";
import { sharedFragment } from "../Submission";
import MandatoryParametersForm from "./MandatoryParametersForm";
import ProjectionsForm from "./ProjectionsForm";
import AdvancedParameters from "./AdvancedParametersForm";

export type RawProjectionWorkflowArguments = {
  input: string;
  "tmpdir-path": string;
  "dataset-path": string;
  memory: string;
  nprocs: number;
  "output-filename": string;
};

export type RawProjectionIndicesArguments = {
  boxesChecked: { start: boolean; mid: boolean; end: boolean };
  intervalValues: { start: number; stop: number; step: number };
};

export enum ProjectionIndicesMethod {
  Checkbox,
  Interval,
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
  // TODO: take these in as actual props instead of assuming
  const firstIndex = 100;
  const lastIndex = 3700;

  const templateData = useFragment(sharedFragment, template);
  const theme = useTheme();
  const { setTifURL } = useTifURLContext();
  const [workflowSubmitted, setWorkflowSubmitted] = useState(false);
  const [retryButtonVisible, setRetryButtonVisible] = useState(false);

  const [workflowName, setWorkflowName] = useState<undefined | string>(
    undefined
  );

  const [submittedWorkflowArguments, setSubmittedWorkflowArguments] =
    useState<RawProjectionWorkflowArguments>({
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

  const [submittedProjecitonIndicesMethod, setIndicesMethod] =
    useState<ProjectionIndicesMethod>(ProjectionIndicesMethod.Checkbox);

  const [submittedProjectionIndicesValues, setProjectionIndicesValues] =
    useState({
      boxesChecked: { start: true, mid: true, end: true },
      intervalValues: { start: firstIndex, stop: lastIndex, step: 100 },
    });

  function onRawProjectionsFormSubmit(visit: Visit) {
    setSubmittedVisit(visit);
    let indices = "";
    if (submittedProjecitonIndicesMethod === ProjectionIndicesMethod.Checkbox) {
      // adds a projection frame for each box checked
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
      // adds projection frame at start, increments by step and adds one iteratively until stop is reached
      const start: number =
        submittedProjectionIndicesValues.intervalValues.start;
      const stop: number = submittedProjectionIndicesValues.intervalValues.stop;
      const step: number = submittedProjectionIndicesValues.intervalValues.step;
      for (let i = start; i < stop; i += step) {
        indices += i + ", ";
      }
      indices += stop;
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
          <MandatoryParametersForm
            submittedWorkflowArguments={submittedWorkflowArguments}
            setSubmittedWorkflowArguments={setSubmittedWorkflowArguments}
            theme={theme}
          />
          <Divider />
          <ProjectionsForm
            submittedProjectionIndicesValues={submittedProjectionIndicesValues}
            setProjectionIndicesValues={setProjectionIndicesValues}
            submittedProjectionIndicesMethod={submittedProjecitonIndicesMethod}
            setIndicesMethod={setIndicesMethod}
            firstIndex={firstIndex}
            lastIndex={lastIndex}
          />
          <Divider />
          <AdvancedParameters
            submittedWorkflowArguments={submittedWorkflowArguments}
            setSubmittedWorkflowArguments={setSubmittedWorkflowArguments}
          />
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
