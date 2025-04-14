import { Typography, Button, Box, ButtonGroup } from '@mui/material';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ScienceIcon from '@mui/icons-material/Science';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import useDeployment from "../hooks/useDeployment";

function Header() {
  const { isLocal } = useDeployment();
  const location = useLocation(); // Get current route
  
  // Helper function to check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Box
      component="header"
      sx={{
        textAlign: "center",
        py: 3,
        px: 2,
        backgroundColor: "background.paper",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "60%",
      }}
    >
      <ButtonGroup 
        variant="outlined" 
        aria-label="main navigation button group"
        sx={{ mt: 1 }}
        fullWidth
      >
        <Button 
          component={Link} 
          to="/"
          startIcon={<MenuBookIcon />}
          sx={{
            backgroundColor: isActive('/') ? 'primary.main' : 'transparent',
            color: isActive('/') ? 'white' : 'primary.main',
            '&:hover': {
              backgroundColor: isActive('/') ? 'primary.dark' : 'rgba(25, 118, 210, 0.04)',
            }
          }}
        >
          Guide
        </Button>
        <Button 
          component={Link} 
          to="/methods"
          startIcon={<ScienceIcon />}
          sx={{
            backgroundColor: isActive('/methods') ? 'primary.main' : 'transparent',
            color: isActive('/methods') ? 'white' : 'primary.main',
            '&:hover': {
              backgroundColor: isActive('/methods') ? 'primary.dark' : 'rgba(25, 118, 210, 0.04)',
            }
          }}
        >
          Methods
        </Button>
        <Button 
          component={Link} 
          to={isLocal ? "/corfinder" : "#"}
          startIcon={<CenterFocusStrongIcon />}
          onClick={(e) => !isLocal && e.preventDefault()}
          sx={{ 
            backgroundColor: isActive('/corfinder') ? 'primary.main' : 'transparent',
            color: isActive('/corfinder') ? 'white' : 'primary.main',
            opacity: isLocal ? 1 : 0.7,
            pointerEvents: isLocal ? 'auto' : 'auto',
            "&:hover": {
              backgroundColor: isActive('/corfinder') ? 'primary.dark' : 'rgba(25, 118, 210, 0.04)',
              cursor: isLocal ? 'pointer' : 'not-allowed'
            }
          }}
          title={!isLocal ? "This feature is only available in local deployment mode" : ""}
        >
          Centre finder
        </Button>
        <Button 
          component={Link} 
          to="/fullpipelines"
          startIcon={<AutoFixHighIcon />}
          sx={{
            backgroundColor: isActive('/fullpipelines') ? 'primary.main' : 'transparent',
            color: isActive('/fullpipelines') ? 'white' : 'primary.main',
            '&:hover': {
              backgroundColor: isActive('/fullpipelines') ? 'primary.dark' : 'rgba(25, 118, 210, 0.04)',
            }
          }}
        >
          Full pipelines
        </Button>
      </ButtonGroup>
    </Box>
  );
}

export default Header;