import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to the backend
      '/spark': 'https://oee.onrender.com',  // This should be the URL of your backend API
    },
  },
})
