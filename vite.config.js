import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Mở cửa cho tất cả các thiết bị trong mạng nội bộ
    port: 5173,      // Đảm bảo port này đang dùng
  },
  define: {
    global: 'window',
  },
  resolve: {
    alias: {
      events: 'events',
      stream: 'stream-browserify',
      util: 'util',
    },
  },
})
