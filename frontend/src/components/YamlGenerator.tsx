import { useMethods } from '../contexts/MethodsContext';
import { Button, Box, Alert } from '@mui/material';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import { useLoader } from '../contexts/LoaderContext';
import { useSweep } from '../contexts/SweepContext';
import { yamlService } from '../api/services';

const YMLG = () => {
  const { methods } = useMethods();
  const [yamlFileName, setYamlFileName] = React.useState<string>('config');
  const { method, module_path, parameters } = useLoader();
  const { activeSweep } = useSweep();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeFileName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setYamlFileName(event.target.value);
  };

  const generateAndDownloadYAML = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
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

      // Prepare data for the backend
      const requestData = {
        data: combinedData,
        fileName: yamlFileName,
        sweepConfig: activeSweep || null,
      };

      // Use the YAML service instead of directly using axios
      const blobData = await yamlService.generateYaml(requestData);

      // Create a download from the response blob
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${yamlFileName}.yaml`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error generating YAML:', err);
      setError('Failed to generate YAML file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 10 }}>
      {error && <Alert severity="error">{error}</Alert>}
      
      <Box sx={{ display: 'flex', gap: 2 }}>
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
          onClick={generateAndDownloadYAML}
          sx={{ flex: 1 }}
          size="large"
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Get Config'}
        </Button>
      </Box>
    </Box>
  );
};

export default YMLG;