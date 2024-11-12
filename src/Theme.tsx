import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
      primary: {
        main: '#899878', // Define primary color
      },
      secondary: {
        main: '#E4E6C3', // Define secondary color
      },
      background: {
        default: '#F7F7F2',
        paper: '#E4E6C3',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2rem',
        fontWeight: 700,
      },
      body1: {
        fontSize: '1rem',
      },
    },
    spacing: 10, // Define base spacing unit, 8px by default
  });
  
export default theme