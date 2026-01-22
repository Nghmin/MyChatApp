import Message from '../models/Message.js';
import User from '../models/User.js';

export const getUsers = async (req, res) => {
    const { currentUserId } = req.query;
    try {
        // 1. Tìm thông tin của chính mình để lấy mảng friends
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) return res.status(404).json({ error: "Không tìm thấy người dùng" });

        // 2. Tìm tất cả User có ID nằm trong danh sách bạn bè
        // Dùng $in để lọc những người là bạn bè
        const friends = await User.find({ _id: { $in: currentUser.friends } });

        // 3. Lặp qua danh sách bạn bè để lấy thông tin tin nhắn cuối và unreadCount
        const friendsWithChatInfo = await Promise.all(friends.map(async (friend) => {
            // Tìm tin nhắn cuối cùng giữa mình và người bạn này
            const lastMessage = await Message.findOne({
                $or: [
                    { sender: currentUserId, receiver: friend._id },
                    { sender: friend._id, receiver: currentUserId }
                ]
            }).sort({ createdAt: -1 }); 

            // Đếm số tin nhắn chưa đọc từ người bạn này gửi cho mình
            const unreadCount = await Message.countDocuments({
                sender: friend._id,
                receiver: currentUserId,
                isRead: false
            });

            return {
                ...friend.toObject(), 
                lastMessage: lastMessage ? {
                    text: lastMessage.text,
                    sender: lastMessage.sender,
                    messageType: lastMessage.messageType, // Thêm cái này để hiển thị [Hình ảnh] nếu cần
                    createdAt: lastMessage.createdAt
                } : null,
                unreadCount: unreadCount
            };
        }));

        // 4. Sắp xếp: Ai có tin nhắn mới nhất thì lên đầu
        friendsWithChatInfo.sort((a, b) => {
            const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return timeB - timeA;
        });

        res.json(friendsWithChatInfo);
    } catch (err) {
        console.error("Lỗi lấy danh sách bạn bè:", err);
        res.status(500).json({ error: "Lỗi DB" });
    }
};