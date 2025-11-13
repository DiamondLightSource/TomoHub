import { useState } from "react";
import { useLazyLoadQuery, useMutation } from "react-relay/hooks";
import { graphql } from "relay-runtime";
import { Box } from "@mui/material";
import { Visit, visitToText } from "@diamondlightsource/sci-react-ui";
import SubmissionFormGPURun from "./SubmissionFormGPURun";
import SubmissionFormCOR from "./sweepPipeline/SubmissionFormCOR";
import { SubmissionQuery as SubmissionQueryType } from "./__generated__/SubmissionQuery.graphql";
import { SubmissionMutation as SubmissionMutationType } from "./__generated__/SubmissionMutation.graphql";
import React from "react";
import { JSONObject } from "../../types";
import SubmissionFormRawProjections from "./rawProjections/SubmissionFormRawProjections";

const submissionQuery = graphql`
  query SubmissionQuery($name: String!) {
    workflowTemplate(name: $name) {
      ...SubmissionFormSharedFragment
    }
  }
`;

// Add this shared fragment
const sharedFragment = graphql`
  fragment SubmissionFormSharedFragment on WorkflowTemplate {
    name
    maintainer
    title
    description
    arguments
    uiSchema
  }
`;

const submissionMutation = graphql`
  mutation SubmissionMutation(
    $name: String!
    $visit: VisitInput!
    $parameters: JSON!
  ) {
    submitWorkflowTemplate(
      name: $name
      visit: $visit
      parameters: $parameters
    ) {
      name
    }
  }
`;

interface SubmissionProps {
  /** The name of the workflow template, i.e. numpy-benchmark */
  workflowName: string;
  /** The set function for a user visit */
  setVisit: (
    value:
      | Visit
      | undefined
      | ((prevState: Visit | undefined) => Visit | undefined)
  ) => void;
  /** Optional prepopulated parameters */
  prepopulatedParameters?: JSONObject;
  /** Optional visit information */
  visit?: Visit;
}

export default function Submission({
  workflowName,
  setVisit,
  visit,
}: SubmissionProps) {
  const data = useLazyLoadQuery<SubmissionQueryType>(submissionQuery, {
    name: workflowName,
  });

  const [submissionResults, setSubmissionResults] = useState([]);

  const [commitMutation] =
    useMutation<SubmissionMutationType>(submissionMutation);

  function submitWorkflow(
    visit: Visit,
    parameters: object,
    onSuccess?: (workflowName: string) => void
  ) {
    commitMutation({
      variables: {
        name: workflowName,
        visit: visit,
        parameters: parameters,
      },
      onCompleted: (response, errors) => {
        if (errors?.length) {
          console.error("GraphQL errors:", errors);
          setSubmissionResults((prev) => [
            {
              type: "graphQLError",
              errors: errors,
            },
            ...prev,
          ]);
        } else {
          const submittedName = response.submitWorkflowTemplate.name;
          setVisit(visit);
          setSubmissionResults((prev) => [
            {
              type: "success",
              message: `${visitToText(visit)}/${submittedName}`,
            },
            ...prev,
          ]);

          // Call the success callback with workflow name
          if (onSuccess) {
            onSuccess(submittedName);
          } else {
            console.log("No onSuccess callback provided");
          }
        }
      },
      onError: (err) => {
        console.error("Submission failed:", err);
        setSubmissionResults((prev) => [
          {
            type: "networkError",
            error: err,
          },
          ...prev,
        ]);
      },
    });
  }

  // Conditionally render the appropriate form component
  const renderSubmissionForm = () => {
    const commonProps = {
      template: data.workflowTemplate,
      visit,
      onSubmit: submitWorkflow,
    };

    switch (workflowName) {
      case "httomo-cor-sweep":
        return <SubmissionFormCOR {...commonProps} />;
      case "httomo-gpu-job":
        return <SubmissionFormGPURun {...commonProps} />;
      case "extract-raw-projections":
        return <SubmissionFormRawProjections {...commonProps} />;
      default:
        return <p>invalid workflow name</p>;
    }
  };

  return (
    <>
      {workflowName ? (
        <Box>
          {renderSubmissionForm()}
          <SubmittedMessagesList messages={submissionResults} />
        </Box>
      ) : (
        <>No Workflow Name provided</>
      )}
    </>
  );
}

const SubmittedMessagesList = ({ messages }: { messages: any[] }) => {
  return (
    <>
      {messages.map((message, messageIdx) => {
        switch (message.type) {
          case "success":
            return (
              <p
                key={messageIdx}
              >{`Successfully submitted ${message.message}`}</p>
            );
          case "networkError":
            return (
              <p
                key={messageIdx}
              >{`Submission error type ${message.error.name}`}</p>
            );
          case "graphQLError":
          default:
            return (
              <div key={messageIdx}>
                <p>{"Submission error type GraphQL"}</p>
                {message.errors.map((e, idx) => {
                  return <p key={idx}>{`Error ${idx} ${e.message}`}</p>;
                })}
              </div>
            );
        }
      })}
    </>
  );
};

export { sharedFragment };
