import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Import manquant
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(), // Plugin React initialisé
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'PharmaGo',
        short_name: 'PharmaGo',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0277bd',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
});