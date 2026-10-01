import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The admin panel is its own app. It is served by the backend at /admin (same origin as
// /api/admin, which its SameSite=Strict cookies need), so the build goes into BACKEND/admin-ui.
// In development, `npm run dev` proxies /api to the local backend (http://localhost:5000).
export default defineConfig({
  base: '/admin/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: fileURLToPath(new URL('../BACKEND/admin-ui', import.meta.url)),
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    port: 5174,
    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: false } },
  },
})
