import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://localhost:7057',
        changeOrigin: true,
        secure: false,
      },
      '/Logos': {
        target: 'https://localhost:7057',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
