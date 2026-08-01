import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 🌟 บอก Vite ว่า: ถ้ามีใครเรียก API ที่ขึ้นต้นด้วย /api ให้โยนไปหา Backend ที่พอร์ต 5000 นะ!
      '/api': 'http://localhost:5000'
    }
  }
})