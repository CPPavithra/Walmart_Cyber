import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy for fraud detection endpoints
      '/fraud': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      
      // Proxy for bot-trap API endpoints
      '/bot-trap': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/bot-trap/, '')
      },
      
      // Proxy for merkel-logging endpoints
      '/merkel-logging': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/merkel-logging/, '')
      },
      
      // WebSocket proxies
      '/bot-trap/ws-bot': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true
      },
      
      '/merkel-logging/ws-merkel': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true
      }
    },
    historyApiFallback: {
      disableDotRule: true,
      rewrites: [
        { from: /^\/fraud-detection/, to: '/index.html' },
        { from: /^\/bot-trap/, to: '/index.html' },
        { from: /^\/merkel-logging/, to: '/index.html' },
        { from: /^\/$/, to: '/index.html' }  // Handle root path
      ]
    }
  }
});
