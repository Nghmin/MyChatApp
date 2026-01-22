import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoute from './routes/chatRoute.js';
import userRoute from './routes/userRoute.js';
import { initSocket } from './sockets/chatSocket.js';
import connectDB from './config/mongoDB.js';
dotenv.config();
const app = express();
const httpServer = createServer(app);
app.use(cors());
app.use(express.json());

// Cấu hình Socket.io
const io = new Server(httpServer, {
    cors: { 
        origin: "*",
        methods: ["GET", "POST"]
    },
    allowEIO3: true,
    perMessageDeflate: false,
    transports: ['websocket'],
});
initSocket(io);
connectDB();
// Routes người dùng
app.use('/', userRoute);
// Routes tin nhắn
app.use('/', chatRoute);

const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
    console.log(`>>> Chat Service (Real-time) chạy tại port: ${PORT}`);
});