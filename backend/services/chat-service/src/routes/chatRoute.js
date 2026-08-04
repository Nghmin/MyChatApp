import express from 'express';
import {getMessages , createMessage , markMessagesAsRead , recallMessage , saveCallLog} from '../controllers/messageController.js';

const chatRouter = express.Router();
// Lấy tin nhắn giữa hai người dùng
chatRouter.get('/messages/:senderId/:receiverId', getMessages);
// Đánh dấu tin nhắn là đã đọc
chatRouter.put('/messages/mark-as-read',markMessagesAsRead);
// Đánh dấu tin nhắn nhóm là đã đọc
chatRouter.put('/messages/mark-group-as-read',markMessagesAsRead);
// Tạo tin nhắn mới
chatRouter.post('/messages',createMessage);
// Thu hồi tin nhắn
chatRouter.put('/messages/recall', recallMessage);
// Lưu log cuộc gọi
chatRouter.post('/messages/call-log', saveCallLog);
export default chatRouter;