import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Permite acceso desde WSL
    proxy: {
      '/api': {
        target: 'http://localhost:80', // Tu backend Laravel
        changeOrigin: true,
        secure: false,
      }
    }
  }
})