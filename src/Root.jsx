import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useHashRoute } from './hooks/useHashRoute'
import { useAuth } from './auth/AuthContext'
import App from './App'
import AdminApp from './admin/AdminApp'
import AdminLogin from './admin/AdminLogin'

// Entire app is behind login. Unauthenticated -> login screen; then route by hash.
export default function Root() {
  const route = useHashRoute()
  const { user, checking, setUser } = useAuth()

  if (checking) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) return <AdminLogin onLoggedIn={setUser} />

  const isAdmin = route.startsWith('/admin') || /^\/invoice\/\d+$/.test(route)
  return isAdmin ? <AdminApp /> : <App />
}
