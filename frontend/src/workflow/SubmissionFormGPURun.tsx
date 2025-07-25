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

  const generateConfigJSON = () => {
    let updatedParameters = { ...loaderParams };

    if (!isContextValid()) {
      // Automatically set required fields to "auto"
      if (!updatedParameters.data_path || updatedParameters.data_path.trim() === "") {
        updatedParameters.data_path = "auto";
        setDataPath("auto");
      }
      if (
        typeof updatedParameters.rotation_angles === "string" ||
        !updatedParameters.rotation_angles ||
        !updatedParameters.rotation_angles.data_path ||
        updatedParameters.rotation_angles.data_path.trim() === ""
      ) {
        updatedParameters.rotation_angles = "auto";
        // Also update in the context (this is optional)
        setRotationAnglesDataPath("auto");
      }
      
      // Check if we have darks and flats
      const hasDarks = updatedParameters.darks && updatedParameters.darks.file && updatedParameters.darks.file.trim() !== "";
      const hasFlats = updatedParameters.flats && updatedParameters.flats.file && updatedParameters.flats.file.trim() !== "";
      
      // If we have both darks and flats, remove image_key_path
      if (hasDarks && hasFlats) {
        delete updatedParameters.image_key_path;
      }
      // Otherwise, set it to "auto" if it's empty
      else if (!updatedParameters.image_key_path || updatedParameters.image_key_path.trim() === "") {
        updatedParameters.image_key_path = "auto";
        setImageKeyPath("auto");
      }
    }

    // Ensure preview is always set with null start and stop for both detector_x and detector_y
    // This happens regardless of the context validation (exactly like YAML generator)
    updatedParameters.preview = {
      detector_x: {
        start: null,
        stop: null,
      },
      detector_y: {
        start: null,
        stop: null,
      },
    };

    const loaderContextObject = {
      method,
      module_path,
      parameters: updatedParameters, // Use the updated parameters object
    };

    // Transform methods and inject calculate_stats where needed (exactly like YAML generator)
    const transformedMethods = methods.reduce((acc: any[], method) => {
      const transformedMethod = {
        method: method.method_name,
        module_path: method.method_module,
        parameters: { ...method.parameters },
      };

      if (method.method_name === "rescale_to_int") {
        acc.push({
          method: "calculate_stats",
          module_path: "httomo.methods",
          parameters: {},
          id: "statistics",
          side_outputs: {
            glob_stats: "glob_stats",
          },
        });
      }

      if (
        method.method_name === "find_center_vo" ||
        method.method_name === "find_center_pc"
      ) {
        acc.push({
          ...transformedMethod,
          id: "centering",
          sideoutput: { cor: "center_of_rotation" },
        });
      } else {
        acc.push(transformedMethod);
      }

      return acc;
    }, []);

    const combinedData = [loaderContextObject, ...transformedMethods];

    return JSON.stringify(combinedData);
  };

  const onClick = (visit: Visit, submitParams?: object) => {
    if (errors.length === 0) {
      const configJSON = generateConfigJSON();
      
      // Debug logging
      console.log("Generated config JSON for httomo-gpu-job:", configJSON);
      
      const finalParams = {
        config: configJSON,
        input: parameters.input,
        output: parameters.output,
        nprocs: parameters.nprocs,
        memory: parameters.memory
      };

      // Pass success callback to get workflow name back
      props.onSubmit(visit, finalParams, (workflowName: string) => {
        setSubmittedWorkflowName(workflowName);
      });
      
      setSubmitted(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSubmitted(false);
  };

  const formWidth = 
    (data.uiSchema?.options?.formWidth as string | undefined) ?? "100%";

  const hasLoaderData = isContextValid();
  const hasMethodsData = methods && methods.length > 0;

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

      {submittedWorkflowName && props.visit && (
        <WorkflowStatus 
          workflow={submittedWorkflowName} 
          visit={visitToText(props.visit)}  // Convert Visit object to string
        />
      )}
      
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