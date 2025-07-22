import { useFragment, graphql } from "react-relay";
import {
  JSONObject,
  SubmissionForm as SubmissionFormBase,
  Visit,
} from "workflows-lib";
import { JsonSchema, UISchemaElement } from "@jsonforms/core";
import { SubmissionFormFragment$key } from "./__generated__/SubmissionFormFragment.graphql";
import React from "react";

const submissionFormFragment = graphql`
  fragment SubmissionFormFragment on WorkflowTemplate {
    name
    maintainer
    title
    description
    arguments
    uiSchema
    
  }
`;

const SubmissionForm = (props: {
  template: SubmissionFormFragment$key;
  prepopulatedParameters?: JSONObject;
  visit?: Visit;
  onSubmit: (visit: Visit, parameters: object) => void;
}) => {
  const data = useFragment(submissionFormFragment, props.template);
  const customSchema = {
    type: "object",
    properties: {
      start: { type: "number", default: 0},
      stop: { type: "number" },
      step:{ type: "number" , default: 5}
    },
    required: ["start","stop","step"]
  };
  
  return (
    <SubmissionFormBase
      title={data.title ? data.title : data.name}
      maintainer={data.maintainer}
      description={data.description ? data.description : undefined}
      parametersSchema={data.arguments as JsonSchema}
      parametersUISchema={data.uiSchema as UISchemaElement}
      visit={props.visit}
      prepopulatedParameters={props.prepopulatedParameters}
      onSubmit={props.onSubmit}
    />
  );
};

export default SubmissionForm;