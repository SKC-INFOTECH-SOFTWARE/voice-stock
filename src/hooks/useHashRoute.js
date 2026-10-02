import { useEffect, useState } from 'react'

/** Minimal hash router: returns the current path after '#', e.g. '/admin/items'. */
export function useHashRoute() {
  const [route, setRoute] = useState(() => currentHash())

  useEffect(() => {
    const onChange = () => setRoute(currentHash())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}

export function navigate(path) {
  window.location.hash = path
}

function currentHash() {
  const h = window.location.hash.replace(/^#/, '')
  return h || '/'
}
