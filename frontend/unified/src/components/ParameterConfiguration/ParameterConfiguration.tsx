import { Button, Typography } from "@mui/material";
import { Option, Technique } from "../../types";
import OptionSelect from "../OptionSelect";
import { CorSweepParameterConfiguration } from "./TomoParameterConfiguration";
import { ReactElement, useState } from "react";
import { LoaderProvider } from "../../../../tomography/src/contexts/LoaderContext";
import { SUBMIT_WORKFLOW_TEMPLATE } from "../../../../tomography/src/components/workflows/Submission";
import { useMutation } from "@apollo/client/react";

type ParameterConfigurationProps = {
  technique: Technique;
  template: string;
  setTemplate: (_: string) => void;
  availableTemplates: Option[];
};

/**
 * Map from a `@Technique` and a template to the component for configuring the parameters of that
 * specific template
 * @type
 */
type TemplateComponentMapping = {
  [technique in Technique]: {
    [template: string]: ReactElement;
  };
};

// TODO: Should come from the session selector component
const HARDCODED_VISIT = {
  proposalCode: "cm",
  proposalNumber: 40628,
  number: 3,
};

// TODO: The filename part of this should come from the scan selector component
const HARDCODED_INPUT_FILEPATH =
  "/dls/i12/data/2025/cm40628-3/rawdata/188700.nxs";

export const ParameterConfiguration: React.FC<ParameterConfigurationProps> = ({
  technique,
  template,
  setTemplate,
  availableTemplates,
}: ParameterConfigurationProps) => {
  const [templateParameters, setTemplateParameters] = useState<object>({});
  const [resourceParameters] = useState({
    nprocs: 1,
    memory: "20Gi",
  });
  const [mutation] = useMutation(SUBMIT_WORKFLOW_TEMPLATE);

  const handleSubmitJob = () => {
    // TODO: Validate parameters against JSON schema attached to the workflow template before
    // sending the mutation
    console.log("Submit job");
    const parameters = {
      input: HARDCODED_INPUT_FILEPATH,
      ...templateParameters,
      ...resourceParameters,
    };
    mutation({
      variables: {
        name: template,
        parameters,
        visit: HARDCODED_VISIT,
      },
    });
  };

  const TEMPLATE_TO_COMPONENT_MAPPING: TemplateComponentMapping = {
    [Technique.Dpc]: {},
    [Technique.Nbed]: {},
    [Technique.Ptycho]: {},
    [Technique.Tomo]: {
      "httomo-cor-sweep": (
        <LoaderProvider>
          <CorSweepParameterConfiguration
            setParameters={setTemplateParameters}
          />
        </LoaderProvider>
      ),
      "ptycho-tomography": <p>ptycho-tomo template</p>,
    },
    [Technique.Xanes]: {},
    [Technique.Xrd]: {},
  };

  const PlaceholderComponent = (
    <p>No available component for {template} template</p>
  );

  return (
    <>
      <OptionSelect
        label="Template"
        value={template}
        options={availableTemplates}
        onChange={(e) => setTemplate(e.target.value)}
      />

      <Typography variant="h6">Options</Typography>

      {TEMPLATE_TO_COMPONENT_MAPPING[technique][template] ??
        PlaceholderComponent}

      <div>
        <Button variant="contained" color="primary" onClick={handleSubmitJob}>
          Submit job
        </Button>
      </div>
    </>
  );
};
