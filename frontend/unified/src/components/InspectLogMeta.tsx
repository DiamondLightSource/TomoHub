import React, { FC } from "react";
import { Button, Stack } from "@mui/material";

import { useQuery } from "@apollo/client/react";
import { gql, type TypedDocumentNode } from "@apollo/client";

import {
  LogQueryQuery,
  LogQueryQueryVariables,
} from "./__generated__/InspectLogMeta.generated";

export const InspectLog_Query: TypedDocumentNode<
  LogQueryQuery,
  LogQueryQueryVariables
> = gql`
  query logQuery($visitobj: VisitInput!, $name: String!) {
    workflow(visit: $visitobj, name: $name) {
      name
      id
      status {
        __typename
        ... on WorkflowSucceededStatus {
          message
          tasks {
            name
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

export const DisplayLogMeta: FC = (props :{
  visit: any
}) => {

  const { loading, error, data } = useQuery(InspectLog_Query, {
    variables: { visitobj: props.visit, name: "example-template-599zg" },
  });
  let x: any = [];


  if (data !== undefined && data !== null) {
    if (data.workflow !== undefined && data.workflow !== null) {
      data.workflow.status?.tasks.forEach((element: any) => {
        element.artifacts.forEach((subElement: any) => {
          if (subElement !== undefined) {
            if (subElement.url !== undefined) {
              if(subElement.mimeType == "text/plain") {
                x.push([subElement.url, element.name + ".log"]);
              }
            }
          }
        });
      });
    }
  }

  const openInNewTab = (url: string) => {
    if (url !== "undefined") {
      const w = window.open(url, "_blank");
      w?.focus();
    }
  };

  function makeButtonArray(Arr: any) {
    return (
      <Stack direction="row" spacing={1}>
        {" "}
        {Arr.map((subArr: any) => {
          return (
            <Button variant="contained" onClick={() => openInNewTab(subArr[0])}>
              {" "}
              {subArr[1]}{" "}
            </Button>
          );
        })}{" "}
      </Stack>
    );
  }

  

  return <div>{makeButtonArray(x)}</div>;
};

export default DisplayLogMeta;
