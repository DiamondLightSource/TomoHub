import { Box, Chip, Divider, Grid, Stack, Typography } from "@mui/material";
import {
  InstrumentSession,
  SessionSelectionMode,
  SessionSelector,
} from "./components/SessionSelector";
import { ScanSelector } from "./components/ScanSelector";
import JobsViewer from "./components/JobsViewer/JobsViewer";

import { useState } from "react";

import { templateOptions } from "./data/templates";
import { WorkflowForm } from "./components/WorkflowForm";
import { DisplayLogMeta } from "./components/InspectLogMeta";
import { Beamline, Technique } from "./types";
import { ParameterConfiguration } from "./components/ParameterConfiguration/ParameterConfiguration";
import { ApolloProvider, useQuery } from "@apollo/client/react";
import { apolloClientWorkflows } from "../../src/ApolloClient";
import { gql, type TypedDocumentNode } from "@apollo/client";
import {
  SessionQueryQuery,
  SessionQueryQueryVariables,
} from "./__generated__/App.generated";

const VERTICAL_SPACING = 2;
const HORIZONTAL_SPACING = 2;

const BEAMLINE_TECHNIQUES_SUBSET = {
  [Beamline.DIAD]: [Technique.Tomo],
  [Beamline.I12]: [Technique.Tomo],
  [Beamline["I13-1"]]: [
    Technique.Dpc,
    Technique.Ptycho,
    Technique.Tomo,
    Technique.Xanes,
    Technique.Xrd,
  ],
  [Beamline.I14]: [Technique.Dpc, Technique.Xanes, Technique.Xrd],
  [Beamline.Epsic]: [Technique.Dpc, Technique.Nbed, Technique.Ptycho],
};

const BEAMLINES_DEFAULT_TECHNIQUE = {
  [Beamline.DIAD]: Technique.Tomo,
  [Beamline.Epsic]: Technique.Ptycho,
  [Beamline.I12]: Technique.Tomo,
  [Beamline["I13-1"]]: Technique.Ptycho,
  [Beamline.I14]: Technique.Dpc,
};

const filterTemplates = (technique: Technique) => {
  return templateOptions.filter((option) =>
    option.value.includes(technique.toLowerCase())
  );
};

export const SESSION_QUERY: TypedDocumentNode<
  SessionQueryQuery,
  SessionQueryQueryVariables
> = gql`
  query sessionQuery {
    account(username: "twi18192") {
      instrumentSessionRoles(first: 1) {
        edges {
          node {
            instrumentSession {
              proposal {
                proposalNumber
                proposalCategory
              }
              instrumentSessionNumber
              instrument {
                name
              }
            }
          }
        }
      }
    }
  }
`;

