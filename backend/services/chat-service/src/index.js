    import express from 'express';
    import { createServer } from 'http';
    import { Server } from 'socket.io';
    import mongoose from 'mongoose';
    import cors from 'cors';
    import dotenv from 'dotenv';
    import Message from './models/Message.js';
    import User from './models/User.js';

    dotenv.config();
    const app = express();
    const httpServer = createServer(app);
    app.use(cors());
    app.use(express.json());

    // Cấu hình Socket.io tại đây
    const io = new Server(httpServer, {
        cors: { 
            origin: "*" ,
            methods: ["GET", "POST"]
        } 
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('join_chat', ({ myId, friendId }) => {
            const roomId = [myId, friendId].sort().join('_');
            socket.join(roomId);
            console.log(`User ${myId} joined room: ${roomId}`);
        });

        socket.on('send_message', (savedMsg) => {
        const roomId = [savedMsg.sender, savedMsg.receiver].sort().join('_');
    
        socket.to(roomId).emit('receive_message', savedMsg);
    });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
    // API lấy danh sách User để hiện bên cột trái
    app.get('/users', async (req, res) => {
        const { currentUserId } = req.query; // Lấy từ ?currentUserId=...
        try {
            // Tìm tất cả user ngoại trừ chính mình
            const users = await User.find({ _id: { $ne: currentUserId } }); 
            res.json(users);
        } catch (err) {
            res.status(500).json({ error: "Lỗi DB" });
        }
    });

    // API lấy lịch sử tin nhắn giữa 2 người
    app.get('/messages/:senderId/:receiverId', async (req, res) => {
        try {
            const { senderId, receiverId } = req.params;
            const messages = await Message.find({
                $or: [
                    { sender: senderId, receiver: receiverId },
                    { sender: receiverId, receiver: senderId }
                ]
            }).sort({ createdAt: 1 });
            res.json(messages || []);
        } catch (error) {
            res.status(500).json({ message: "Lỗi lấy tin nhắn" });
        }
    });

    app.post('/messages', async (req, res) => {
        try {
            const { sender, receiver, text, fileUrl, messageType } = req.body;

            // Tạo bản ghi tin nhắn mới
            const newMessage = new Message({
                sender,
                receiver,
                text,
                fileUrl: fileUrl || '', 
                messageType: messageType || 'text',
            });

            // Lưu vào MongoDB
            const savedMessage = await newMessage.save();

            // Trả về tin nhắn vừa lưu (để Frontend dùng làm dữ liệu bắn Socket)
            res.status(201).json(savedMessage);
        } catch (error) {
            console.error("Lỗi khi lưu tin nhắn:", error);
            res.status(500).json({ message: "Không thể lưu tin nhắn" });
        }
    });
    const PORT = process.env.PORT;
    mongoose.connect(process.env.MONGO_URI_CHAT).then(() => {
    httpServer.listen(PORT, () => {
        console.log(`>>> Chat Service (Real-time) chạy tại port: ${PORT}`);
    });
    });