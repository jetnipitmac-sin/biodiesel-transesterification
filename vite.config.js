import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' lets the same build run on localhost and on GitHub Pages (/<repo>/)
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5300, strictPort: true, open: false },
})
