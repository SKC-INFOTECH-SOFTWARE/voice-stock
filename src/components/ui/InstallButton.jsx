import { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import InstallMobileIcon from '@mui/icons-material/InstallMobile'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'

const isIOS = () => {
  if (typeof navigator === 'undefined') return false
  if (isRunningStandalone()) return false
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return true
  // iPadOS 13+ reports a desktop "Macintosh" user agent; touch points give it away.
  return /macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1
}

function isRunningStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

export default function InstallButton() {
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt()
  const [showIosHelp, setShowIosHelp] = useState(false)

  // Already installed → hide. Otherwise show if the native prompt is ready, or on iOS (manual steps).
  if (isInstalled) return null
  const ios = isIOS()
  if (!canInstall && !ios) return null

  return (
    <>
      <Tooltip title="Install app">
        <IconButton
          color="inherit"
          aria-label="install app"
          onClick={() => (ios ? setShowIosHelp(true) : promptInstall())}
        >
          <InstallMobileIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={showIosHelp} onClose={() => setShowIosHelp(false)}>
        <DialogTitle>Install on iPhone / iPad</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            To add this app to your home screen:
            <ol style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>Tap the <b>Share</b> button in Safari.</li>
              <li>Choose <b>Add to Home Screen</b>.</li>
              <li>Tap <b>Add</b>.</li>
            </ol>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowIosHelp(false)}>Got it</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
