import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  root: 'src/public',
  build: {
    outDir: '../../dist/compiled/src',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src/public")
    }
  },
  esbuild:
  {
    keepNames: true
  }
})
