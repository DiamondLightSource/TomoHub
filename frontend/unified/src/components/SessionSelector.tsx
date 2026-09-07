import React from "react";
import {
  Chip,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
} from "@mui/material";
import { useState } from "react";
import { SessionQueryQuery } from "../__generated__/App.generated";

export enum SessionSelectionMode {
  Latest = "Latest",
  Custom = "Custom",
}

type NonNullAccount = NonNullable<SessionQueryQuery["account"]>;

type SessionSelectorProps = {
  session: NonNullAccount["instrumentSessionRoles"]["edges"][0]["node"]["instrumentSession"];
  mode: SessionSelectionMode;
  setMode: (_: SessionSelectionMode) => void;
};

export const SessionSelector: React.FC<SessionSelectorProps> = ({
  session,
  mode,
  setMode,
}: SessionSelectorProps) => {
  const [beamline] = useState<string>(session.instrument.name);
  const [textInputValue, setTextInputValue] = useState<string>("");

  const proposal = session?.proposal;
  const latestSession = `${proposal.proposalCategory?.toLowerCase()}${proposal.proposalNumber}-${session.instrumentSessionNumber}`;

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
        value={
          mode === SessionSelectionMode.Latest ? latestSession : textInputValue
        }
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setTextInputValue(e.currentTarget.value);
        }}
      />
      <Chip label={beamline} variant="outlined" color="primary"></Chip>
    </Stack>
  );
};
