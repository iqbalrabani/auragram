import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#405DE6',
    },
    background: {
      default: '#fafafa',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme; 