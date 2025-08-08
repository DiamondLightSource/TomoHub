import React, { useEffect, useState } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Card,
  Typography,
  Tooltip,
} from '@mui/material';
import { fullpipelinesService } from '../api/services'; // Adjust the import path as needed
import { ApiFullPipelineSchema } from '../types/APIresponse'; // Define the type for your API response
import { useMethods } from '../contexts/MethodsContext'; // Import the useMethods hook
import InfoIcon from '@mui/icons-material/Info';

const PipelineSelector: React.FC = () => {
  const [pipelines, setPipelines] = useState<ApiFullPipelineSchema | null>(
    null
  );
  const [selectedPipeline, setSelectedPipeline] = useState<string>('');
  const { addMethod, clearMethods } = useMethods(); // Access the addMethod function from the context

  // Fetch the pipelines data on component mount
  useEffect(() => {
    const fetchPipelines = async () => {
      try {
        const data = await fullpipelinesService.getFullPipelines();
        // Filter out keys that start with "cpu_"
        const filteredData = Object.fromEntries(
          Object.entries(data).filter(([key]) => !key.startsWith('cpu_'))
        );
        setPipelines(filteredData);
      } catch (error) {
        console.error('Failed to fetch pipelines:', error);
      }
    };

    fetchPipelines();
  }, []);

  // Handle selection change
  const handleChange = (event: SelectChangeEvent<string>) => {
    const selectedKey = event.target.value as string;
    if (selectedKey === 'clear') {
      clearMethods();
    }
    setSelectedPipeline(selectedKey);
    if (pipelines && pipelines[selectedKey]) {
      const pipeline = pipelines[selectedKey];
      clearMethods();
      Object.entries(pipeline).forEach(([name, config]) => {
        addMethod(name, config.module_path, config.parameters);
      });
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        mt: 4,
        p: 2,
        border: '1px solid #89987880',
        borderRadius: '4px',
      }}
    >
      <Typography
        gutterBottom
        sx={{ mb: 1, display: 'flex', alignItems: 'center' }}
      >
        Ready to use pipelines
        <Tooltip
          title="Select to load predefined pipelines"
          placement="top-start"
        >
          <InfoIcon sx={{ ml: 0.5 }} fontSize="small" />
        </Tooltip>
      </Typography>
      <FormControl fullWidth>
        <InputLabel size="small" id="pipeline-select-label">
          Select Pipeline
        </InputLabel>
        <Select
          labelId="pipeline-select-label"
          value={selectedPipeline}
          onChange={handleChange}
          label="Select Pipeline"
          variant="standard"
          size="small"
          displayEmpty
        >
          {pipelines &&
            Object.keys(pipelines).map(key => (
              <MenuItem key={key} value={key}>
                {key}
              </MenuItem>
            ))}
          <MenuItem key={'None'} value={'clear'}>
            None
          </MenuItem>
        </Select>
      </FormControl>
    </Card>
  );
};

export default PipelineSelector;
