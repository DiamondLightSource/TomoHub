import React from 'react';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import { Card, Typography } from '@mui/material';

const Guide: React.FC = () => {
  return (
    <>
      <Card
        variant="outlined"
        sx={{
          mx: 'auto',
          mb: 2,
          p: 2,
          border: '1px solid #89987880',
          borderRadius: '4px',
        }}
      >
        <Typography variant="h6">What is tomohub ?</Typography>
        <Typography variant="body1" gutterBottom>
          Tomohub is a graphical tool to generate yaml processlists (config
          files) to run construction jobs with{' '}
          <a
            href="https://diamondlightsource.github.io/httomo/index.html"
            target="_blank"
          >
            HTTOMO package
          </a>
          <br />
          and can also run HTTOMO locally
        </Typography>
        <Typography variant="h6">How to start ?</Typography>
        <Typography variant="body1" gutterBottom>
          Start by setting up your loader and then select your required methods
          afterwards
        </Typography>
        <Typography variant="h6">Further information</Typography>
        <Typography variant="body1" gutterBottom>
          Please visit Tomohub's
          <a
            href="https://github.com/DiamondLightSource/TomoHub"
            target="_blank"
          >
            {' '}
            github
          </a>{' '}
          page
        </Typography>
        <Typography variant="h6">Reporting issues</Typography>
        <Typography variant="body1">
          To{' '}
          <a
            href="https://github.com/DiamondLightSource/TomoHub/issues/new?template=Blank+issue"
            target="_blank"
          >
            report
          </a>{' '}
          any issue/feedback
        </Typography>
      </Card>
    </>
  );
};

export default Guide;
