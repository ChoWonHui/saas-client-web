import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 손님(무인증) 테이블 주문 앱. 업체 콘솔(5173)과 포트만 다르고,
// /api 는 동일하게 백엔드(8089)로 프록시한다 — 코드에 호스트가 등장하지 않는다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://localhost:8089',
        changeOrigin: true,
      },
    },
  },
})
