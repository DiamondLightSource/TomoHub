import { useFragment } from 'react-relay';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Alert,
  Button,
  Divider,
  Snackbar,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { JSONObject, Visit } from 'workflows-lib';
import { VisitInput, visitToText } from '@diamondlightsource/sci-react-ui';
import Loader from '../components/Loader';
import { useLoader } from '../contexts/LoaderContext';
import { SubmissionFormSharedFragment$key } from './__generated__/SubmissionFormSharedFragment.graphql';
import { sharedFragment } from './Submission';
import WorkflowStatus from './WorkflowStatus';
import SweepResultViewer from './SweepResultViewer';
import ParameterSweepForm, {
  SweepValues,
} from './ParameterSweepForm';
import WorkflowParametersForm, {
  WorkflowParamsValues,
} from './WorkflowParametersForm';
import { buildAjv, validateWithDefaults, formatAjvErrors } from './utils/schemaValidation';
import { ErrorObject } from 'ajv';

const SubmissionFormCOR = (props: {
  template: SubmissionFormSharedFragment$key;
  prepopulatedParameters?: JSONObject;
  visit?: Visit;
  onSubmit: (
    visit: Visit,
    parameters: object,
    onSuccess?: (workflowName: string) => void
  ) => void;
}) => {
  const data = useFragment(sharedFragment, props.template);
  const theme = useTheme();

  // ---- Loader context (unchanged) ----
  const {
    method,
    module_path,
    parameters: loaderParams,
    isContextValid,
  } = useLoader();

  // ---- AJV and schema from GraphQL ----
  const schema = data.arguments as unknown as object; // the real JSON schema
  const ajv = useMemo(() => buildAjv(), [schema]);

  // ---- Local state (parent holds everything) ----
  const [parameters, setParameters] = useState<JSONObject>(() => {
    // seed with any prepopulated values
    return (props.prepopulatedParameters as JSONObject) ?? ({} as JSONObject);
  });

  // Derived child slices
  const sweepValues = useMemo<SweepValues>(() => {
    // keep empty-string while typing; numbers are coerced by AJV at submit
    return {
      start: (parameters as any)?.start ?? '',
      stop: (parameters as any)?.stop ?? '',
      step: (parameters as any)?.step ?? '',
    };
  }, [parameters]);

  const wfValues = useMemo<WorkflowParamsValues>(() => {
    return {
      input: (parameters as any)?.input ?? '',
      output: (parameters as any)?.output ?? '',
      nprocs: (parameters as any)?.nprocs ?? 1,
      memory: (parameters as any)?.memory ?? '20Gi',
      httomo_outdir_name:
        (parameters as any)?.httomo_outdir_name ?? 'sweep-run',
    };
  }, [parameters]);

  const setSweepValues = useCallback(
    (next: SweepValues) =>
      setParameters(prev => ({ ...prev, ...next }) as JSONObject),
    []
  );
  const setWfValues = useCallback(
    (next: WorkflowParamsValues) =>
      setParameters(prev => ({ ...prev, ...next }) as JSONObject),
    []
  );

  // ---- Apply schema defaults once (and on schema change) using AJV ----
  useEffect(() => {
    const { data: withDefaults } = validateWithDefaults(ajv, schema, {
      ...parameters,
    });
    setParameters(withDefaults as JSONObject);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ajv]);

  // ---- Submission UI feedback ----
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<ErrorObject[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // For WorkflowStatus & SweepResultViewer
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [submittedWorkflowName, setSubmittedWorkflowName] = useState<
    string | null
  >(null);
  const [submittedVisit, setSubmittedVisit] = useState<Visit | null>(null);

  // ---- Pipeline JSON (unchanged from your current version) ----
  const generateConfigJSON = (formParams: any) => {
    let updatedLoaderParams = { ...loaderParams };

    if (!isContextValid()) {
      if (!updatedLoaderParams.data_path || updatedLoaderParams.data_path.trim() === '') {
        updatedLoaderParams.data_path = 'auto';
      }
      if (
        typeof updatedLoaderParams.rotation_angles === 'string' ||
        !updatedLoaderParams.rotation_angles ||
        !updatedLoaderParams.rotation_angles.data_path ||
        updatedLoaderParams.rotation_angles.data_path.trim() === ''
      ) {
        updatedLoaderParams.rotation_angles = 'auto';
      }

      const hasDarks =
        updatedLoaderParams.darks &&
        updatedLoaderParams.darks.file &&
        updatedLoaderParams.darks.file.trim() !== '';
      const hasFlats =
        updatedLoaderParams.flats &&
        updatedLoaderParams.flats.file &&
        updatedLoaderParams.flats.file.trim() !== '';

      if (hasDarks && hasFlats) {
        delete updatedLoaderParams.image_key_path;
      } else if (
        !updatedLoaderParams.image_key_path ||
        updatedLoaderParams.image_key_path.trim() === ''
      ) {
        updatedLoaderParams.image_key_path = 'auto';
      }
    }

    const config = [
      {
        method: method,
        module_path: module_path,
        parameters: updatedLoaderParams,
      },
      {
        method: 'normalize',
        module_path: 'tomopy.prep.normalize',
        parameters: { cutoff: null, averaging: 'mean' },
      },
      {
        method: 'minus_log',
        module_path: 'tomopy.prep.normalize',
        parameters: {},
      },
      {
        method: 'FBP3d_tomobar',
        module_path: 'httomolibgpu.recon.algorithm',
        parameters: {
          center: {
            start: formParams.start,
            stop: formParams.stop,
            step: formParams.step,
          },
          filter_freq_cutoff: 0.35,
          recon_size: null,
          recon_mask_radius: 0.95,
          neglog: false,
        },
      },
    ];

    return JSON.stringify(config);
  };

  // ---- Submit handler (validate just before submit) ----
  const doSubmit = (visit: Visit) => {
    // Directly prepare the parameters without schema validation
    const configJSON = generateConfigJSON(parameters);

    const finalParams = {
      config: configJSON,
      input: wfValues.input,
      output: wfValues.output,
      nprocs: wfValues.nprocs,
      memory: wfValues.memory,
      'httomo-outdir-name': wfValues.httomo_outdir_name, // mapping required by backend
    };
    // Submit the workflow
    props.onSubmit(visit, finalParams, (workflowName: string) => {
      console.log('COR SUCCESS CALLBACK RECEIVED:', workflowName);
      setSubmittedWorkflowName(workflowName);
      setSubmittedVisit(visit); 
    });

  };

  const handleCloseSnackbar = () => setSubmitted(false);

  const formWidth =
    (data.uiSchema?.options?.formWidth as string | undefined) ?? '100%';

  return (
    <Stack direction="column" spacing={theme.spacing(2)} sx={{ width: formWidth }}>
      <Typography variant="h4" align="center">
        Workflow: {data.title ? data.title : data.name}
      </Typography>
      <Typography variant="body1" align="center">
        {data.description}
      </Typography>

      <Divider />
      <Loader />

      {console.log('submittedWorkflowName:', submittedWorkflowName)}
      {console.log('submittedVisit:', submittedVisit)}
      {console.log('workflowData:', workflowData)}


      {submittedWorkflowName && submittedVisit && (
        <WorkflowStatus
          workflow={submittedWorkflowName}
          visit={visitToText(submittedVisit)}
          onWorkflowDataChange={data => {
            console.log('SubmissionFormCOR: Received workflow data:', data);
            setWorkflowData(data);
          }}
        />
      )}

      {submittedWorkflowName && submittedVisit && (
        <SweepResultViewer
          workflowData={workflowData}
          start={parameters.start as number}
          stop={parameters.stop as number}
          step={parameters.step as number}
        />
      )}

      

      {!isContextValid() && (
        <Alert severity="info">
          Some Loader fields are empty. They will be auto-filled with default values during submission.
        </Alert>
      )}

      <Divider />

      {/* Custom forms */}
      <Typography variant="h6">Parameter Sweep Configuration</Typography>
      <ParameterSweepForm
        values={sweepValues}
        onChange={setSweepValues}
      />

      <Typography variant="h6" sx={{ mt: 2 }}>
        Workflow Parameterss
      </Typography>
      <WorkflowParametersForm
        values={wfValues}
        onChange={setWfValues}
      />

      {/* Validation errors (shown only if submit fails) */}
      {errorMessages.length > 0 && (
        <Alert severity="error">
          <strong>Validation failed:</strong>
          <ul style={{ marginTop: 8 }}>
            {errorMessages.map((m, i) => (
              <li key={i} style={{ marginLeft: 16 }}>{m}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Divider />

      {/* Visit & Submit */}
      <VisitInput
      visit={props.visit}
      onSubmit={doSubmit}
      parameters={parameters}
      submitOnReturn={false}
      submitButton={true}
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
