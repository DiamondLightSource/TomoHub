import { Box, Typography, Container,Link } from "@mui/material";
import React from 'react';

export default function Footer() {
  return (
    <Box
      sx={(theme) => ({
        py: 3,
        px: 2,
        mt: "auto",
        backgroundColor: theme.palette.primary.main,

      })}
    >
      <Container maxWidth="sm">
        <Typography variant="body2" color='#F7F7F2' align="center">
          {new Date().getFullYear()} <Link color="inherit" target="_blank" href="https://www.diamond.ac.uk/Home.html">Diamond Light Sources Ltd</Link>
        </Typography>
      </Container>
    </Box>
  );
}
