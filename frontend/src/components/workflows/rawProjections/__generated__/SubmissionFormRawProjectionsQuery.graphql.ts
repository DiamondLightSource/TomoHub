/**
 * @generated SignedSource<<b960d2ffef85d4f992764beeb1f53e1f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SubmissionFormRawProjectionsQuery$variables = Record<PropertyKey, never>;
export type SubmissionFormRawProjectionsQuery$data = {
  readonly workflow: {
    readonly status: {
      readonly tasks?: ReadonlyArray<{
        readonly artifacts: ReadonlyArray<{
          readonly url: any;
        }>;
      }>;
    } | null | undefined;
  };
};
export type SubmissionFormRawProjectionsQuery = {
  response: SubmissionFormRawProjectionsQuery$data;
  variables: SubmissionFormRawProjectionsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "name",
    "value": "extract-raw-projections-vqxt4"
  },
  {
    "kind": "Literal",
    "name": "visit",
    "value": {
      "number": 2,
      "proposalCode": "cm",
      "proposalNumber": 40628
    }
  }
],
v1 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Task",
      "kind": "LinkedField",
      "name": "tasks",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Artifact",
          "kind": "LinkedField",
          "name": "artifacts",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "url",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "WorkflowSucceededStatus",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "SubmissionFormRawProjectionsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "Workflow",
        "kind": "LinkedField",
        "name": "workflow",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "status",
            "plural": false,
            "selections": [
              (v1/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": "workflow(name:\"extract-raw-projections-vqxt4\",visit:{\"number\":2,\"proposalCode\":\"cm\",\"proposalNumber\":40628})"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "SubmissionFormRawProjectionsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "Workflow",
        "kind": "LinkedField",
        "name": "workflow",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "status",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
              (v1/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": "workflow(name:\"extract-raw-projections-vqxt4\",visit:{\"number\":2,\"proposalCode\":\"cm\",\"proposalNumber\":40628})"
      }
    ]
  },
  "params": {
    "cacheID": "2c0adf9909893da665cb7bdf15b22b15",
    "id": null,
    "metadata": {},
    "name": "SubmissionFormRawProjectionsQuery",
    "operationKind": "query",
    "text": "query SubmissionFormRawProjectionsQuery {\n  workflow(name: \"extract-raw-projections-vqxt4\", visit: {proposalCode: \"cm\", proposalNumber: 40628, number: 2}) {\n    status {\n      __typename\n      ... on WorkflowSucceededStatus {\n        tasks {\n          artifacts {\n            url\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ea99da434932141ad759a629bbe28ca9";

export default node;
