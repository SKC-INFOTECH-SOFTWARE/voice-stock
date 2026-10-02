import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import StorefrontIcon from '@mui/icons-material/Storefront'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import LogoutIcon from '@mui/icons-material/Logout'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { useHashRoute, navigate } from '../hooks/useHashRoute'
import { useColorMode } from '../theme/ColorModeContext'
import { useAuth } from '../auth/AuthContext'
import InstallButton from '../components/ui/InstallButton'
import Dashboard from './Dashboard'
import ItemsManager from './ItemsManager'
import CompanySettings from './CompanySettings'
import InvoicesList from './InvoicesList'
import InvoiceView from '../components/InvoiceView'

const NAV = [
  { path: '/admin', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/admin/items', label: 'Items', icon: <Inventory2Icon /> },
  { path: '/admin/company', label: 'Company', icon: <StorefrontIcon /> },
  { path: '/admin/invoices', label: 'Invoices', icon: <ReceiptLongIcon /> },
]

export default function AdminApp() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { mode, toggle } = useColorMode()
  const route = useHashRoute()
  const { user, logout } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const invoiceMatch = route.match(/^\/invoice\/(\d+)$/)
  const activeNav = NAV.some((n) => n.path === route) ? route : '/admin'

  function go(path) {
    navigate(path)
    setDrawerOpen(false)
  }

  const modeToggle = (
    <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
      <IconButton color="inherit" onClick={toggle} aria-label="toggle color mode">
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  )

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" sx={{ bgcolor: 'grey.900', displayPrint: 'none' }}>
        <Toolbar sx={{ gap: 1 }}>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)} aria-label="menu">
              <MenuIcon />
            </IconButton>
          )}
          <PointOfSaleIcon />
          <Typography variant="h6" noWrap sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Admin</Typography>

          {!isMobile && (
            <Tabs
              value={activeNav}
              onChange={(_, v) => go(v)}
              textColor="inherit"
              sx={{ ml: 3, flexGrow: 1, '& .MuiTab-root': { color: 'grey.400' }, '& .Mui-selected': { color: '#fff' } }}
            >
              {NAV.map((n) => <Tab key={n.path} value={n.path} label={n.label} />)}
            </Tabs>
          )}
          <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />

          <Button color="inherit" href="#/" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>Billing</Button>
          <InstallButton />
          {modeToggle}
          {!isMobile && <Typography variant="body2" sx={{ color: 'grey.400' }}>{user.username}</Typography>}
          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={logout} aria-label="logout"><LogoutIcon /></IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 240 }} role="presentation">
          <List>
            {NAV.map((n) => (
              <ListItemButton key={n.path} selected={activeNav === n.path} onClick={() => go(n.path)}>
                <ListItemIcon>{n.icon}</ListItemIcon>
                <ListItemText primary={n.label} />
              </ListItemButton>
            ))}
            <ListItemButton onClick={() => { navigate('/'); }}>
              <ListItemIcon><PointOfSaleIcon /></ListItemIcon>
              <ListItemText primary="Billing" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
        {invoiceMatch ? (
          <InvoiceView invoiceId={Number(invoiceMatch[1])} onNewBill={() => navigate('/admin/invoices')} />
        ) : route === '/admin/items' ? (
          <ItemsManager />
        ) : route === '/admin/company' ? (
          <CompanySettings />
        ) : route === '/admin/invoices' ? (
          <InvoicesList />
        ) : (
          <Dashboard />
        )}
      </Container>
    </Box>
  )
}
