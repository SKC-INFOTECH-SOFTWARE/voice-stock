import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { useColorMode } from '../../theme/ColorModeContext'
import InstallButton from './InstallButton'

/**
 * Shared app chrome: AppBar with brand + dark-mode toggle + optional action slot,
 * and a responsive Container body. Hidden from print.
 */
export default function AppShell({ title, icon, actions, maxWidth = 'md', children }) {
  const { mode, toggle } = useColorMode()

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="primary" sx={{ displayPrint: 'none' }}>
        <Toolbar sx={{ gap: 1 }}>
          {icon}
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            {title}
          </Typography>
          {actions}
          <InstallButton />
          <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton color="inherit" onClick={toggle} edge="end" aria-label="toggle color mode">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth={maxWidth} sx={{ py: { xs: 2, sm: 3 } }}>
        {children}
      </Container>
    </Box>
  )
}
