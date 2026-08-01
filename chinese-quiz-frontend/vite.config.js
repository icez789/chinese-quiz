import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      
      // 🌟 เพิ่มบล็อกนี้เข้าไป เพื่อให้ Proxy ยอมให้ Socket.io วิ่งผ่านได้!
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true // ws = WebSocket (เปิดท่อ Real-time)
      }
    }
  }
})