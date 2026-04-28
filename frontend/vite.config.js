import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Cargar variables de entorno para producción
const env = loadEnv('production', process.cwd(), '')

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser'
  },
  server: {
    port: 5173,
    host: true
  },
  // Exponer variables de entorno al código
  define: {
    'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
    'process.env.VITE_SOCKET_URL': JSON.stringify(env.VITE_SOCKET_URL)
  }
})
