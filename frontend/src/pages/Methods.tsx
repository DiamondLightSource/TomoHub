import React from 'react';
import { Box } from '@mui/material';
import YMLG from '@/components/YamlGenerator';
import Dropdowns from '@/components/Dropdowns';

const Methods: React.FC = () => {
  return (
    <Box component="section" className="dropdowns">
      <Dropdowns />
      <YMLG />
    </Box>
  );
};

export default Methods;
