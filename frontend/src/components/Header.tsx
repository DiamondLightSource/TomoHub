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

  const { addMethod } = useMethods();

  const handleClick = () => {
    // Predefined values for LoaderContext
    setDataPath("/predefined/data/path");
    setImageKeyPath("/predefined/image/key/path");
    setRotationAnglesDataPath("/predefined/rotation/angles/path");
    setUserDefinedRotationAngles("0", "180", "360");
    setDarks("/predefined/darks/file", "/predefined/darks/data/path");
    setFlats("/predefined/flats/file", "/predefined/flats/data/path");

    // Predefined values for MethodsContext
    addMethod("find_center_360", "httomolibgpu.recon.rotation", {
      ind: "mid",
      win_width: 10,
      side: null,
      denoise: true,
      norm: false,
      use_overlap: false,
    });

    addMethod("predefined_method_2", "predefined_module_2", {
      param3: "value3",
      param4: "value4",
    });
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
        TOMOHUB - GUI for HTTOMO package
      </Typography>
      <ButtonGroup
        variant="outlined"
        aria-label="Full pipeline button group"
        fullWidth
        sx={{ mt: 2 }}
      >
        <Button>Full Pipeline 1</Button>
        <Button>Full Pipeline 2</Button>
        <Button>Full Pipeline 3</Button>
        <Button onClick={handleClick}>Full Pipeline 4</Button>
      </ButtonGroup>
    </Box>
  );
}

export default Header;