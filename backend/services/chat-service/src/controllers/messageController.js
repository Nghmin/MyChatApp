import Message from '../models/Message.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
import cloudinary from '../config/cloudinary.js';

export const getMessages = async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;
        const { isGroup, limit = 20, skip = 0 } = req.query;

        let query;
        if (isGroup === 'true') {
            query = { groupId: receiverId };
        } else {
            query = {
                $and: [
                    {
                        $or: [
                            { sender: senderId, receiver: receiverId },
                            { sender: receiverId, receiver: senderId }
                        ]
                    },
                    {
                        $or: [
                            { groupId: { $exists: false } },
                            { groupId: null }
                        ]
                    }
                ]
            };
        }

        const messages = await Message.find(query)
            .populate('sender', 'username avatar')
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        if (isGroup === 'true' && senderId) {
            await Message.updateMany(
                { groupId: receiverId, readBy: { $ne: senderId }, sender: { $ne: senderId } },
                { $addToSet: { readBy: senderId } }
            );
        }
        res.json(messages || []);
    } catch (error) {
        console.error("Lỗi lấy tin nhắn:", error);
        res.status(500).json({ message: "Lỗi lấy tin nhắn" });
    }
};

export const createMessage = async (req, res) => {
    try {
        const { sender, receiver, text, fileUrl, filePublicId, messageType, groupId } = req.body;
        const senderId = sender._id || sender;
        const receiverId = receiver?._id || receiver;

        const newMessage = new Message({
            sender: senderId,
            receiver: groupId ? null : receiverId,
            groupId: groupId || null,
            text,
            readBy: [senderId],
            fileUrl: fileUrl || '',
            filePublicId: filePublicId || '',
            messageType: messageType || 'text'
        });

        let savedMessage = await newMessage.save();
        // Populate để lấy username/avatar của người gửi
        savedMessage = await Message.findById(savedMessage._id).populate('sender', 'username avatar');

        // Tạo object lastMessage ĐẦY ĐỦ để lưu vào User/Group
        const lastMsgData = {
            _id: savedMessage._id,
            text: text || (messageType === 'image' ? '[Hình ảnh]' : '[Tệp tin]'),
            sender: {
                _id: savedMessage.sender._id,
                username: savedMessage.sender.username,
                avatar: savedMessage.sender.avatar
            },
            createdAt: savedMessage.createdAt,
            messageType: messageType || 'text',
            isDeleted: false
        };

        if (groupId) {
            await Group.findByIdAndUpdate(groupId, {
                $set: { lastMessage: lastMsgData }
            });
        } else {
            // Cập nhật lastMessage cho cả 2 user (CỰC KỲ QUAN TRỌNG để khi F5 không bị mất tin nhắn cuối)
            await User.updateMany(
                { _id: { $in: [senderId, receiverId] } },
                {
                    $set: {
                        lastMessage: lastMsgData,
                        lastMessageAt: savedMessage.createdAt
                    }
                }
            );
        }

        res.status(201).json(savedMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Không thể lưu tin nhắn" });
    }
};

export const markMessagesAsRead = async (req, res) => {
    const { senderId, receiverId, groupId, userId } = req.body;
    try {
        if (groupId) {
            await Message.updateMany(
                {
                    groupId: groupId,
                    sender: { $ne: userId },
                    readBy: { $ne: userId }
                },
                { $addToSet: { readBy: userId } }
            );
        } else {
            await Message.updateMany(
                { sender: senderId, receiver: receiverId, isRead: false },
                { $set: { isRead: true } }
            );
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Không thể cập nhật trạng thái" });
    }
};

export const recallMessage = async (req, res) => {
    try {
        const { messageId, userId } = req.body;
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Không tìm thấy tin nhắn" });
        }

        if (message.sender.toString() !== userId) {
            return res.status(403).json({ message: "Bạn không có quyền thu hồi tin nhắn này" });
        }

        if (message.filePublicId) {
            try {
                const resType = message.messageType === 'video' ? 'video' : 'image';
                await cloudinary.uploader.destroy(message.filePublicId, { resource_type: resType });
            } catch (cloudErr) {
                console.error("Lỗi xóa file trên Cloud:", cloudErr);
            }
        }

        message.text = "Tin nhắn đã được thu hồi";
        message.fileUrl = "";
        message.filePublicId = "";
        message.messageType = "text";
        message.isDeleted = true;
        await message.save();

        const lastMsgInDb = await Message.findOne({
            $or: [
                { sender: message.sender, receiver: message.receiver },
                { sender: message.receiver, receiver: message.sender },
                { groupId: message.groupId }
            ]
        }).populate('sender', 'username avatar').sort({ createdAt: -1 });

        if (lastMsgInDb && lastMsgInDb._id.toString() === message._id.toString()) {
            const updatedLastMsg = {
                _id: lastMsgInDb._id,
                text: "Tin nhắn đã được thu hồi",
                sender: {
                    _id: lastMsgInDb.sender._id,
                    username: lastMsgInDb.sender.username,
                    avatar: lastMsgInDb.sender.avatar
                },
                createdAt: lastMsgInDb.createdAt,
                isDeleted: true,
                messageType: "text"
            };

            if (message.groupId) {
                await Group.findByIdAndUpdate(message.groupId, {
                    $set: { lastMessage: updatedLastMsg }
                });
            } else {
                await User.updateMany(
                    { _id: { $in: [message.sender, message.receiver] } },
                    {
                        $set: {
                            lastMessage: updatedLastMsg,
                            lastMessageAt: message.createdAt
                        }
                    }
                );
            }
        }
        res.status(200).json(message);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi thu hồi tin nhắn" });
    }
};