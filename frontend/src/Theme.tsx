import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#899878', // Define primary color
    },
    secondary: {
      main: '#F7F7F2', // Define secondary color
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFF',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: '700',
    },
    body1: {
      fontSize: '1rem',
    },
  },
  spacing: 10,
  // Add custom breakpoints
  breakpoints: {
    values: {
      xs: 0, // Extra small devices (phones)
      sm: 300, // Small devices (tablets)
      md: 500, // Medium devices (small laptops)
      lg: 1000, // Large devices (desktops)
      xl: 1536, // Extra large devices (large desktops)
    },
  },
});

export default theme;
