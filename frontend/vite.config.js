import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth':      'http://localhost:5000',
      '/dashboard': 'http://localhost:5000',
      '/notes':     'http://localhost:5000',
      '/quiz':      'http://localhost:5000',
      '/reports':   'http://localhost:5000',
    },
  },
});
