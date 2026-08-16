import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/react-router') || id.includes('react-router-dom')) return 'vendor-router'
          if (id.includes('/react/') || id.includes('/react-dom/')) return 'vendor-react'
          if (id.includes('/recharts/')) return 'vendor-charts'
          if (id.includes('/lucide-react/')) return 'vendor-icons'
          return undefined
        },
      },
    },
  },
})
