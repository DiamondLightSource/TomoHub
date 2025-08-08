import React from 'react';
import { Box, styled } from '@mui/material';
import PipelineSelector from '../components/fullPipelinesSelector';
import YMLG from '../components/YamlGenerator';

const FullPipelines: React.FC = () => {
  return (
    <Box component="section" className="dropdowns">
      <PipelineSelector />
      <YMLG />
    </Box>
  );
};

export default FullPipelines;
