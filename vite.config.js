import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'node:fs'

// Optional HTTPS for dev (needed for microphone/Web Speech on non-localhost devices).
// Uses the mkcert-generated cert if present; falls back to plain HTTP otherwise.
const CERT = '../certs/dev-cert.pem'
const KEY = '../certs/dev-key.pem'
const https = fs.existsSync(CERT) && fs.existsSync(KEY)
  ? { cert: fs.readFileSync(CERT), key: fs.readFileSync(KEY) }
  : undefined

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Make the PWA testable in `npm run dev` too.
      devOptions: { enabled: true },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Voice Billing',
        short_name: 'Billing',
        description: 'Voice & manual input billing for retail counters',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Cache the app shell; never cache API calls (login-gated live data).
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  server: {
    host: true, // expose on the LAN so phones/tablets on the same network can connect
    port: 5173,
    https, // undefined -> HTTP; object -> HTTPS
    // Proxy API calls to XAMPP Apache (plain HTTP) so the phone only ever talks to this
    // one trusted HTTPS origin — no mixed content, no second cert to trust on the device.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, '/software/billingsw/php-backend/api'),
      },
    },
  },
})
