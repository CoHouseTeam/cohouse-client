import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            // 🔄 로컬에서 /api → 백엔드로 프록시
            '/api': {
                target: 'http://52.79.237.86:8080',
                changeOrigin: true,
                rewrite: function (path) {
                    var newPath = path.replace(/^\/api/, '');
                    console.log("[VITE PROXY] ".concat(path, " -> ").concat(newPath));
                    return newPath;
                },
                configure: function (proxy) {
                    proxy.on('error', function (err) {
                        console.log('❌ [VITE PROXY ERROR]', err.message);
                    });
                    proxy.on('proxyReq', function (_proxyReq, req) {
                        console.log('➡️ [VITE PROXY REQ]', req.method, req.url);
                    });
                    proxy.on('proxyRes', function (proxyRes, req) {
                        console.log('⬅️ [VITE PROXY RES]', proxyRes.statusCode, req.url);
                    });
                },
            },
        },
    },
    build: {
        outDir: 'dist',
    },
});
