import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',     // Forzar IPv4 en todas las interfaces
    port: 3000,          
    strictPort: true,    
    open: false,         
    cors: true,          // Habilitar CORS
    allowedHosts: 'all'  // Permitir todos los hosts
  },
  preview: {
    host: true,
    port: 4173
  }
})
