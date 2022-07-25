import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/genius.com': {
        target: 'https://genius.com',
        rewrite(urlPath) {
          return urlPath.replace(/^\/genius.com/, '')
        },
        changeOrigin: true,
        followRedirects: true,
      },
    },
  },
  plugins: [react()],
})
