import React from 'react';
import { Box } from '@mui/material';
import YMLG from '../common/YamlGenerator';
import MethodsTabs from '../methods/MethodsTabs';

const Methods: React.FC = () => {
  return (
    <Box component="section" className="dropdowns">
      <MethodsTabs />
      <YMLG />
    </Box>
  );
};

export default Methods;
