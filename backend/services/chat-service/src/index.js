import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { initSocket } from './sockets/chatSocket.js';
import connectDB from './config/mongoDB.js';
dotenv.config();
const app = express();
const httpServer = createServer(app);
app.use(cors());
app.use(express.json());
connectDB();
// Cấu hình Socket.io
const io = new Server(httpServer, {
    cors: { 
        origin: "*" ,
        methods: ["GET", "POST"]
    } 
});

// Routes người dùng
app.use('/', userRoutes);
// Routes tin nhắn
app.use('/', chatRoutes);
initSocket(io);
const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
    console.log(`>>> Chat Service (Real-time) chạy tại port: ${PORT}`);
});