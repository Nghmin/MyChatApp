import { createProxyMiddleware } from 'http-proxy-middleware';
import { services } from '../config/services.js';
import { proxyRequestLogger } from './logger.js';

const handleProxyReq = (proxyReq, req, res) => {
    // Check xác thực
    if (req.user && req.user.userId) {
        proxyReq.setHeader('x-user-id', req.user.userId);
    }
    proxyRequestLogger(proxyReq, req, res);
};
// Cấu hình Proxy cho Auth
export const authProxy = createProxyMiddleware({
    target: services.authService,
    changeOrigin: true,
    pathRewrite: { '^/auth': '' },
    onProxyReq: handleProxyReq,
});

// Cấu hình Proxy cho Chat & Socket
export const chatProxy = createProxyMiddleware({
    target: services.chatService,
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
    ws: true,
    onProxyReq: handleProxyReq,
});

// Cấu hình Proxy cho Upload
export const uploadProxy = createProxyMiddleware({
    target: services.uploadService,
    changeOrigin: true,
    pathRewrite: { '^/api/upload': '' },
    onProxyReq: (proxyReq, req, res) => {
        handleProxyReq(proxyReq, req, res);
        if (req.headers['content-type'] && !req.headers['content-type'].includes('multipart/form-data')) {
            proxyReq.setHeader('content-type', req.headers['content-type']);
        }
    },
    proxyTimeout: 60000, 
    timeout: 60000,
});