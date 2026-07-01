import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Redirect all 404s to index.html so React Router handles /gestion
  server: {
    historyApiFallback: true,
  },
})
