import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.', // ✅ ensure root is the current directory
  build: {
    outDir: 'dist', // ✅ where the final build goes
  },
})
