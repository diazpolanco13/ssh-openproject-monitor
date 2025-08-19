import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // Permite localhost y 0.0.0.0
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