export const App: React.FC = () => {
  //adding common states of beamlines, Techique, workflow
  const [showAllTechniques, setShowAllTechniques] = useState(false);
  const [technique, setTechnique] = useState<Technique | null>(null);
  const [template, setTemplate] = useState<string | null>(null);
  const [sessionSelectionMode, setSessionSelectionMode] =
    useState<SessionSelectionMode>(SessionSelectionMode.Latest);
  const [customSession, setCustomSession] = useState<InstrumentSession | null>(
    null
  );
  const { loading, error, data } = useQuery(SESSION_QUERY, { variables: {} });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;
  if (data === undefined) {
    return <p>Data undefined</p>;
  }
  if (data.account === null) {
    return <p>Account null</p>;
  }

  const instrumentSession =
    data.account.instrumentSessionRoles.edges[0].node.instrumentSession;

  const handleChangeTechnique = (
    /**
     * This function handles the clicking of the toggle button which choose the technique and therefore determines which
     * workflows are filtered and shown the template drop down menu this then alteres the data state with new techniques
     * and templates
     */
    _event: React.MouseEvent<HTMLElement>,
    technique: string | null
  ) => {
    if (!technique) return;
    const filteredTemplates = filterTemplates(
      Technique[technique as keyof typeof Technique]
    );
    setTechnique(Technique[technique as keyof typeof Technique]);
    setTemplate(filteredTemplates[0].value);
  };

  const selectdVisit = {
    proposalCode: instrumentSession?.proposal.proposalCategory.toLowerCase(),
    proposalNumber: instrumentSession?.proposal.proposalNumber,
    number: instrumentSession?.instrumentSessionNumber,
  };

  const filterTechniques = (beamline: Beamline) => {
    if (showAllTechniques) {
      return Object.values(Technique);
    }

    return BEAMLINE_TECHNIQUES_SUBSET[beamline];
  };

  let session: InstrumentSession;
  let sessionName: string;
  if (sessionSelectionMode === SessionSelectionMode.Latest) {
    session =
      data.account.instrumentSessionRoles.edges[0].node.instrumentSession;
    sessionName = `${session.proposal.proposalCategory?.toLowerCase()}${session.proposal.proposalNumber}-${session.instrumentSessionNumber}`;
  } else if (
    sessionSelectionMode === SessionSelectionMode.Custom &&
    customSession !== null
  ) {
    session = customSession;
    sessionName = `${session.proposal.proposalCategory?.toLowerCase()}${session.proposal.proposalNumber}-${session.instrumentSessionNumber}`;
  } else {
    // The only other possible case is:
    // ```
    // sessionSelectionMode === SessionSelectionMode.Custom && customSession === null
    // ```
    // and in this case the latest visit is selected.
    //
    // Used an else rather than else-if so then TypeScript knows that all cases have been
    // exhausted and won't say that `session` or `sessionName` may be undefined.
    session =
      data.account.instrumentSessionRoles.edges[0].node.instrumentSession;
    sessionName = `${session.proposal.proposalCategory?.toLowerCase()}${session.proposal.proposalNumber}-${session.instrumentSessionNumber}`;
  }

  const mapStringsToBeamline = (beamline: string): Beamline => {
    switch (beamline) {
      case "I12":
        return Beamline.I12;
      case "DIAD":
        return Beamline.DIAD;
      case "I14":
        return Beamline.I14;
      case "I13-2":
        return Beamline["I13-1"];
    }
  };

  const beamline = mapStringsToBeamline(session.instrument.name);
  const initialTechnique = BEAMLINES_DEFAULT_TECHNIQUE[beamline];
  const initialTemplate = filterTemplates(initialTechnique)[0].label;

  return (
    <>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="h5">Session</Typography>
        <Chip color="primary" variant="outlined" label={sessionName} />
        <Chip
          color="secondary"
          variant="outlined"
          label={session.instrument.name}
        />
      </Stack>
      <SessionSelector
        setSession={setCustomSession}
        mode={sessionSelectionMode}
        setMode={setSessionSelectionMode}
      />
      <ApolloProvider client={apolloClientWorkflows}>
        <Grid container spacing={HORIZONTAL_SPACING} columns={2}>
          <Stack spacing={VERTICAL_SPACING} width="500px">
            <Divider sx={{ width: "100%" }} />
            <Typography variant="h5">Scan</Typography>
            <ScanSelector />
            <Divider sx={{ width: "100%" }} />
            <Typography variant="h5">Technique</Typography>
            <WorkflowForm
              handleChangeTechnique={handleChangeTechnique}
              showAllTechniques={showAllTechniques}
              handleShowAllTechniques={(
                e: React.ChangeEvent<HTMLInputElement>
              ) => {
                setShowAllTechniques(e.target.checked);
                const isSelectedTechniqueInSubset = BEAMLINE_TECHNIQUES_SUBSET[
                  beamline
                ].includes(technique ?? initialTechnique);
                if (!e.target.checked && !isSelectedTechniqueInSubset) {
                  const newTechnique = BEAMLINES_DEFAULT_TECHNIQUE[beamline];
                  setTechnique(newTechnique);
                  const filteredTemplates = filterTemplates(
                    Technique[newTechnique as keyof typeof Technique]
                  );
                  setTemplate(filteredTemplates[0].value);
                }
              }}
              filteredTechniques={filterTechniques(beamline)}
              templateOptions={filterTemplates(technique ?? initialTechnique)}
              technique={technique}
              template={template}
              setTemplate={setTemplate}
            />

            <Divider sx={{ width: "100%" }} />
            <Typography variant="h5">Parameter Configuration</Typography>

            <ParameterConfiguration
              technique={technique ?? initialTechnique}
              template={template ?? initialTemplate}
              setTemplate={setTemplate}
              availableTemplates={filterTemplates(
                Technique[
                  (technique ?? initialTechnique) as keyof typeof Technique
                ]
              )}
            />
          </Stack>
          <Stack spacing={VERTICAL_SPACING} width="500px">
            <Typography variant="h5">Plot</Typography>

            <PlaceholderComponent
              placeholderText="Plot component placeholder"
              height={200}
              width={500}
            />
            <Divider sx={{ width: "100%" }} />
            <Typography variant="h5">Log</Typography>
            <DisplayLogMeta visit={selectdVisit} />

            <PlaceholderComponent
              placeholderText="Log component placeholder"
              height={200}
              width={500}
            />

            <Divider sx={{ width: "100%" }} />
            <Typography variant="h5">Jobs</Typography>
            <JobsViewer
              visit={{
                // TODO: using `toLowerCase()` as the ULIMS instrument session service returns
                // a capitalised "proposal code", whereas the workflows service only accepts
                // it in lowercase
                proposalCode: session.proposal.proposalCategory.toLowerCase(),
                proposalNumber: session.proposal.proposalNumber,
                number: session.instrumentSessionNumber,
              }}
            />
          </Stack>
        </Grid>
      </ApolloProvider>
    </>
  );
};

type PlaceholderComponentProps = {
  placeholderText: string;
  height: number;
  width: number;
};

const PlaceholderComponent = ({
  placeholderText,
  height,
  width,
}: PlaceholderComponentProps) => {
  return (
    <Box
      sx={{ width: width, height: height, border: "1px dashed grey" }}
      alignContent="center"
      justifyItems="center"
    >
      <p>{placeholderText}</p>
    </Box>
  );
};
