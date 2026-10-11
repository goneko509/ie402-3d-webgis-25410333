import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Khi phát triển: /api được chuyển tới API Node.js (npm start trong webgis/api, cổng 3001), không cần CORS.
// Khi triển khai: đặt VITE_API_URL trỏ tới địa chỉ API công khai.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:3001' } },
  build: { chunkSizeWarningLimit: 4000 },
});
