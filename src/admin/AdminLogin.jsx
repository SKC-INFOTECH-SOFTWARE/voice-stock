import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import PersonIcon from '@mui/icons-material/Person'
import LockIcon from '@mui/icons-material/Lock'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import InstallButton from '../components/ui/InstallButton'
import { adminLogin, setToken } from '../api/client'

export default function AdminLogin({ onLoggedIn }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await adminLogin(username.trim(), password)
      setToken(res.token)
      onLoggedIn(res.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="primary" sx={{ displayPrint: 'none' }}>
        <Toolbar sx={{ gap: 1 }}>
          <PointOfSaleIcon sx={{ mr: 0.5 }} />
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Voice Billing
          </Typography>
          <InstallButton />
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, display: 'grid', placeItems: 'center', p: 2 }}>
        <Card component="form" onSubmit={submit} sx={{ width: '100%', maxWidth: 380 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h5" gutterBottom>Admin Login</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Sign in to manage items, company and invoices.
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Username" fullWidth autoFocus value={username} onChange={(e) => setUsername(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" /></InputAdornment> } }}
              />
              <TextField
                label="Password" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment> } }}
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button type="submit" variant="contained" size="large" loading={busy} fullWidth>Sign In</Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
