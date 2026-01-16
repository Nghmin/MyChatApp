import Message from '../models/Message.js';
import User from '../models/User.js';

export const getMessages = async (req, res) => {
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
};

export const createMessage = async (req, res) => {
    try {
        const { sender, receiver, text, fileUrl, messageType } = req.body;
        const newMessage = new Message({ sender, receiver, text, fileUrl: fileUrl || '', messageType: messageType || 'text' });
        const savedMessage = await newMessage.save();
        await User.updateMany(
            { _id: { $in: [sender, receiver] } },
            { $set: { lastMessageAt: savedMessage.createdAt } }
        );
        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(500).json({ message: "Không thể lưu tin nhắn" });
    }
};

export const markMessagesAsRead = async (req, res) => {
    const { senderId, receiverId } = req.body;
    try {
        await Message.updateMany(
            { sender: senderId, receiver: receiverId, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Không thể cập nhật trạng thái" });
    }
};
