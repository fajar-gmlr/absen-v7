import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Memisahkan library dari node_modules ke chunk tersendiri
          if (id.includes('node_modules')) {
            // Pisahkan Firebase karena ukurannya lumayan besar
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            // Pisahkan ekosistem React (React, DOM, Router)
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Sisa library lainnya dijadikan satu di 'vendor'
            return 'vendor';
          }
        }
      }
    },
    // Opsional: Naikkan sedikit batas limit peringatan menjadi 1MB (1000kB)
    // agar lebih aman jika kedepannya ada penambahan fitur
    chunkSizeWarningLimit: 1000, 
  }
})