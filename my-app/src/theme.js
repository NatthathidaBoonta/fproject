import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode = 'light') => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#064460', // Yale Blue
        light: '#0a5d83',
        dark: '#042d40',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#F9C824', // Harvest Gold
        light: '#fde047',
        dark: '#ca8a04',
        contrastText: '#1e293b',
      },
      error: {
        main: '#dc2626', // Keep standard red for errors but clean
        light: '#fca5a5',
        dark: '#991b1b',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#f59e0b',
        light: '#fde68a',
        dark: '#b45309',
        contrastText: '#1e293b',
      },
      success: {
        main: '#16a34a',
        light: '#86efac',
        dark: '#166534',
        contrastText: '#ffffff',
      },
      background: {
        default: mode === 'light' ? '#f8fafc' : '#0f172a',
        paper: mode === 'light' ? '#ffffff' : '#1e293b',
      },
      text: {
        primary: mode === 'light' ? '#0f172a' : '#f8fafc',
        secondary: mode === 'light' ? '#475569' : '#94a3b8',
      },
      divider: mode === 'light' ? '#e2e8f0' : '#334155',
    },
    typography: {
      fontFamily: `"Noto Sans Thai", "Prompt", "Sarabun", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
      fontSize: 13,
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 800 },
      h4: { fontWeight: 800 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      body1: { lineHeight: 1.6 },
      body2: { lineHeight: 1.6 },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 8,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '8px 16px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(6, 68, 96, 0.15)',
            },
          },
          containedPrimary: {
            background: mode === 'light' 
              ? 'linear-gradient(135deg, #064460 0%, #095a80 100%)' 
              : 'linear-gradient(135deg, #0a5d83 0%, #064460 100%)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'light' 
              ? '0 10px 30px rgba(6, 68, 96, 0.04)' 
              : '0 10px 30px rgba(0, 0, 0, 0.2)',
            border: mode === 'light' 
              ? '1px solid rgba(226, 232, 240, 0.8)' 
              : '1px solid rgba(51, 65, 85, 0.8)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            backgroundColor: mode === 'light' ? '#f8fafc' : '#1e293b',
          },
        },
      },
    },
  });
};
