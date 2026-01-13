import { createProxyMiddleware } from 'http-proxy-middleware';
import { services } from '../config/services.js';
import { proxyRequestLogger } from './logger.js';

// Cấu hình Proxy cho Auth
export const authProxy = createProxyMiddleware({
    target: services.authService,
    changeOrigin: true,
    pathRewrite: { '^/auth': '' },
    onProxyReq: proxyRequestLogger,
});

// Cấu hình Proxy cho Chat & Socket
export const chatProxy = createProxyMiddleware({
    target: services.chatService,
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
    ws: true,
    onProxyReq: proxyRequestLogger,
});

// Cấu hình Proxy cho Upload
export const uploadProxy = createProxyMiddleware({
    target: services.uploadService,
    changeOrigin: true,
    pathRewrite: { '^/api/upload': '' },
    onProxyReq: (proxyReq, req, res) => {
        if (req.headers['content-type']) {
            proxyReq.setHeader('content-type', req.headers['content-type']);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
    },
    proxyTimeout: 60000, 
    timeout: 60000,
});