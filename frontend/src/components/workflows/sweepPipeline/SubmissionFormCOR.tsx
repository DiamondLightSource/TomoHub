import { useFragment } from 'react-relay';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Alert,
  Divider,
  Snackbar,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { JSONObject, Visit } from 'workflows-lib';
import { VisitInput, visitToText } from '@diamondlightsource/sci-react-ui';
import Loader from '../../loader/Loader';
import { useLoader } from '../../../contexts/LoaderContext';
import { SubmissionFormSharedFragment$key } from '../__generated__/SubmissionFormSharedFragment.graphql';
import { sharedFragment } from '../Submission';
import WorkflowStatus from '../WorkflowStatus';
import SweepResultViewer from './SweepResultViewer';
import ParameterSweepForm, {
  SweepValues,
} from './ParameterSweepForm';
import WorkflowParametersForm, {
  WorkflowParamsValues,
} from '../WorkflowParametersForm';
import { buildAjv, validateWithDefaults, formatAjvErrors } from '../utils/schemaValidation';
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
  const generateConfigArray = (formParams: any) => {
    let updatedLoaderParams = { ...loaderParams };

    if (!isContextValid()) {
      if (!updatedLoaderParams.data_path || updatedLoaderParams.data_path.trim() === '') {
        updatedLoaderParams.data_path = null;
      }
      if (
        typeof updatedLoaderParams.rotation_angles === 'string' ||
        !updatedLoaderParams.rotation_angles ||
        !updatedLoaderParams.rotation_angles.data_path ||
        updatedLoaderParams.rotation_angles.data_path.trim() === '' ||
        updatedLoaderParams.rotation_angles.data_path === 'auto'
      ) {
        updatedLoaderParams.rotation_angles = { data_path: null };
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
        updatedLoaderParams.image_key_path.trim() === '' ||
        updatedLoaderParams.image_key_path === 'auto'
      ) {
        updatedLoaderParams.image_key_path = null;
      }
    }

    return [
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
        method: 'recon',
        module_path: 'tomopy.recon.algorithm',
        parameters: {
          center: {
            start: formParams.start,
            stop: formParams.stop,
            step: formParams.step,
          },
          sinogram_order: false,
          algorithm: 'gridrec',
          init_recon: null,
        },
      },
    ];
  };

  // ---- Submit handler (validate just before submit) ----
  const doSubmit = (visit: Visit) => {
    // Merge form slices
    const mergedParams = {
      ...parameters,
      start: sweepValues.start,
      stop: sweepValues.stop,
      step: sweepValues.step,
    };

    // Generate config as array (for validation)
    const configArray = generateConfigArray(mergedParams);

    // Build validation object with correct backend key names
    const validationObject = {
      config: configArray,
      input: wfValues.input === "" ? null : wfValues.input,
      output: wfValues.output === "" ? null : wfValues.output,
      nprocs: wfValues.nprocs,
      memory: wfValues.memory,
      "httomo-outdir-name": wfValues.httomo_outdir_name === "" ? null : wfValues.httomo_outdir_name,
    };

    // Validate against schema
    const validate = ajv.compile(schema);
    if (!validate(validationObject)) {
      setErrorMessages(formatAjvErrors(validate.errors, validationObject));
      return; // Stop submission
    }

    // Build final submission payload (config as string)
    const finalParams = {
      ...validationObject,
      config: JSON.stringify(configArray)
    };

    // Submit
    props.onSubmit(visit, finalParams, (workflowName: string) => {
      setSubmittedWorkflowName(workflowName);
      setSubmittedVisit(visit);
      setErrorMessages([]);
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

      {submittedWorkflowName && submittedVisit && (
        <WorkflowStatus
          workflow={submittedWorkflowName}
          visit={visitToText(submittedVisit)}
          onWorkflowDataChange={data => {
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




      <Divider />


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
