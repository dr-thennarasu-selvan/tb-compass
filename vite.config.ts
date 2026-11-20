import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// BASE_PATH is set only for the GitHub Pages build (/tb-compass/); local dev stays at /.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.svg'],
      manifest: {
        name: 'TB Compass — clinical decision support',
        short_name: 'TB Compass',
        description:
          'Offline decision support for tuberculosis management, based on WHO consolidated guidelines.',
        theme_color: '#0f766e',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        navigateFallback: 'index.html',
        // The resistance explorer is its own page, not a route inside the React app.
        navigateFallbackDenylist: [/\/explorer\//],
      },
    }),
  ],
})
