import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Root from './Root.jsx'
import { ColorModeProvider } from './theme/ColorModeContext.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ColorModeProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </ColorModeProvider>
  </StrictMode>,
)
