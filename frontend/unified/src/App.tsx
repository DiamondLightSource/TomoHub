import { Box, Divider, Grid, Stack, Typography } from "@mui/material";
import {
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
  const [currentBeamline] = useState<Beamline>(Beamline.I14);
  const [technique, setTechnique] = useState<Technique>(
    BEAMLINES_DEFAULT_TECHNIQUE[currentBeamline]
  );
  const [template, setTemplate] = useState<string>(() => {
    const filteredTemplates = filterTemplates(
      Technique[technique as keyof typeof Technique]
    );
    return filteredTemplates[0].value;
  });
  const [sessionSelectionMode, setSessionSelectionMode] =
    useState<SessionSelectionMode>(SessionSelectionMode.Latest);
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

  const filterTechniques = () => {
    if (showAllTechniques) {
      return Object.values(Technique);
    }

    return BEAMLINE_TECHNIQUES_SUBSET[currentBeamline];
  };

  return (
    <>
      <Typography variant="h5">Session</Typography>
      <SessionSelector
        session={instrumentSession}
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
                const isSelectedTechniqueInSubset =
                  BEAMLINE_TECHNIQUES_SUBSET[currentBeamline].includes(
                    technique
                  );
                if (!e.target.checked && !isSelectedTechniqueInSubset) {
                  const newTechnique =
                    BEAMLINES_DEFAULT_TECHNIQUE[currentBeamline];
                  setTechnique(newTechnique);
                  const filteredTemplates = filterTemplates(
                    Technique[newTechnique as keyof typeof Technique]
                  );
                  setTemplate(filteredTemplates[0].value);
                }
              }}
              filteredTechniques={filterTechniques()}
              templateOptions={filterTemplates(technique)}
              technique={technique}
              template={template}
              setTemplate={setTemplate}
            />

            <Divider sx={{ width: "100%" }} />
            <Typography variant="h5">Parameter Configuration</Typography>

            <ParameterConfiguration
              technique={technique}
              template={template}
              setTemplate={setTemplate}
              availableTemplates={filterTemplates(
                Technique[technique as keyof typeof Technique]
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
                proposalCode:
                  instrumentSession.proposal.proposalCategory.toLowerCase(),
                proposalNumber: instrumentSession.proposal.proposalNumber,
                number: instrumentSession.instrumentSessionNumber,
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
