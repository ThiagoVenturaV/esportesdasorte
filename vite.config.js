import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Allows imports like: import X from '@/components/...'
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api-v2': {
        target: 'https://esportesdasorte.bet.br',
        changeOrigin: true,
        secure: false,
      },
      '/api-generic': {
        target: 'https://esportesdasorte.bet.br',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'https://esportesdasorte.bet.br',
        changeOrigin: true,
        secure: false,
      },
      '/bragi': {
        target: 'https://bragi.sportingtech.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/bragi/, ''),
      },
      '/betano-api': {
        target: 'https://www.betano.bet.br',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/betano-api/, ''),
      },
    },
  },
});
