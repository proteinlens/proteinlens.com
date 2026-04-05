import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { vitePrerenderPlugin } from 'vite-prerender-plugin';
import { PUBLIC_ROUTES } from './src/seo/seoConfig';

export default defineConfig({
  plugins: [
    react(),
    // Build-time prerendering for SEO
    // Generates static HTML for all public routes at build time
    ...vitePrerenderPlugin({
      // The element to render into (must match index.html)
      renderTarget: '#root',
      // Entry point for prerendering (exports prerender function)
      prerenderEntry: './src/prerender.tsx',
      // Routes to prerender (from seoConfig.ts)
      additionalPrerenderRoutes: PUBLIC_ROUTES,
    }),
  ],
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
        manualChunks(id) {
          // Core React runtime — changes rarely
          if (id.includes('react-dom') || id.includes('react/') || id.includes('scheduler')) {
            return 'vendor-react';
          }
          // Router — changes rarely
          if (id.includes('react-router')) {
            return 'vendor-router';
          }
          // Animation library — large, rarely changes
          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }
          // Data fetching
          if (id.includes('@tanstack')) {
            return 'vendor-query';
          }
          // Auth (MSAL) — large, rarely changes
          if (id.includes('@azure/msal') || id.includes('msal-')) {
            return 'vendor-auth';
          }
          // Charting (recharts + d3) — only used by History page
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'vendor-charts';
          }
          // Icons — tree-shaken but still sizable
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
          // Image compression — only used on upload
          if (id.includes('browser-image-compression')) {
            return 'vendor-image';
          }
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

