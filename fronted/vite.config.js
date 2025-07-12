import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    // 开发服务器配置
    server: {
        host: '0.0.0.0',
        port: 3000,
        // 代理配置
        proxy: {
            '/api': {
                target: 'https://1aa43f9b548f.ngrok-free.app',
                changeOrigin: true,
                rewrite: (path) => path
            }
        }
    },
    // 环境变量配置
    define: {
        'process.env': {
            VITE_API_BASE_URL: JSON.stringify('https://1aa43f9b548f.ngrok-free.app')
        }
    }
}) 