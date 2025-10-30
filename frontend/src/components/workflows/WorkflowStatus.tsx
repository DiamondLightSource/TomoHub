import React, { useMemo, useState } from "react";
import { graphql, useSubscription } from "react-relay";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Button,
  ButtonGroup,
} from "@mui/material";
import { OpenInNew, Article } from "@mui/icons-material";
import {
  Visit,
  visitRegex,
  regexToVisit,
} from "@diamondlightsource/sci-react-ui";
import {
  WorkflowStatusSubscription$data,
  WorkflowStatusSubscription as WorkflowStatusSubscriptionType,
} from "./__generated__/WorkflowStatusSubscription.graphql";
import { GraphQLSubscriptionConfig } from "relay-runtime";

// test subscription on existing workflow
const subscription = graphql`
  subscription WorkflowStatusSubscription($visit: VisitInput!, $name: String!) {
    workflow(visit: $visit, name: $name) {
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
  onWorkflowDataChange?: (data: any) => void;
}

const WorkflowStatus: React.FC<WorkflowStatusProps> = ({
  workflow,
  visit,
  onWorkflowDataChange,
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPolling, setIsPolling] = useState(true);

  // Parse visit string using existing utility functions
  const parseVisit = (visitStr: string): Visit => {
    const match = visitRegex.exec(visitStr);
    if (!match) {
      throw new Error(
        `Invalid visit format: ${visitStr}. Expected format: xx12345-1`
      );
    }
    return regexToVisit(match);
  };

  const parsedVisit = useMemo(() => {
    return parseVisit(visit);
  }, [visit]);
  // const parsedVisit = parseVisit(visit);

  const statusType = data?.workflow?.status?.__typename ?? "Unknown";

  const message =
    data?.workflow?.status && "message" in data.workflow.status
      ? data.workflow.status.message
      : undefined;

  // Check if status is final (no need to keep polling)
  const isFinalStatus = (status: string) => {
    return [
      "WorkflowSucceededStatus",
      "WorkflowFailedStatus",
      "WorkflowErroredStatus",
    ].includes(status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WorkflowPendingStatus":
        return "warning";
      case "WorkflowRunningStatus":
        return "info";
      case "WorkflowSucceededStatus":
        return "success";
      case "WorkflowFailedStatus":
      case "WorkflowErroredStatus":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "WorkflowPendingStatus":
        return "Pending";
      case "WorkflowRunningStatus":
        return "Running";
      case "WorkflowSucceededStatus":
        return "Succeeded";
      case "WorkflowFailedStatus":
        return "Failed";
      case "WorkflowErroredStatus":
        return "Error";
      default:
        return "Unknown";
    }
  };

  const getLogArtifacts = () => {
    if (!data?.workflow?.status || !("tasks" in data.workflow.status)) {
      return [];
    }

    const finalStatuses = [
      "WorkflowSucceededStatus",
      "WorkflowFailedStatus",
      "WorkflowErroredStatus",
    ];
    if (!finalStatuses.includes(statusType)) {
      return [];
    }

    const tasks = (data.workflow.status as any).tasks || [];

    return tasks
      .filter((task: any) => task.stepType === "Pod")
      .map((task: any) => {
        // Find main.log artifact
        const logArtifact = task.artifacts?.find(
          (artifact: any) =>
            artifact.name === "main.log" && artifact.mimeType === "text/plain"
        );

        return logArtifact
          ? {
              taskName: task.name,
              url: logArtifact.url,
              name: logArtifact.name,
            }
          : null;
      })
      .filter(Boolean); // Remove null entries
  };

  const logArtifacts = getLogArtifacts();

  if (isFinalStatus(statusType)) {
    setIsPolling(false);
    // clean up the subscription here???
    // SOME ISSUE HAPPENS??
    // looks like we hit too many re-renders when workflow finishes
  }

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "grey.300",
        borderRadius: 1,
        p: 2,
        mt: 2,
        backgroundColor: "grey.50",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Typography variant="h6">Workflow Status</Typography>
        {isPolling && <CircularProgress size={16} />}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Workflow:
        </Typography>
        <Typography variant="body2" fontWeight="bold">
          {workflow}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Status:
          </Typography>
          <Chip
            label={getStatusText(statusType)}
            color={getStatusColor(statusType)}
            size="small"
          />
        </Box>

        {logArtifacts.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Logs:
            </Typography>
            <ButtonGroup size="small" variant="outlined" orientation="vertical">
              {logArtifacts.map((artifact, index) => (
                <Button
                  key={index}
                  startIcon={<Article />}
                  endIcon={<OpenInNew />}
                  onClick={() => window.open(artifact.url, "_blank")}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.75rem",
                    minWidth: "auto",
                    px: 1,
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Message:
          </Typography>
          <Typography variant="body2">{message}</Typography>
        </Box>
      )}

      {isPolling && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          Refreshing every 2 seconds...
        </Typography>
      )}
    </Box>
  );
};

export default WorkflowStatus;
