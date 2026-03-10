import Message from '../models/Message.js';
import User from '../models/User.js';
import Group from '../models/Group.js';

export const getUsers = async (req, res) => {
    const { currentUserId } = req.query;
    try {
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) return res.status(404).json({ error: "Không tìm thấy người dùng" });

        // Chuyển danh sách ID bạn bè sang String để so sánh chính xác
        const friendIdsStrings = currentUser.friends.map(id => id.toString());

        // Định nghĩa bộ lọc tin nhắn cá nhân
        const privateMessageFilter = {
            $or: [
                { groupId: { $exists: false } },
                { groupId: null }
            ]
        };

        // Lấy ID của tất cả những người đã từng nhắn tin với mình 
        const distinctChatPartners = await Message.distinct("sender", { 
            receiver: currentUserId, 
            ...privateMessageFilter
        });
        const distinctChatReceivers = await Message.distinct("receiver", { 
            sender: currentUserId, 
            ...privateMessageFilter
        });

        // Kết hợp lấy bạn bè và những người đã từng nhắn tin 
        const allPartnerIds = Array.from(new Set([
            ...friendIdsStrings,
            ...distinctChatPartners.map(id => id.toString()),
            ...distinctChatReceivers.map(id => id.toString())
        ])).filter(id => id !== currentUserId); // Loại bỏ chính mình

        // Lấy thông tin chi tiết và tin nhắn cuối cho từng partner
        const individualChats = await Promise.all(allPartnerIds.map(async (partnerId) => {
            const partner = await User.findById(partnerId).select('username avatar phone gender birthday lastSeen');
            if (!partner) return null;

            // Tìm tin nhắn cuối cùng
            const lastMessage = await Message.findOne({
                $and: [
                    {
                        $or: [
                            { sender: currentUserId, receiver: partnerId },
                            { sender: partnerId, receiver: currentUserId }
                        ]
                    },
                    privateMessageFilter
                ]
            })
            .populate('sender', 'username avatar')
            .sort({ createdAt: -1 });

            const isFriend = friendIdsStrings.includes(partnerId.toString());
            
            // Nếu không phải bạn bè và cũng không có tin nhắn thì bỏ qua 
            if (!isFriend && !lastMessage) return null;

            const unreadCount = await Message.countDocuments({
                sender: partnerId,
                receiver: currentUserId,
                isRead: false,
                ...privateMessageFilter
            });

            return {
                ...partner.toObject(),
                isGroup: false,
                isFriend: isFriend, 
                lastMessage,
                unreadCount
            };
        }));

        const filteredIndividualChats = individualChats.filter(chat => chat !== null);

        // Xử lý chat nhóm 
        const groups = await Group.find({ members: currentUserId })
            .populate('members', 'username avatar');    
        
        const groupsWithChatInfo = await Promise.all(groups.map(async (group) => {
            const lastMsg = await Message.findOne({ groupId: group._id })
                .populate('sender', 'username avatar')
                .sort({ createdAt: -1 });
            
            const unreadCount = await Message.countDocuments({
                groupId: group._id,
                'readBy': { $ne: currentUserId },
                sender: { $ne: currentUserId }
            });

            return {
                _id: group._id,
                username: group.name, 
                avatar: group.avatar,
                isGroup: true,
                admin: group.admin,
                members: group.members,
                lastMessage: lastMsg || group.lastMessage, 
                unreadCount: unreadCount
            };
        }));

        // Gộp kết quả chat cá nhân và nhóm, sắp xếp theo thời gian tin nhắn cuối cùng
        const allConversations = [...filteredIndividualChats, ...groupsWithChatInfo];

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