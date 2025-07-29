import React, { useEffect, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { Box, Typography, Chip, CircularProgress, Button, ButtonGroup } from '@mui/material';
import { OpenInNew, Article } from '@mui/icons-material';
import { Visit, visitRegex, regexToVisit } from '@diamondlightsource/sci-react-ui';
import { WorkflowStatusQuery as WorkflowStatusQueryType } from './__generated__/WorkflowStatusQuery.graphql';

const workflowStatusQuery = graphql`
  query WorkflowStatusQuery($visit: VisitInput!, $name: String!) {
    workflow(visit: $visit, name: $name) {
      name
      visit {
        proposalCode
        proposalNumber
        number
      }
      status {
        __typename
        ... on WorkflowPendingStatus {
          message
        }
        ... on WorkflowRunningStatus {
          startTime
          message
          tasks {
            id
            name
            status
            depends
            dependencies
            stepType
            artifacts {
              name
              url
              mimeType
            }
          }
        }
        ... on WorkflowSucceededStatus {
          startTime
          endTime
          message
          tasks {
            id
            name
            status
            depends
            dependencies
            stepType
            artifacts {
              name
              url
              mimeType
            }
          }
        }
        ... on WorkflowFailedStatus {
          startTime
          endTime
          message
          tasks {
            id
            name
            status
            depends
            dependencies
            stepType
            artifacts {
              name
              url
              mimeType
            }
          }
        }
        ... on WorkflowErroredStatus {
          startTime
          endTime
          message
          tasks {
            id
            name
            status
            depends
            dependencies
            stepType
            artifacts {
              name
              url
              mimeType
            }
          }
        }
      }
    }
  }
`;

interface WorkflowStatusProps {
  workflow: string;
  visit: string;
  onWorkflowDataChange?: (data: any) => void; // Add this prop
}

const WorkflowStatus: React.FC<WorkflowStatusProps> = ({ workflow, visit, onWorkflowDataChange }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPolling, setIsPolling] = useState(true);

  // Parse visit string using existing utility functions
  const parseVisit = (visitStr: string): Visit => {
    const match = visitRegex.exec(visitStr);
    if (!match) {
      throw new Error(`Invalid visit format: ${visitStr}. Expected format: xx12345-1`);
    }
    return regexToVisit(match);
  };

  const parsedVisit = parseVisit(visit);

  // GraphQL query - always called at top level
  const data = useLazyLoadQuery<WorkflowStatusQueryType>(
    workflowStatusQuery, 
    {
      visit: parsedVisit,
      name: workflow,
    },
    {
      fetchKey: refreshKey,
      fetchPolicy: 'network-only', // Force fresh fetch from server
    }
  );

  // Add this debugging immediately after the query
  console.log('=== DETAILED DEBUG ===');
  console.log('Raw data object:', data);
  console.log('data.workflow:', data?.workflow);
  console.log('data.workflow.status:', data?.workflow?.status);
  console.log('data.workflow.status.__typename:', data?.workflow?.status?.__typename);
  console.log('Type of __typename:', typeof data?.workflow?.status?.__typename);
  console.log('=== END DEBUG ===');

  const statusType = data?.workflow?.status?.__typename ?? 'Unknown';
  console.log('Final statusType:', statusType);

  const message = data?.workflow?.status && 'message' in data.workflow.status 
    ? data.workflow.status.message 
    : undefined;

  // Add debugging
  console.log('WorkflowStatus Debug:', {
    workflow,
    visit,
    parsedVisit,
    dataExists: !!data,
    workflowExists: !!data?.workflow,
    statusExists: !!data?.workflow?.status,
    statusType,
    fullData: data
  });

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

  // New function to extract log artifacts
  const getLogArtifacts = () => {
    // Only show artifacts for final status workflows with tasks
    if (!data?.workflow?.status || !('tasks' in data.workflow.status)) {
      return [];
    }

    const finalStatuses = ['WorkflowSucceededStatus', 'WorkflowFailedStatus', 'WorkflowErroredStatus'];
    if (!finalStatuses.includes(statusType)) {
      return [];
    }

    const tasks = (data.workflow.status as any).tasks || [];
    
    return tasks
      .filter((task: any) => task.stepType === 'Pod') // Only Pod tasks
      .map((task: any) => {
        // Find main.log artifact
        const logArtifact = task.artifacts?.find((artifact: any) => 
          artifact.name === 'main.log' && artifact.mimeType === 'text/plain'
        );
        
        return logArtifact ? {
          taskName: task.name,
          url: logArtifact.url,
          name: logArtifact.name
        } : null;
      })
      .filter(Boolean); // Remove null entries
  };

  const logArtifacts = getLogArtifacts();

  // Polling effect
  useEffect(() => {
    if (!isPolling || isFinalStatus(statusType)) {
      setIsPolling(false);
      return;
    }

    const interval = setInterval(() => {
      console.log(`Polling workflow status for: ${workflow}`);
      setRefreshKey(prev => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, [statusType, isPolling]);

  // Stop polling when status becomes final
  useEffect(() => {
    if (isFinalStatus(statusType)) {
      console.log(`Workflow ${workflow} reached final status: ${statusType}`);
      setIsPolling(false);
    }
  }, [statusType]);

  // Add this useEffect to pass data back to parent
  useEffect(() => {
    console.log('WorkflowStatus: Data changed, calling onWorkflowDataChange:', data);
    if (onWorkflowDataChange && data) {
      onWorkflowDataChange(data);
    }
  }, [data, onWorkflowDataChange]);

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

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Status:
          </Typography>
          <Chip
            label={getStatusText(statusType)}
            color={getStatusColor(statusType)}
            size="small"
          />
        </Box>

        {/* Log Artifacts Section */}
        {logArtifacts.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Logs:
            </Typography>
            <ButtonGroup size="small" variant="outlined" orientation="vertical">
              {logArtifacts.map((artifact, index) => (
                <Button
                  key={index}
                  startIcon={<Article />}
                  endIcon={<OpenInNew />}
                  onClick={() => window.open(artifact.url, '_blank')}
                  sx={{ 
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    minWidth: 'auto',
                    px: 1
                  }}
                >
                  {artifact.taskName} log
                </Button>
              ))}
            </ButtonGroup>
          </Box>
        )}
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
          Refreshing every 2 seconds...
        </Typography>
      )}
    </Box>
  );
}; 

export default WorkflowStatus;