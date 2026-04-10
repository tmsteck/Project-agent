import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Use relative asset paths so deploys work at root or subpath.
  base: '/Project-agent/',
})
