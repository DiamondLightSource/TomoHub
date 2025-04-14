import { Typography, Button, Box, ButtonGroup, Tooltip } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ScienceIcon from '@mui/icons-material/Science';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import useDeployment from "../hooks/useDeployment";

function Header() {
  const { isLocal } = useDeployment(); // Get deployment status to disable Centre finder if needed

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
      }}
    >
      <Typography variant="h4" gutterBottom>
        TOMOHUB Demo - GUI for HTTOMO package
      </Typography>
      
      <ButtonGroup 
        variant="outlined" 
        aria-label="main navigation button group"
        sx={{ mt: 2 }}
        fullWidth
      >
        <Button 
          component={Link} 
          to="/"
          startIcon={<MenuBookIcon />}
        >
          Guide
        </Button>
        <Button 
          component={Link} 
          to="/methods"
          startIcon={<ScienceIcon />}
        >
          Methods
        </Button>
        <Button 
          component={Link} 
          to={isLocal ? "/corfinder" : "#"}
          startIcon={<CenterFocusStrongIcon />}
          onClick={(e) => !isLocal && e.preventDefault()}
          sx={{ 
            opacity: isLocal ? 1 : 0.7,
            pointerEvents: isLocal ? 'auto' : 'auto',
            "&:hover": {
              cursor: isLocal ? 'pointer' : 'not-allowed'
            }
          }}
          title={!isLocal ? "This feature is only available in local deployment mode" : ""}
        >
          Centre finder
        </Button>
        <Button 
          component={Link} 
          to="/pipelines"
          startIcon={<AutoFixHighIcon />}
        >
          Full pipelines
        </Button>
      </ButtonGroup>
    </Box>
  );
}

export default Header;