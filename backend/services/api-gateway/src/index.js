import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { authProxy, chatProxy , uploadProxy} from './middleware/proxy.js';
import { requestLogger } from './middleware/logger.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();

// Áp dụng Middleware toàn cục
app.use(cors());
app.use(requestLogger);

// Điều hướng Routes
app.use('/api/upload', uploadProxy); 
app.use('/api', chatProxy);
app.use('/auth', authProxy);
app.use('/socket.io', chatProxy);


const server = createServer(app);

// Xử lý Socket Upgrade
server.on('upgrade', (req, socket, head) => {
    if (req.url.startsWith('/socket.io')) {
        chatProxy.upgrade(req, socket, head);
    }
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Gateway Professional is running on port ${PORT}`);
});