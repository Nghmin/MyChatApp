import express from 'express';
import {getMessages , createMessage , markMessagesAsRead} from '../controllers/messageController.js';

const chatRouter = express.Router();
// Lấy tin nhắn giữa hai người dùng
chatRouter.get('/messages/:senderId/:receiverId', getMessages);
// Đánh dấu tin nhắn là đã đọc
chatRouter.put('/messages/mark-as-read',markMessagesAsRead);
// Tạo tin nhắn mới
chatRouter.post('/messages',createMessage);
export default chatRouter;