import { stringify } from 'yaml';
import { useMethods } from '../contexts/MethodsContext';
import { Button, Box, Typography, Alert } from '@mui/material';
import TextField from '@mui/material/TextField';
import React from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import { useLoader } from '../contexts/LoaderContext';
import { useSweep } from '../contexts/SweepContext';

const YMLG = () => {
  const { methods } = useMethods();
  const [yamlFileName, setYamlFileName] = React.useState<string>('config');
  const { method, module_path, parameters } = useLoader();
  const { activeSweep } = useSweep();

  const changeFileName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setYamlFileName(event.target.value);
  };

  const createAndDownloadYAML = () => {
    const loaderContextObject = {
      method,
      module_path,
      parameters,
    };

    // Transform methods and inject calculate_stats where needed
    const transformedMethods = methods.reduce((acc: any[], method) => {
      // Base transformed method
      const transformedMethod = {
        method: method.method_name,
        module_path: method.method_module,
        parameters: { ...method.parameters },
      };

      // If we encounter rescale_to_int, add calculate_stats before it
      if (method.method_name === 'rescale_to_int') {
        acc.push({
          method: 'calculate_stats',
          module_path: 'httomo.methods',
          parameters: {},
          id: 'statistics',
          side_outputs: {
            glob_stats: 'glob_stats'
          }
        });
      }

      // Handle the centering methods case
      if (method.method_name === 'find_center_vo' || method.method_name === 'find_center_pc') {
        acc.push({
          ...transformedMethod,
          id: 'centering',
          sideoutput: { cor: 'center_of_rotation' },
        });
      } else {
        // Add the regular transformed method
        acc.push(transformedMethod);
      }

      return acc;
    }, []);

    // Combine LoaderContext and MethodsContext data
    const combinedData = [loaderContextObject, ...transformedMethods];

    // Convert the combined data to YAML
    let yamlContent = stringify(combinedData);

    // Post-process the YAML string to add custom tags
    if (activeSweep) {
      const { methodId, paramName, sweepType } = activeSweep;
      const methodRegex = new RegExp(`method: ${methodId}[\\s\\S]*?parameters:[\\s\\S]*?${paramName}:`, 'g');
      const match = methodRegex.exec(yamlContent);

      if (match) {
        const tag = sweepType === 'range' ? '!SweepRange' : '!Sweep';
        yamlContent = yamlContent.replace(
          `${paramName}:`,
          `${paramName}: ${tag}`
        );
      }
    }

    // Create and download the file
    const blob = new Blob([yamlContent], { type: 'application/x-yaml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${yamlFileName}.yaml`;
    link.click();
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