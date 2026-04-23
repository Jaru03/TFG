import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: ['divisionary-lucilla-shortly.ngrok-free.app', 'divisionary-lucilla-shortly.ngrok-free.dev'],
    proxy: {
      '/api':     { target: 'http://localhost:3000', changeOrigin: true, xfwd: true },
      '/auth':    { target: 'http://localhost:3000', changeOrigin: true, xfwd: true },
      '/uploads': { target: 'http://localhost:3000', changeOrigin: true, xfwd: true },
    }
  }
});
