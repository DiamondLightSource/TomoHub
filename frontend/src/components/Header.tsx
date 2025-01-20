import { Typography,ButtonGroup,Button } from '@mui/material';

function Header(){
  return (
    <header className="topHeader">
      <Typography variant="h4">TOMOHUB -  GUI for HTTOMO package </Typography>
      <ButtonGroup variant="outlined" className="topHeader--ButtonGroup" aria-label="Basic button group" fullWidth>
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
        <Button>Four</Button>
      </ButtonGroup>
    </header>
  );
};

export default Header;
