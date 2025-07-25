import React, { useEffect, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';
import { Visit, visitRegex, regexToVisit } from '@diamondlightsource/sci-react-ui';
import { WorkflowStatusQuery as WorkflowStatusQueryType } from './__generated__/WorkflowStatusQuery.graphql';

const workflowStatusQuery = graphql`
  query WorkflowStatusQuery($visit: VisitInput!, $name: String!) {
    workflow(visit: $visit, name: $name) {
      name
      status {
        __typename
        ... on WorkflowPendingStatus {
          message
        }
        ... on WorkflowRunningStatus {
          startTime
          message
        }
        ... on WorkflowSucceededStatus {
          startTime
          endTime
          message
        }
        ... on WorkflowFailedStatus {
          startTime
          endTime
          message
        }
        ... on WorkflowErroredStatus {
          startTime
          endTime
          message
        }
      }
    }
  }
`;

interface WorkflowStatusProps {
  workflow: string;
  visit: string;
}

const WorkflowStatus: React.FC<WorkflowStatusProps> = ({ workflow, visit }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPolling, setIsPolling] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parsedVisit, setParsedVisit] = useState<Visit | null>(null);

  // Parse visit string using existing utility functions
  const parseVisit = (visitStr: string): Visit => {
    const match = visitRegex.exec(visitStr);
    
    if (!match) {
      throw new Error(`Invalid visit format: ${visitStr}. Expected format: xx12345-1`);
    }

    return regexToVisit(match);
  };

  // Parse visit on mount and when visit changes
  useEffect(() => {
    try {
      const parsed = parseVisit(visit);
      setParsedVisit(parsed);
      setError(null);
    } catch (err) {
      setError(err.message);
      setParsedVisit(null);
    }
  }, [visit]);

  // Check if status is final (no need to keep polling)
  const isFinalStatus = (status: string) => {
    return ['WorkflowSucceededStatus', 'WorkflowFailedStatus', 'WorkflowErroredStatus'].includes(status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WorkflowPendingStatus':
        return 'warning';
      case 'WorkflowRunningStatus':
        return 'info';
      case 'WorkflowSucceededStatus':
        return 'success';
      case 'WorkflowFailedStatus':
      case 'WorkflowErroredStatus':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'WorkflowPendingStatus':
        return 'Pending';
      case 'WorkflowRunningStatus':
        return 'Running';
      case 'WorkflowSucceededStatus':
        return 'Succeeded';
      case 'WorkflowFailedStatus':
        return 'Failed';
      case 'WorkflowErroredStatus':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  // Handle error case
  if (error) {
    return (
      <Box
        sx={{
          border: 1,
          borderColor: 'error.main',
          borderRadius: 1,
          p: 2,
          mt: 2,
          backgroundColor: 'error.light',
        }}
      >
        <Typography variant="body2" color="error">
          Error parsing visit format: {error}
        </Typography>
      </Box>
    );
  }

  // Handle loading case
  if (!parsedVisit) {
    return (
      <Box
        sx={{
          border: 1,
          borderColor: 'grey.300',
          borderRadius: 1,
          p: 2,
          mt: 2,
          backgroundColor: 'grey.50',
        }}
      >
        <Typography variant="body2">
          Loading workflow status...
        </Typography>
      </Box>
    );
  }

  // Main component logic
  const data = useLazyLoadQuery<WorkflowStatusQueryType>(
    workflowStatusQuery, 
    {
      visit: parsedVisit,
      name: workflow,
    },
    {
      fetchKey: refreshKey, // Force re-fetch when this changes
    }
  );

  const statusType = data.workflow.status?.__typename ?? 'Unknown';
  const message = data.workflow.status && 'message' in data.workflow.status 
    ? data.workflow.status.message 
    : undefined;

  // Set up polling effect - NOW AT TOP LEVEL
  useEffect(() => {
    if (!isPolling || isFinalStatus(statusType)) {
      setIsPolling(false);
      return;
    }

    const interval = setInterval(() => {
      console.log(`Polling workflow status for: ${workflow}`);
      setRefreshKey(prev => prev + 1); // Trigger re-fetch
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [workflow, statusType, isPolling]);

  // Stop polling when status becomes final - NOW AT TOP LEVEL
  useEffect(() => {
    if (isFinalStatus(statusType)) {
      console.log(`Workflow ${workflow} reached final status: ${statusType}`);
      setIsPolling(false);
    }
  }, [statusType, workflow]);

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'grey.300',
        borderRadius: 1,
        p: 2,
        mt: 2,
        backgroundColor: 'grey.50',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6">
          Workflow Status
        </Typography>
        {isPolling && (
          <CircularProgress size={16} />
        )}
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Workflow:
        </Typography>
        <Typography variant="body2" fontWeight="bold">
          {workflow}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Status:
        </Typography>
        <Chip
          label={getStatusText(statusType)}
          color={getStatusColor(statusType)}
          size="small"
        />
      </Box>

      {message && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Message:
          </Typography>
          <Typography variant="body2">
            {message}
          </Typography>
        </Box>
      )}

      {isPolling && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Refreshing every 5 seconds...
        </Typography>
      )}
    </Box>
  );
};

export default WorkflowStatus;