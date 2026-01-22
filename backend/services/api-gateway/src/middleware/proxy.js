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
const handleProxyError = (err, req, res) => {
    console.error('>>> Proxy Error:', err.code);
    if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
    }
    res.end('Bad Gateway: Connection lost or service down.');
};
// Cấu hình Proxy cho Auth
export const authProxy = createProxyMiddleware({
    target: services.authService,
    changeOrigin: true,
    pathRewrite: { '^/auth': '' },
    onProxyReq: handleProxyReq,
    onError: handleProxyError
});

// Cấu hình Proxy cho Chat & Socket
export const chatProxy = createProxyMiddleware({
    target: services.chatService,
    changeOrigin: true,
    pathRewrite: { '^/chat': '' },
    ws: false,
    proxyTimeout: 10000, 
    timeout: 10000,
    onProxyReq: handleProxyReq,
    onError: handleProxyError
});

// Cấu hình Proxy cho Upload
export const uploadProxy = createProxyMiddleware({
    target: services.uploadService,
    changeOrigin: true,
    pathRewrite: { '^/upload': '' },
    onProxyReq: (proxyReq, req, res) => {
        handleProxyReq(proxyReq, req, res);
        if (req.headers['content-type'] && !req.headers['content-type'].includes('multipart/form-data')) {
            proxyReq.setHeader('content-type', req.headers['content-type']);
        }
    },
    onError: handleProxyError,
    proxyTimeout: 60000, 
    timeout: 60000,
});

export const friendProxy = createProxyMiddleware({
    target: services.friendService,
    changeOrigin: true,
    pathRewrite: { '^/friend': '' },
    ws: false,
    onProxyReq: handleProxyReq,
    onError: handleProxyError
});

export const socketProxy = createProxyMiddleware({
    target: services.chatService,
    changeOrigin: true,
    ws: true,
    xfwd: true,
    cookieDomainRewrite: "localhost",
    logger: console,
});

export const handleSocketUpgrade = (req, socket, head) => {
    
};