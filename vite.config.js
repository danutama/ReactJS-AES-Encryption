import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: 'React AES Encryption',
        short_name: 'AES App',
        description: 'Securely encrypt and decrypt your files with AES algorithm.',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/upload-icon192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/upload-icon.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
