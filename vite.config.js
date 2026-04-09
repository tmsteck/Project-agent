import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // If deploying to a subdirectory like username.github.io/research-os,
  // set base to '/research-os/'. For a custom domain root, use '/'.
  base: '/',
})
