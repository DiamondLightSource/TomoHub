import { useState } from "react";
import { useLazyLoadQuery, useMutation } from "react-relay/hooks";
import { graphql } from "relay-runtime";
import { Box } from "@mui/material";
import {
  JSONObject,
  SubmissionGraphQLErrorMessage,
  SubmissionNetworkErrorMessage,
  SubmissionSuccessMessage,
  SubmittedMessagesList,
  Visit,
} from "workflows-lib";
import SubmissionForm from "./SubmissionForm";
import { SubmissionQuery as SubmissionQueryType } from "./__generated__/SubmissionQuery.graphql";
import { SubmissionMutation as SubmissionMutationType } from "./__generated__/SubmissionMutation.graphql";
import React from "react";

const submissionQuery = graphql`
  query SubmissionQuery($name: String!) {
    workflowTemplate(name: $name) {
      ...SubmissionFormFragment
    }
  }
`;

const submissionMutation = graphql`
  mutation SubmissionMutation($name: String!, $visit: VisitInput!, $parameters: JSON!) {
    submitWorkflowTemplate(name: $name, visit: $visit, parameters: $parameters) {
      name
    }
  }
`;

interface SubmissionProps {
  /** The name of the workflow template, i.e. numpy-benchmark */
  workflowName: string;
  /** The set function for a user visit */
  setVisit: (value: Visit | undefined | ((prevState: Visit | undefined) => Visit | undefined)) => void;
  /** Optional prepopulated parameters */
  prepopulatedParameters?: JSONObject;
  /** Optional visit information */
  visit?: Visit;
}

export default function Submission({ 
  workflowName, 
  setVisit, 
  prepopulatedParameters,
  visit 
}: SubmissionProps) {
  const data = useLazyLoadQuery<SubmissionQueryType>(submissionQuery, {
    name: workflowName,
  });

  const [submissionResults, setSubmissionResults] = useState<
    (
      | SubmissionSuccessMessage
      | SubmissionNetworkErrorMessage
      | SubmissionGraphQLErrorMessage
    )[]
  >([]);

  const [commitMutation] = useMutation<SubmissionMutationType>(submissionMutation);

  function submitWorkflow(visit: Visit, parameters: object) {
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
          console.log("Successfully submitted:", submittedName);
          setVisit(visit);
          setSubmissionResults((prev) => [
            {
              type: "success",
              message: `successfully submitted workflow: ${submittedName}`,
            },
            ...prev,
          ]);
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

  return (
    <>
      {workflowName ? (
        <Box>
          <SubmissionForm
            template={data.workflowTemplate}
            prepopulatedParameters={prepopulatedParameters}
            visit={visit}
            onSubmit={submitWorkflow}
          />
          <SubmittedMessagesList submissionResults={submissionResults} />
        </Box>
      ) : (
        <>No Workflow Name provided</>
      )}
    </>
  );
}