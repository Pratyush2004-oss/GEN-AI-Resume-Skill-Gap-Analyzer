import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // in development forward api calls to localhost:3000/api
    proxy: {
      '/api': "http://localhost:3000"
    }
  }
})
