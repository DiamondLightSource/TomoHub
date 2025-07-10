/**
 * @generated SignedSource<<215b4f5434fb832408fa2c024c85f217>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SubmissionQuery$variables = {
  name: string;
};
export type SubmissionQuery$data = {
  readonly workflowTemplate: {
    readonly " $fragmentSpreads": FragmentRefs<"SubmissionFormFragment">;
  };
};
export type SubmissionQuery = {
  response: SubmissionQuery$data;
  variables: SubmissionQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "name"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "SubmissionQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "WorkflowTemplate",
        "kind": "LinkedField",
        "name": "workflowTemplate",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "SubmissionFormFragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SubmissionQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "WorkflowTemplate",
        "kind": "LinkedField",
        "name": "workflowTemplate",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "maintainer",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "title",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "description",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "arguments",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "uiSchema",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a646072d910f97db33d6cbc326176848",
    "id": null,
    "metadata": {},
    "name": "SubmissionQuery",
    "operationKind": "query",
    "text": "query SubmissionQuery(\n  $name: String!\n) {\n  workflowTemplate(name: $name) {\n    ...SubmissionFormFragment\n  }\n}\n\nfragment SubmissionFormFragment on WorkflowTemplate {\n  name\n  maintainer\n  title\n  description\n  arguments\n  uiSchema\n}\n"
  }
};
})();

(node as any).hash = "4fef3fe01f69005e8710f9af2403e29e";

export default node;
