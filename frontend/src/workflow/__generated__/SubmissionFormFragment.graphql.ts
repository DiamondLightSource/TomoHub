/**
 * @generated SignedSource<<a9c883cba2042ae4062fae189a7f7ad5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SubmissionFormFragment$data = {
  readonly arguments: any;
  readonly description: string | null | undefined;
  readonly maintainer: string;
  readonly name: string;
  readonly title: string | null | undefined;
  readonly uiSchema: any | null | undefined;
  readonly " $fragmentType": "SubmissionFormFragment";
};
export type SubmissionFormFragment$key = {
  readonly " $data"?: SubmissionFormFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SubmissionFormFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SubmissionFormFragment",
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
  "type": "WorkflowTemplate",
  "abstractKey": null
};

(node as any).hash = "6e1ed0480da85789fbfb1196078a44c9";

export default node;
