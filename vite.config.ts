import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 1. Naikkan limit peringatan agar tidak muncul tulisan kuning
    chunkSizeWarningLimit: 2000, 
    
    // 2. Gunakan pemisahan chunk yang lebih aman (Format Object)
    rollupOptions: {
      output: {
        manualChunks: {
          // Memisahkan React ekosistem dengan aman
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Memisahkan state management (jika pakai zustand)
          'store-vendor': ['zustand']
        }
      }
    }
  }
})