import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'editor-vendor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-text-align', '@tiptap/extension-underline', '@tiptap/extension-color', '@tiptap/extension-text-style', '@tiptap/extension-highlight', '@tiptap/extension-link'],
          'animation-vendor': ['framer-motion'],
          'icon-vendor': ['lucide-react']
        }
      }
    }
  }
})
