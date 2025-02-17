import { Typography, ButtonGroup, Button, Box } from '@mui/material';
import React from 'react';
import { useLoader } from "../contexts/LoaderContext";
import { useMethods } from "../contexts/MethodsContext";

function Header() {
  
  const {
    setDataPath,
    setImageKeyPath,
    setRotationAnglesDataPath,
    setUserDefinedRotationAngles,
    setDarks,
    setFlats,
  } = useLoader();


  const handleClick = () => {
    // Predefined values for LoaderContext
    setDataPath("/predefined/data/path");
    setImageKeyPath("/predefined/image/key/path");
    setRotationAnglesDataPath("/predefined/rotation/angles/path");
    setUserDefinedRotationAngles("0", "180", "360");
    setDarks("/predefined/darks/file", "/predefined/darks/data/path");
    setFlats("/predefined/flats/file", "/predefined/flats/data/path");
  };

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