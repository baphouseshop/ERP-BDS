import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  server: {
    host: true,  // Expose on LAN for mobile access
    port: 5173,
  },
  preview: {
    host: true,  // Also expose production preview on LAN
    port: 4173,
  },
})
