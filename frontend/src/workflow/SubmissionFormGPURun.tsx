import { useFragment, graphql } from "react-relay";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonSchema, UISchemaElement, createAjv } from "@jsonforms/core";
import { JsonForms } from "@jsonforms/react";
import React, { useState } from "react";
import { Divider, Snackbar, Stack, Typography, useTheme, Alert } from "@mui/material";
import { ErrorObject } from "ajv";
import { JSONObject, Visit } from "workflows-lib";
import { VisitInput,visitToText } from "@diamondlightsource/sci-react-ui";
import { SubmissionFormSharedFragment$key } from "./__generated__/SubmissionFormSharedFragment.graphql";
import Loader from "../components/Loader";
import { useLoader } from "../contexts/LoaderContext";
import { useMethods } from "../contexts/MethodsContext";
import { sharedFragment } from "./Submission";
import WorkflowStatus from "./WorkflowStatus";
import { useHTTOMOConfig } from "../hooks/useHTTOMOConfig";

const SubmissionFormGPURun = (props: {
  template: SubmissionFormSharedFragment$key;
  prepopulatedParameters?: JSONObject;
  visit?: Visit;
  onSubmit: (visit: Visit, parameters: object, onSuccess?: (workflowName: string) => void) => void;
}) => {
  const data = useFragment(sharedFragment, props.template);
  const theme = useTheme();
  const validator = createAjv({ useDefaults: true, coerceTypes: true });
  const {
    method,
    module_path,
    parameters: loaderParams,
    isContextValid,
    setDataPath,
    setImageKeyPath,
    setRotationAnglesDataPath,
  } = useLoader();
  const { methods } = useMethods();
  const { generateHTTOMOConfig, hasLoaderData, hasMethodsData } = useHTTOMOConfig();

  const customSchema = {
    type: "object",
    properties: {
      input: { type: "string", title: "Input Path" },
      output: { type: "string", title: "Output Path" },
      nprocs: { type: "string", default: "1", title: "Number of Processes" },
      memory: { type: "string", default: "20Gi", title: "Memory" },
    },
    required: ["input", "output", "nprocs", "memory"],
  };

  const customUISchema: UISchemaElement = {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          { type: "Control", scope: "#/properties/input" },
          { type: "Control", scope: "#/properties/output" }
        ]
      },
      {
        type: "HorizontalLayout",
        elements: [
          { type: "Control", scope: "#/properties/nprocs" },
          { type: "Control", scope: "#/properties/memory" }
        ]
      }
    ]
  };

  const [parameters, setParameters] = useState(props.prepopulatedParameters ?? {});
  const [errors, setErrors] = useState<ErrorObject[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submittedWorkflowName, setSubmittedWorkflowName] = useState<string | null>(null);
  const [submittedVisit, setSubmittedVisit] = useState<Visit | null>(null); // Add this

  const generateConfigJSON = () => {
    const combinedData = generateHTTOMOConfig(); 
    return JSON.stringify(combinedData);
  };

  const onClick = (visit: Visit, submitParams?: object) => {
    if (errors.length === 0) {
      const configJSON = generateConfigJSON();
      
      console.log("Generated config JSON for httomo-gpu-job:", configJSON);

      
      const finalParams = {
        config: configJSON,
        input: parameters.input,
        output: parameters.output,
        nprocs: parameters.nprocs,
        memory: parameters.memory
      };

      props.onSubmit(visit, finalParams, (workflowName: string) => {
        console.log("SUCCESS CALLBACK RECEIVED:", workflowName);
        setSubmittedWorkflowName(workflowName);
        setSubmittedVisit(visit); // Capture the visit from the form
      });
      
      setSubmitted(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSubmitted(false);
  };

  const formWidth = 
    (data.uiSchema?.options?.formWidth as string | undefined) ?? "100%";

  return (
    <Stack
      direction="column"
      spacing={theme.spacing(2)}
      sx={{ width: formWidth }}
    >
      <Typography variant="h4" align="center">
        Workflow: {data.title ? data.title : data.name}
      </Typography>
      <Typography variant="body1" align="center">
        {data.description}
      </Typography>
      
      <Divider />
      
      <Loader />

      {submittedWorkflowName && submittedVisit && (
        <WorkflowStatus 
          workflow={submittedWorkflowName} 
          visit={visitToText(submittedVisit)}  // Use the captured visit
        />
      )}
      
      {!hasLoaderData && (
        <Alert severity="info">
          Some Loader fields are empty. They will be auto-filled with default values during submission.
        </Alert>
      )}
      
      {!hasMethodsData && (
        <Alert severity="info">
          No methods configured. Please add methods in the Methods section to create a complete pipeline.
        </Alert>
      )}
      
      <Divider />

      <JsonForms
        schema={customSchema}
        uischema={customUISchema}
        data={parameters}
        renderers={materialRenderers}
        cells={materialCells}
        ajv={validator}
        onChange={({ data, errors }) => {
          setParameters(data as JSONObject);
          setErrors(errors ? errors : []);
        }}
        data-testid="parameters-form"
      />
      
      <Divider />
      
      <VisitInput
        visit={props.visit}
        onSubmit={onClick}
        parameters={parameters}
        submitOnReturn={false}
      />


      
      <Snackbar
        open={submitted}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="Workflow submitted!"
      />
    </Stack>
  );
};

export default SubmissionFormGPURun;