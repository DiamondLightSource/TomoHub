import { Typography, Button, Box } from '@mui/material';
import React from 'react';


function Header() {

  return (
    <Box
      component="header"
      sx={{
        textAlign: "center",
        py: 3,
        px: 2,
        backgroundColor: "background.paper",
      }}
    >
      <Typography variant="h4" gutterBottom>
        TOMOHUB Demo - GUI for HTTOMO package
      </Typography>

    </Box>
  );
}

export default Header;