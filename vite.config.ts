// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: '.', // ← 이 폴더가 앱의 루트임을 명시
  base: '/', // ← 서브경로 배포가 아니라면 루트
  publicDir: 'public', // ← public 정적 폴더 경로 명시
  plugins: [react()],
  css: { modules: false },
  server: {
    port: 3000,
    strictPort: true, // ← 3000 못 쓰면 에러로 실패(다른 포트로 못 바뀌게)
    proxy: {
      '/api': {
        target: 'http://52.79.237.86:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => console.log('❌ [VITE PROXY ERROR]', err.message))
          proxy.on('proxyReq', (_proxyReq, req) =>
            console.log('➡️ [VITE PROXY REQ]', req.method, req.url)
          )
          proxy.on('proxyRes', (proxyRes, req) =>
            console.log('⬅️ [VITE PROXY RES]', proxyRes.statusCode, req.url)
          )
        },
      },
    },
  },
  build: { outDir: 'dist' },
})
