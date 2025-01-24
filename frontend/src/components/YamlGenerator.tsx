import { stringify } from 'yaml';
import { useMethods } from '../contexts/MethodsContext';
import { Button, Box, Typography, Alert } from '@mui/material';
import TextField from '@mui/material/TextField';
import React from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import { useLoader } from '../contexts/LoaderContext';
import { useSweep } from '../contexts/SweepContext'; // Import the SweepContext

const YMLG = () => {
  const { methods } = useMethods();
  const [yamlFileName, setYamlFileName] = React.useState<string>('config');
  const { method, module_path, parameters } = useLoader(); // Access the LoaderContext
  const { activeSweep } = useSweep(); // Access the SweepContext

  // Handle file name change
  const changeFileName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setYamlFileName(event.target.value);
  };

  // Function to create and download the YAML file
  const createAndDownloadYAML = () => {
    // Create the LoaderContext object
    const loaderContextObject = {
      method,
      module_path,
      parameters,
    };

    // Convert MethodsContext state to YAML
    const transformedMethods = methods.map((method) => {
      // Construct the new object with modifications
      const transformedMethod = {
        method: method.method_name, // Replace "name" with "method"
        module_path: method.method_module, // Explicit type assertion
        parameters: { ...method.parameters }, // Copy parameters
      };

      // Add conditional extra data
      if (method.method_name === 'find_center_vo' || method.method_name === 'find_center_pc') {
        return {
          ...transformedMethod,
          id: 'centering',
          sideoutput: { cor: 'center_of_rotation' }, // Add an extra object if the condition is met
        };
      }
      return transformedMethod;
    });

    // Combine LoaderContext and MethodsContext data
    const combinedData = [loaderContextObject, ...transformedMethods];

    // Convert the combined data to YAML
    let yamlContent = stringify(combinedData);

    // Post-process the YAML string to add custom tags
    if (activeSweep) {
      const { methodId, paramName, sweepType } = activeSweep;

      // Find the method and parameter in the YAML string
      const methodRegex = new RegExp(`method: ${methodId}[\\s\\S]*?parameters:[\\s\\S]*?${paramName}:`, 'g');
      const match = methodRegex.exec(yamlContent);

      if (match) {
        // Insert the custom tag based on sweep type
        const tag = sweepType === 'range' ? '!SweepRange' : '!Sweep';
        yamlContent = yamlContent.replace(
          `${paramName}:`,
          `${paramName}: ${tag}`
        );
      }
    }

    // Create a Blob object with YAML content
    const blob = new Blob([yamlContent], { type: 'application/x-yaml' });

    // Create a download link and download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${yamlFileName}.yaml`;
    link.click();

    // Clean up
    URL.revokeObjectURL(link.href);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mt: 10,
      }}
    >
      <TextField
        id="standard-basic"
        label="Select a name for your config file"
        sx={{ flex: 1.5 }}
        variant="standard"
        value={yamlFileName}
        onChange={changeFileName}
      />
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={createAndDownloadYAML}
        sx={{ flex: 1 }}
        size="large"
      >
        Get Config
      </Button>
    </Box>
  );
};

export default YMLG;