import React from "react";
import { graphql, useSubscription } from "react-relay";
import { Visit } from "@diamondlightsource/sci-react-ui";
import { GraphQLSubscriptionConfig } from "relay-runtime";
import {
  WorkflowSubscriptionHandlerSubscription$data,
  WorkflowSubscriptionHandlerSubscription as WorkflowSubscriptionHandlerSubscriptionType,
} from "./__generated__/WorkflowSubscriptionHandlerSubscription.graphql";
import { Box } from "@mui/material";

// this subscription is a bit overkill with all the fields it requests
// however, it is necessary to preserve the original functionality of the WorkflowStatus component
const subscription = graphql`
  subscription WorkflowSubscriptionHandlerSubscription(
    $visit: VisitInput!
    $name: String!
  ) {
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

interface WorkflowSubscriptionHandlerProps {
  parsedVisit: Visit;
  workflow: string;
  setData: React.Dispatch<
    React.SetStateAction<
      WorkflowSubscriptionHandlerSubscription$data | null | undefined
    >
  >;
}
const WorkflowSubscriptionHandler: React.FC<WorkflowSubscriptionHandlerProps> =
  // memo so it doesnt re-render unless any of the props change
  // this is why its important to memoise any props going in if they are objects (parsedVisit)
  React.memo(
    ({ parsedVisit, workflow, setData }: WorkflowSubscriptionHandlerProps) => {
      console.log("refreshing child component");
      const subscriptionConfig: GraphQLSubscriptionConfig<WorkflowSubscriptionHandlerSubscriptionType> =
        {
          variables: { visit: parsedVisit, name: workflow },
          subscription: subscription,
          onNext: setData,
        };
      useSubscription(subscriptionConfig);
      // supposed to be empty
      // this feels silly? But it wont let me call the hook useSubscription outside of a component
      return <Box />;
    }
  );

export default WorkflowSubscriptionHandler;
