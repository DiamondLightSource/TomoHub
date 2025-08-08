import { Box, Typography, Link } from '@mui/material';
import React from 'react';

export default function Footer() {
  return (
    <Box
      sx={theme => ({
        py: 3,
        px: 2,
        mt: 10,
        backgroundColor: theme.palette.primary.main,
        width: '100%',
      })}
    >
      <Typography variant="body2" color="text.secondary" align="center">
        {new Date().getFullYear()}{' '}
        <Link
          color="inherit"
          target="_blank"
          href="https://www.diamond.ac.uk/Home.html"
          underline="hover"
        >
          Diamond Light Sources Ltd
        </Link>
      </Typography>
    </Box>
  );
}
