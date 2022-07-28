import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import GlobalPolyFill from '@esbuild-plugins/node-globals-polyfill'

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
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        GlobalPolyFill({
          process: true,
          buffer: true,
        }),
      ],
    },
  },
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      zlib: 'browserify-zlib',
      util: 'util',
      '~/': `${__dirname}/src/`,
    },
  },
})
