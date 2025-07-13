/**
 * @generated SignedSource<<137b2081a2a1dc01be075b5ade35965f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VisitInput = {
  number: number;
  proposalCode: string;
  proposalNumber: number;
};
export type SubmissionMutation$variables = {
  name: string;
  parameters: any;
  visit: VisitInput;
};
export type SubmissionMutation$data = {
  readonly submitWorkflowTemplate: {
    readonly name: string;
  };
};
export type SubmissionMutation = {
  response: SubmissionMutation$data;
  variables: SubmissionMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "name"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "parameters"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "visit"
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      },
      {
        "kind": "Variable",
        "name": "parameters",
        "variableName": "parameters"
      },
      {
        "kind": "Variable",
        "name": "visit",
        "variableName": "visit"
      }
    ],
    "concreteType": "Workflow",
    "kind": "LinkedField",
    "name": "submitWorkflowTemplate",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "SubmissionMutation",
    "selections": (v3/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "SubmissionMutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "ac9d699a5ace3af946fac0719a17bb0c",
    "id": null,
    "metadata": {},
    "name": "SubmissionMutation",
    "operationKind": "mutation",
    "text": "mutation SubmissionMutation(\n  $name: String!\n  $visit: VisitInput!\n  $parameters: JSON!\n) {\n  submitWorkflowTemplate(name: $name, visit: $visit, parameters: $parameters) {\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "f76886f68cb7d893613b16584d147a14";

export default node;
