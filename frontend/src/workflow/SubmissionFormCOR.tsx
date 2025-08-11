import React, { useState } from 'react';
import { useFragment } from 'react-relay';
import { Box, Divider, Snackbar, Stack, Typography, Alert } from '@mui/material';
import { VisitInput, visitToText,Visit } from '@diamondlightsource/sci-react-ui';
import { SubmissionFormSharedFragment$key } from './__generated__/SubmissionFormSharedFragment.graphql';
import SweepRUNForm from '../pages/SweepRUNForm';
import Loader from '../components/Loader';
import { useLoader } from '../contexts/LoaderContext';
import WorkflowStatus from './WorkflowStatus';
import SweepResultViewer from './SweepResultViewer';
import { graphql } from 'relay-runtime';

interface Parameters {
  input: string;
  output: string;
  nprocs: string;
  memory: string;
  httomo_outdir_name: string;
  start?: number;
  stop?: number;
  step?: number;
}

const SubmissionFormCOR = (props: {
  template: SubmissionFormSharedFragment$key;
  prepopulatedParameters?: object;
  visit?: Visit;
  onSubmit: (
    visit: Visit,
    parameters: object,
    onSuccess?: (workflowName: string) => void
  ) => void;
}) => {
  const data = useFragment(
    graphql`
      fragment SubmissionFormSharedFragment on WorkflowTemplate {
        name
        title
        description
        arguments
        uiSchema
      }
    `,
    props.template
  );

  const { method, module_path, parameters: loaderParams, isContextValid } = useLoader();
  const [parameters, setParameters] = useState<Parameters>(
    props.prepopulatedParameters as Parameters ?? {}
  );
  const [errors, setErrors] = useState<any[]>([]);
  const [submittedWorkflowName, setSubmittedWorkflowName] = useState<string | null>(null);
  const [submittedVisit, setSubmittedVisit] = useState<Visit | null>(null);
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);

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
      if (
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
        parameters: {
          cutoff: null,
          averaging: 'mean',
        },
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

  const handleFormSubmit = (formData: object) => {
    setParameters(formData as Parameters);
  };

  const handleVisitSubmit = (visit: Visit) => {
    if (errors.length === 0) {
      const configJSON = generateConfigJSON(parameters);

      const finalParams = {
        config: configJSON,
        input: parameters.input,
        output: parameters.output,
        nprocs: parameters.nprocs,
        memory: parameters.memory,
        'httomo-outdir-name': parameters.httomo_outdir_name,
      };

      props.onSubmit(visit, finalParams, (workflowName: string) => {
        setSubmittedWorkflowName(workflowName);
        setSubmittedVisit(visit);
      });

      setSubmitted(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSubmitted(false);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4" align="center">
        Workflow: {data.title || data.name}
      </Typography>
      <Typography variant="body1" align="center">
        {data.description || 'No description available'}
      </Typography>
      <Divider />
      <Loader />
      <SweepRUNForm
        schema={data.arguments}
        uiSchema={data.uiSchema}
        onSubmit={handleFormSubmit}
      />
      <VisitInput
        visit={props.visit}
        onSubmit={handleVisitSubmit}
        parameters={parameters}
        submitOnReturn={false}
      />
      {submittedWorkflowName && submittedVisit && (
        <>
          <WorkflowStatus
            workflow={submittedWorkflowName}
            visit={visitToText(submittedVisit)}
            onWorkflowDataChange={setWorkflowData}
          />
          <SweepResultViewer
            workflowData={workflowData}
            start={parameters.start as number}
            stop={parameters.stop as number}
            step={parameters.step as number}
          />
        </>
      )}
      {!isContextValid() && (
        <Alert severity="info">
          Some Loader fields are empty. They will be auto-filled with default values during submission.
        </Alert>
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

export default SubmissionFormCOR;
