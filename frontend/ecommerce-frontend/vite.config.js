import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // ✅ Split vendor chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'utils': ['axios', 'jwt-decode', 'react-toastify']
        }
      }
    },
    // ✅ Use esbuild minification (faster and no extra dependencies)
    minify: 'esbuild',
    // ✅ Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // ✅ Disable source maps in production for smaller bundles
    sourcemap: false
  },
  // ✅ Optimize dev server
  server: {
    hmr: {
      overlay: true
    }
  }
})
