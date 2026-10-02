import { useCallback, useEffect, useState } from 'react'

/**
 * Captures the browser's PWA install prompt so a custom "Install" button can trigger it.
 * - canInstall: a deferred prompt is available (Chrome/Edge/Android)
 * - isInstalled: running as an installed app (standalone) or already installed
 * - promptInstall(): shows the native install dialog
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState(() => getDeferredPrompt())
  const [isInstalled, setIsInstalled] = useState(isStandalone)

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault() // stop the mini-infobar; we trigger it ourselves
      setDeferred(e)
    }
    const onInstallable = () => {
      const prompt = getDeferredPrompt()
      if (prompt) setDeferred(prompt)
    }
    const onInstalled = () => {
      setIsInstalled(true)
      setDeferred(null)
      window.__deferredInstallPrompt = null
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('pwa-installable', onInstallable)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('pwa-installable', onInstallable)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    const prompt = deferred ?? getDeferredPrompt()
    if (!prompt) return false
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    setDeferred(null)
    window.__deferredInstallPrompt = null
    return outcome === 'accepted'
  }, [deferred])

  return { canInstall: !!deferred && !isInstalled, isInstalled, promptInstall }
}

function getDeferredPrompt() {
  return typeof window !== 'undefined' ? window.__deferredInstallPrompt ?? null : null
}

function isStandalone() {
  try {
    return (
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true // iOS Safari
    )
  } catch {
    return false
  }
}