import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true, // Open browser on server start
    host: true, // Listen on all addresses
    strictPort: false, // Try another port if 3000 is in use
    proxy: {
      // Proxy API requests to the backend during development
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  optimizeDeps: {
    include: ['lucide-react'],
    exclude: ['lucide-react/dist/esm/icons/fingerprint.js']
  },
  // Improved error overlay
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom', '@reduxjs/toolkit', 'react-redux'],
          'ui': ['lucide-react'],
        }
      }
    }
  }
});