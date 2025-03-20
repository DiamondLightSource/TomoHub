import { useMethods } from '../contexts/MethodsContext';
import { Button, Box, Alert, ButtonGroup } from '@mui/material';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useLoader } from '../contexts/LoaderContext';
import { useSweep } from '../contexts/SweepContext';
import { yamlService } from '../api/services';
import useDeployment from '../hooks/useDeployment';

const YMLG = () => {
  const { methods } = useMethods();
  const [yamlFileName, setYamlFileName] = React.useState<string>('config');
  const { method, module_path, parameters } = useLoader();
  const { activeSweep } = useSweep();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLocal } = useDeployment();
  console.log(isLocal)
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
  
  const runLocalHTTOMO = async () => {
    // TODO: Implement local HTTOMO execution
    alert('Running HTTOMO locally - functionality to be implemented');
  };
  
  const runClusterHTTOMO = async () => {
    // TODO: Implement cluster HTTOMO execution
    alert('Running HTTOMO on cluster - functionality to be implemented');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 10 }}>
      {error && <Alert severity="error">{error}</Alert>}
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          id="standard-basic"
          label="Select a name for your config file"
          sx={{ flex: 2.5 }}
          variant="standard"
          value={yamlFileName}
          onChange={changeFileName}
        />
        <ButtonGroup variant="contained" aria-label="Basic button group">
          <Button
            startIcon={<DownloadIcon />}
            onClick={generateAndDownloadYAML}
            size="small"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Get Config'}
          </Button>
          <Button
            startIcon={<PlayArrowIcon />}
            onClick={runLocalHTTOMO}
            size="small"
            disabled={!isLocal} // Enable only in local mode
          >
            Run HTTOMO (local)
          </Button>
          <Button
            startIcon={<PlayArrowIcon />}
            onClick={runClusterHTTOMO}
            size="small"
            disabled={!isLocal} // Enable only in local mode
          >
            Run HTTOMO (cluster)
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
  );
};

export default YMLG;