import { Typography,ButtonGroup,Button } from '@mui/material';
import React from 'react';

function Header(){
  return (
    <header className="topHeader">
      <Typography variant="h4">TOMOHUB -  GUI for HTTOMO package </Typography>
      <ButtonGroup variant="outlined" className="topHeader--ButtonGroup" aria-label="Basic button group" fullWidth>
        <Button>Full Pipeline 1</Button>
        <Button>Full Pipeline 2</Button>
        <Button>Full Pipeline 3</Button>
        <Button>Full Pipeline 4</Button>
      </ButtonGroup>
    </header>
  );
};

export default Header;
