import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('chart.js') || id.includes('react-chartjs-2') || id.includes('recharts') || id.includes('react-organizational-chart')) {
              return 'vendor-charts'
            }
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'vendor-pdf'
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
})