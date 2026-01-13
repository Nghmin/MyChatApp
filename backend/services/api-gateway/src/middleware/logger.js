export const requestLogger = (req, res, next) => {
    console.log(`[Gateway] ${req.method} ${req.url}`);
    next();
};

export const proxyRequestLogger = (proxyReq, req, res) => {
    console.log(`[Proxy] -> Forwarding to: ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
};

export const websocketLogger = (req, socket, head) => {
    console.log(`[WebSocket] Upgrade requested: ${req.url}`);
};