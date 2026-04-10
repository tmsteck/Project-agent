import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // App is deployed at https://thomassteckmann.com/Project-agent/
  base: '/Project-agent/',
})
