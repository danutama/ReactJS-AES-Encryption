import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['upload-icon.png'],
      manifest: {
        name: 'React AES Encryption',
        short_name: 'AES App',
        description: 'Securely encrypt and decrypt your files with AES algorithm.',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/upload-icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/upload-icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      injectManifest: {
        swSrc: 'src/service-worker.js',
        swDest: 'service-worker.js',
      },
    })
  ]
});
