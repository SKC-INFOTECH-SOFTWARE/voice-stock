import { createTheme } from '@mui/material/styles'

// Indigo-accented theme, built per color mode. Shared by billing + admin.
export function buildTheme(mode) {
  const isDark = mode === 'dark'
  return createTheme({
    palette: {
      mode,
      primary: { main: '#4f46e5', light: '#6366f1', dark: '#4338ca' },
      secondary: { main: '#059669' },
      background: isDark
        ? { default: '#0f172a', paper: '#1e293b' }
        : { default: '#f1f5f9', paper: '#ffffff' },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({ border: `1px solid ${theme.palette.divider}` }),
        },
      },
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiTextField: { defaultProps: { size: 'small' } },
      MuiAppBar: { defaultProps: { elevation: 0 } },
    },
  })
}
