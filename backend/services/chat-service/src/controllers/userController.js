import Message from '../models/Message.js';
import User from '../models/User.js';

export const getUsers = async (req, res) => {
    const { currentUserId } = req.query;
    try {
        const users = await User.find({ _id: { $ne: currentUserId } })
                            .sort({ lastMessageAt: -1 });
        const friendsWithChatInfo = await Promise.all(users.map(async (user) => {
            // Tìm tin nhắn cuối cùng
            const lastMessage = await Message.findOne({
                $or: [
                    { sender: currentUserId, receiver: user._id },
                    { sender: user._id, receiver: currentUserId }
                ]
            }).sort({ createdAt: -1 }); 

            //  Đếm số tin nhắn chưa đọc
            const unreadCount = await Message.countDocuments({
                sender: user._id,
                receiver: currentUserId,
                isRead: false
            });

            return {
                ...user.toObject(), 
                lastMessage: lastMessage ? {
                    text: lastMessage.text,
                    sender: lastMessage.sender,
                    createdAt: lastMessage.createdAt
                } : null,
                unreadCount: unreadCount
            };
        }));
        friendsWithChatInfo.sort((a, b) => {
            const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return timeB - timeA;
        });

        res.json(friendsWithChatInfo);
    } catch (err) {
        console.error("Lỗi lấy danh sách user:", err);
        res.status(500).json({ error: "Lỗi DB" });
    }
};