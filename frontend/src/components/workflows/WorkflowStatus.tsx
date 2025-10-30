import React, { useMemo, useState } from "react";
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
import { WorkflowSubscriptionHandlerSubscription$data } from "./__generated__/WorkflowSubscriptionHandlerSubscription.graphql";
import WorkflowSubscriptionHandler from "./WorkflowSubscriptionHandler";

type StatusType =
  | "WorkflowSucceededStatus"
  | "WorkflowFailedStatus"
  | "WorkflowErroredStatus"
  | "WorkflowPendingStatus"
  | "WorkflowRunningStatus"
  | "%other"
  | "Unknown";

function parseVisit(visitStr: string): Visit {
  const match = visitRegex.exec(visitStr);
  if (!match) {
    throw new Error(
      `Invalid visit format: ${visitStr}. Expected format: xx12345-1`
    );
  }
  return regexToVisit(match);
}

function isFinalStatus(status: string) {
  return [
    "WorkflowSucceededStatus",
    "WorkflowFailedStatus",
    "WorkflowErroredStatus",
  ].includes(status);
}

function getStatusColor(status: string) {
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
}

function getStatusText(status: string) {
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
}

function getLogArtifacts(
  data: WorkflowSubscriptionHandlerSubscription$data | null | undefined,
  statusType: StatusType
) {
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
}

interface WorkflowStatusProps {
  workflow: string;
  visit: string;
  onWorkflowDataChange?: (
    data: WorkflowSubscriptionHandlerSubscription$data
  ) => void;
}

const WorkflowStatus: React.FC<WorkflowStatusProps> = ({
  workflow,
  visit,
  onWorkflowDataChange,
}) => {
  const [workflowFinished, setWorkflowFinished] = useState(false);
  const [data, setData] = useState<
    undefined | null | WorkflowSubscriptionHandlerSubscription$data
  >(undefined);

  // the subscriptionHandler component will change data when it recieves some
  // this will trigger a re-render
  if (
    onWorkflowDataChange !== undefined &&
    data !== null &&
    data !== undefined
  ) {
    console.log("data changed!!");
    onWorkflowDataChange(data);
  }

  const parsedVisit = useMemo(() => {
    return parseVisit(visit);
  }, [visit]);
  // const parsedVisit = parseVisit(visit);

  const statusType: StatusType =
    data?.workflow?.status?.__typename ?? "Unknown";

  const message =
    data?.workflow?.status && "message" in data.workflow.status
      ? data.workflow.status.message
      : undefined;

  const logArtifacts = getLogArtifacts(data, statusType);

  if (isFinalStatus(statusType) && !workflowFinished) {
    setWorkflowFinished(true);
    // TODO: clean up the subscription here???
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
        {!workflowFinished && <CircularProgress size={16} />}
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

      {!workflowFinished && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          Refreshing every 2 seconds...
        </Typography>
      )}
      <WorkflowSubscriptionHandler
        parsedVisit={parsedVisit}
        workflow={workflow}
        setData={setData}
      />
    </Box>
  );
};

export default WorkflowStatus;
