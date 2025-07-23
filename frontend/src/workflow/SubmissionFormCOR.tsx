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
import { VisitInput } from "@diamondlightsource/sci-react-ui";
import { SubmissionFormSharedFragment$key } from "./__generated__/SubmissionFormSharedFragment.graphql";
import Loader from "../components/Loader";
import { useLoader } from "../contexts/LoaderContext";
import { sharedFragment } from "./Submission";

const SubmissionFormCOR = (props: {
  template: SubmissionFormSharedFragment$key;
  prepopulatedParameters?: JSONObject;
  visit?: Visit;
  onSubmit: (visit: Visit, parameters: object) => void;
}) => {
  const data = useFragment(sharedFragment, props.template);
  const theme = useTheme();
  const validator = createAjv({ useDefaults: true, coerceTypes: true });
  const { method, module_path, parameters: loaderParams, isContextValid } = useLoader();

  const customSchema = {
    type: "object",
    properties: {
      start: { type: "number", default: 300, title: "Start" },
      stop: { type: "number", default: 350, title: "Stop" },
      step: { type: "number", default: 10, title: "Step" },
      input: { type: "string", title: "Input Path" },
      output: { type: "string", title: "Output Path" },
      nprocs: { type: "string", default: "1", title: "Number of Processes" },
      memory: { type: "string", default: "20Gi", title: "Memory" },
      httomo_outdir_name: { type: "string", default: "sweep-run", title: "HTTomo Output Directory" },
    },
    required: ["start", "stop", "step", "input", "output", "nprocs", "memory"],
  };

  const customUISchema: UISchemaElement = {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          { type: "Control", scope: "#/properties/start" },
          { type: "Control", scope: "#/properties/stop" },
          { type: "Control", scope: "#/properties/step" }
        ]
      },
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
          { type: "Control", scope: "#/properties/memory" },
          { type: "Control", scope: "#/properties/httomo_outdir_name" }
        ]
      }
    ]
  };

  const [parameters, setParameters] = useState(props.prepopulatedParameters ?? {});
  const [errors, setErrors] = useState<ErrorObject[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const generateConfigJSON = (formParams: any) => {
    // Create a local copy of the loader parameters and handle auto-filling similar to YAML generator
    let updatedLoaderParams = { ...loaderParams };

    // Auto-fill missing required fields if context is invalid (similar to YAML generator logic)
    if (!isContextValid()) {
      if (!updatedLoaderParams.data_path || updatedLoaderParams.data_path.trim() === "") {
        updatedLoaderParams.data_path = "auto";
      }
      
      if (
        typeof updatedLoaderParams.rotation_angles === "string" ||
        !updatedLoaderParams.rotation_angles ||
        !updatedLoaderParams.rotation_angles.data_path ||
        updatedLoaderParams.rotation_angles.data_path.trim() === ""
      ) {
        updatedLoaderParams.rotation_angles = "auto";
      }
      
      // Check if we have darks and flats
      const hasDarks = updatedLoaderParams.darks && updatedLoaderParams.darks.file && updatedLoaderParams.darks.file.trim() !== "";
      const hasFlats = updatedLoaderParams.flats && updatedLoaderParams.flats.file && updatedLoaderParams.flats.file.trim() !== "";
      
      // If we have both darks and flats, remove image_key_path
      if (hasDarks && hasFlats) {
        delete updatedLoaderParams.image_key_path;
      }
      // Otherwise, set it to "auto" if it's empty
      else if (!updatedLoaderParams.image_key_path || updatedLoaderParams.image_key_path.trim() === "") {
        updatedLoaderParams.image_key_path = "auto";
      }
    }

    const config = [
      {
        method: method,
        module_path: module_path,
        parameters: updatedLoaderParams
      },
      {
        method: "normalize",
        module_path: "tomopy.prep.normalize",
        parameters: {
          cutoff: null,
          averaging: "mean"
        }
      },
      {
        method: "minus_log",
        module_path: "tomopy.prep.normalize",
        parameters: {}
      },
      {
        method: "FBP3d_tomobar",
        module_path: "httomolibgpu.recon.algorithm",
        parameters: {
          center: {
            start: formParams.start,
            stop: formParams.stop,
            step: formParams.step
          },
          filter_freq_cutoff: 0.35,
          recon_size: null,
          recon_mask_radius: 0.95,
          neglog: false
        }
      }
    ];
    
    return JSON.stringify(config);
  };

  const onClick = (visit: Visit, submitParams?: object) => {
    // Check if loader context is valid (allow auto-filling like YAML generator)
    if (!isContextValid()) {
      console.warn("Loader configuration is incomplete, but proceeding with auto-filled values");
    }

    if (errors.length === 0) {
      const configJSON = generateConfigJSON(parameters);
      
      // Debug logging
      console.log("Generated config JSON:", configJSON);
      console.log("Loader parameters:", loaderParams);
      console.log("Form parameters:", parameters);

      // Create final parameters object for mutation
      const finalParams = {
        config: configJSON,
        input: parameters.input,
        output: parameters.output,
        nprocs: parameters.nprocs,
        memory: parameters.memory,
        "httomo-outdir-name": parameters.httomo_outdir_name // Note the hyphen in the key name to match Argo template
      };

      props.onSubmit(visit, finalParams);
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
      
      
      
      {/* Loader Component */}
      <Loader />
      
      {!isContextValid() && (
        <Alert severity="info">
          Some Loader fields are empty. They will be auto-filled with default values during submission.
        </Alert>
      )}
      
      <Divider />
      
      {/* JSON Form */}
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

export default SubmissionFormCOR;