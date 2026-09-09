import React, { Suspense } from "react";
import "@testing-library/jest-dom";
import { expect, test, vi, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import {
  GET_SESSION_BY_REFERENCE,
  SessionSelectionMode,
  SessionSelector,
} from "../src/components/SessionSelector";
import { MockedProvider } from "@apollo/client/testing/react";

afterEach(() => {
  vi.clearAllMocks();
});

const mocks = [
  {
    request: {
      query: GET_SESSION_BY_REFERENCE,
      variables: {
        reference: "",
      },
    },
    result: {
      data: {
        instrumentSessionByReference: null,
      },
    },
  },
];

test("set session button disabled when session input doesn't match visit regex", async () => {
  await act(() =>
    render(
      <MockedProvider mocks={mocks}>
        <Suspense fallback={<div>Loading...</div>}>
          <SessionSelector
            mode={SessionSelectionMode.Custom}
            setMode={() => console.log("setMode")}
            setSession={() => console.log("setSession")}
          />
        </Suspense>
      </MockedProvider>
    )
  );

  const sessionSelectorInput = await screen.findByTestId(
    "select-session-button"
  );
  expect(sessionSelectorInput).toBeDisabled();
});
