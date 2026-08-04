import express from 'express';
import cors from 'cors';
import { verifyToken } from './middleware/auth.js';
import { createServer } from 'http';
import { authProxy, chatProxy , uploadProxy , friendProxy , socketProxy} from './middleware/proxy.js';
import { requestLogger , websocketLogger } from './middleware/logger.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const server = createServer(app);

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser());
// Routes with Proxy
app.use('/socket.io', socketProxy);
app.use(requestLogger);
app.use('/chat', verifyToken, chatProxy);
app.use('/upload', verifyToken, uploadProxy); 
app.use('/auth', authProxy);
app.use('/auth/update-profile', verifyToken, authProxy);
app.use('/friend', verifyToken, friendProxy);

// WebSocket upgrade handling
// server.on('upgrade', (req, socket, head) => {
//     if (req.url.startsWith('/socket.io')) {
//         chatProxy.upgrade(req, socket, head);
//     }
// });

const PORT = process.env.PORT;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Gateway Professional is running on port ${PORT}`);
});