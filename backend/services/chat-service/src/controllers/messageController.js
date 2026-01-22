import Message from '../models/Message.js';
import User from '../models/User.js';
// Lấy tin nhắn
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
// Tạo tin nhắn mới
export const createMessage = async (req, res) => {
    try {
        const { sender, receiver, text, fileUrl,filePublicId,messageType } = req.body;
        const newMessage = new Message({ sender, receiver, text, fileUrl: fileUrl || '',filePublicId: filePublicId || '', messageType: messageType || 'text' });
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

// Đánh dấu đã đọc
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

// thu hồi
export const recallMessage = async (req, res) => {
    try {
        const { messageId, userId } = req.body; 

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Không tìm thấy tin nhắn" });
        }

        // Kiểm tra xem có đúng là người gửi muốn thu hồi không
        if (message.sender.toString() !== userId) {
            return res.status(403).json({ message: "Bạn không có quyền thu hồi tin nhắn này" });
        }

        if (message.filePublicId) {
            try {
                await cloudinary.uploader.destroy(message.filePublicId);
                console.log("Đã xóa file vật lý trên Cloudinary:", message.filePublicId);
            } catch (cloudErr) {
                console.error("Lỗi xóa file trên Cloud:", cloudErr);
            }
        }
        // Thực hiện "Thu hồi": Giữ lại bản ghi nhưng xóa nội dung nhạy cảm
        message.text = "Tin nhắn đã được thu hồi";
        message.fileUrl = ""; 
        message.filePublicId = "";
        message.messageType = "text"; 
        message.isDeleted = true; 

        await message.save();
        await User.updateMany(
            { _id: { $in: [message.sender, message.receiver] } },
            { $set: { lastMessageText: "Tin nhắn đã được thu hồi" } }
        );
        res.status(200).json(message);
    } catch (error) {
        console.error("Lỗi thu hồi tin nhắn:", error);
        res.status(500).json({ message: "Lỗi server khi thu hồi tin nhắn" });
    }
};