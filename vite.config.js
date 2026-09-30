import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true, // доступно по LAN
    port: 3000,
    strictPort: true,
  },
})
