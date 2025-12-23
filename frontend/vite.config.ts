import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:7071',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Output directory for Static Web Apps deployment
    outDir: 'dist',
    
    // Enable source maps for debugging (constitutional requirement)
    sourcemap: true,
    
    // Tree-shaking: remove unused code (constitution IX requirement)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production', // Remove console in prod
      },
    },
    
    // CSS bundling and minification (included by default)
    cssMinify: true,
    
    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Split vendor code for better caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // shadcn chunk removed - radix-ui dependencies not yet installed
        },
      },
    },
    
    // Increase chunk size threshold (some dependencies are large)
    chunkSizeWarningLimit: 600,
    
    // Module preload: optimize initial load time
    modulePreload: {
      polyfill: true,
    },
    
    // Report compressed size
    reportCompressedSize: true,
  },
  
  // Environment variable prefix (default is VITE_)
  // This allows VITE_API_URL to be injected at build time
  envPrefix: 'VITE_',
});

