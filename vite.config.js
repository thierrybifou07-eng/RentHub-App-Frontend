import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Garantit une instance unique de React (évite « Cannot read properties
    // of null (reading 'useState') » dû à deux copies du module en dev).
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    // Pré-bundle React d'emblée pour éviter une re-optimisation en pleine
    // session (race optimizeDeps) qui invalidait le module react.js.
    include: ['react', 'react-dom'],
  },
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
