import React, { Suspense, useState } from "react";
import {
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Button,
  Tooltip,
} from "@mui/material";
import { SessionQueryQuery } from "../__generated__/App.generated";
import {
  GetSessionByReferenceQuery,
  GetSessionByReferenceQueryVariables,
} from "./__generated__/SessionSelector.generated";
import { visitRegex } from "@diamondlightsource/sci-react-ui";
import { gql, TypedDocumentNode } from "@apollo/client";
import { useSuspenseQuery } from "@apollo/client/react";

const GET_SESSION_BY_REFERENCE: TypedDocumentNode<
  GetSessionByReferenceQuery,
  GetSessionByReferenceQueryVariables
> = gql`
  query GetSessionByReference($reference: String!) {
    instrumentSessionByReference(reference: $reference) {
      instrument {
        name
      }
      instrumentSessionNumber
      proposal {
        proposalNumber
        proposalCategory
      }
    }
  }
`;

export enum SessionSelectionMode {
  Latest = "Latest",
  Custom = "Custom",
}

type NonNullAccount = NonNullable<SessionQueryQuery["account"]>;

export type InstrumentSession =
  NonNullAccount["instrumentSessionRoles"]["edges"][0]["node"]["instrumentSession"];

type SessionSelectorProps = {
  setSession: (_: InstrumentSession | null) => void;
  mode: SessionSelectionMode;
  setMode: (_: SessionSelectionMode) => void;
};

export const SessionSelector: React.FC<SessionSelectorProps> = ({
  setSession,
  mode,
  setMode,
}: SessionSelectorProps) => {
  const [customeSessionInputValue, setCustomSessionInputValue] =
    useState<string>("");

  return (
    <Stack direction="row" spacing={2} alignItems={"center"}>
      <ToggleButtonGroup
        exclusive
        value={mode}
        onChange={(_, toggleButtonLabel: string) => {
          if (toggleButtonLabel === SessionSelectionMode.Latest) {
            setMode(SessionSelectionMode.Latest);
          } else if (toggleButtonLabel === SessionSelectionMode.Custom) {
            setMode(SessionSelectionMode.Custom);
          }
        }}
      >
        <ToggleButton
          sx={{ textTransform: "none" }}
          value={SessionSelectionMode.Latest}
        >
          {SessionSelectionMode.Latest}
        </ToggleButton>
        <ToggleButton
          sx={{ textTransform: "none" }}
          value={SessionSelectionMode.Custom}
        >
          {SessionSelectionMode.Custom}
        </ToggleButton>
      </ToggleButtonGroup>
      <TextField
        data-testid="session-selector-input"
        variant="outlined"
        label="Session"
        disabled={mode === SessionSelectionMode.Latest}
        value={customeSessionInputValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setCustomSessionInputValue(e.target.value);
        }}
      />
      <Suspense fallback={<p>Checking session...</p>}>
        <SelectSessionButton
          sessionInputValue={customeSessionInputValue}
          sessionSelectionMode={mode}
          setSession={setSession}
        />
      </Suspense>
    </Stack>
  );
};

type SelectSessionButtonProps = {
  sessionInputValue: string;
  sessionSelectionMode: SessionSelectionMode;
  setSession: (_: InstrumentSession | null) => void;
};

const SelectSessionButton: React.FC<SelectSessionButtonProps> = ({
  sessionInputValue,
  sessionSelectionMode,
  setSession,
}) => {
  const { data } = useSuspenseQuery(GET_SESSION_BY_REFERENCE, {
    variables: { reference: sessionInputValue },
  });

  const isDisabled = () => {
    if (sessionSelectionMode === SessionSelectionMode.Latest) {
      return true;
    } else {
      return (
        visitRegex.exec(sessionInputValue) === null ||
        data.instrumentSessionByReference === null
      );
    }
  };

  const generateTooltipText = () => {
    if (sessionSelectionMode === SessionSelectionMode.Latest) {
      return "";
    } else if (visitRegex.exec(sessionInputValue) === null) {
      return "Session must be of the following format: abcdef12345-1";
    } else if (
      visitRegex.exec(sessionInputValue) !== null &&
      data.instrumentSessionByReference === null
    ) {
      return `The session ${sessionInputValue} doesn't exist`;
    }
  };

  return (
    <Tooltip title={generateTooltipText()}>
      <span>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setSession(data.instrumentSessionByReference)}
          disabled={isDisabled()}
        >
          Select session
        </Button>
      </span>
    </Tooltip>
  );
};
