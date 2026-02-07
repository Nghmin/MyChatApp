import Message from '../models/Message.js';
import User from '../models/User.js';
import Group from '../models/Group.js';

export const getUsers = async (req, res) => {
    const { currentUserId } = req.query;
    try {
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) return res.status(404).json({ error: "Không tìm thấy người dùng" });

        // Lấy danh sách bạn bè 
        const friends = await User.find({ _id: { $in: currentUser.friends }});
        const friendsWithChatInfo = await Promise.all(friends.map(async (friend) => {
            const lastMessage = await Message.findOne({
                $and: [
                    {
                        $or: [
                            { sender: currentUserId, receiver: friend._id },
                            { sender: friend._id, receiver: currentUserId }
                        ]
                    },
                    {
                        $or: [
                            { groupId: { $exists: false } },
                            { groupId: null }
                        ]
                    }
                ]
            })
            .populate('sender', 'username avatar') // Thêm dòng này để lấy thông tin người gửi
            .sort({ createdAt: -1 });

            const unreadCount = await Message.countDocuments({
                sender: friend._id,
                receiver: currentUserId,
                isRead: false
            });

            return {
                ...friend.toObject(),
                isGroup: false,
                lastMessage,
                unreadCount
            };
        }));

        // Lấy danh sách nhóm
        const groups = await Group.find({ members: currentUserId })
            .populate('members', 'username avatar');    
        const groupsWithChatInfo = await Promise.all(groups.map(async (group) => {
            const lastMsg = await Message.findOne({ groupId: group._id })
                .populate('sender', 'username avatar') // Thêm populate ở đây để lấy tên người gửi trong nhóm
                .sort({ createdAt: -1 });
            const unreadCount = await Message.countDocuments({
                groupId: group._id,
                sender: { $ne: currentUserId },
                'readBy': { $ne: currentUserId } 
            });
            return {
                _id: group._id,
                username: group.name, 
                avatar: group.avatar,
                isGroup: true,
                admin: group.admin,
                members: group.members,
                membersDetails: group.members,
                lastMessage: lastMsg || group.lastMessage, 
                unreadCount: unreadCount
            };
        }));

        // Gộp và Sắp xếp
        const allConversations = [...friendsWithChatInfo, ...groupsWithChatInfo];

        allConversations.sort((a, b) => {
            const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return timeB - timeA;
        });

        res.json(allConversations);
    } catch (err) {
        console.error("Lỗi lấy danh sách hội thoại:", err);
        res.status(500).json({ error: "Lỗi DB" });
    }
};