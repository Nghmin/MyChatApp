import Group from '../models/Group.js';
import Message from '../models/Message.js';

// Tạo nhóm 
export const createGroup = async (req, res) => {
    try {
        const { name, members, adminId, avatar, avatarPublicId } = req.body;

        const newGroup = new Group({
            name,
            admin: adminId,
            members: [adminId],
            pendingMembers: members.filter(id => id !== adminId),
            avatar: avatar || undefined,
            avatarPublicId: avatarPublicId || null
        });

        const savedGroup = await newGroup.save();

        const firstMessage = new Message({
            groupId: savedGroup._id,
            sender: adminId,
            text: "đã tạo nhóm",
            messageType: "system"
        });
        await firstMessage.save();
        savedGroup.lastMessage = {
            text: "đã tạo nhóm",
            sender: adminId,
            messageType: "system",
            createdAt: new Date()
        };
        await savedGroup.save();

        const populatedGroup = await Group.findById(savedGroup._id)
            .populate('admin', 'username avatar')
            .populate('members', 'username avatar')
            .populate({
                path: 'lastMessage.sender',
                select: 'username avatar'
            });
        return res.status(201).json(populatedGroup);

    } catch (error) {
        console.error("❌ Error Creating Group:", error);
        if (req.body.avatarPublicId) {
            await cloudinary.uploader.destroy(req.body.avatarPublicId);
            console.log("--- Đã dọn dẹp ảnh rác trên Cloudinary do lỗi tạo nhóm");
        }

        res.status(500).json({ error: "Không thể tạo nhóm. Vui lòng thử lại!" });
    }
};

// Thêm thành viên vào nhóm có sẵn 
export const inviteToGroup = async (req, res) => {
    try {
        const { groupId, inviteeIds } = req.body; 

        const group = await Group.findByIdAndUpdate(
            groupId,
            { 
                $addToSet: { pendingMembers: { $each: inviteeIds } } 
            },
            { new: true }
        ).populate('pendingMembers', 'username avatar');

        if (!group) return res.status(404).json({ message: "Không tìm thấy nhóm" });

        res.status(200).json({ 
            message: "Đã gửi lời mời vào nhóm", 
            groupId: group._id,
            groupName: group.name,
            newPendingMembers: inviteeIds 
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi mời thành viên" });
    }
};

// Chập nhân lời mời
export const acceptGroupInvite = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        const group = await Group.findOneAndUpdate(
            { _id: groupId, pendingMembers: userId }, 
            {
                $pull: { pendingMembers: userId },
                $addToSet: { members: userId }
            },
            { new: true }
        ).populate('members', 'username avatar')
         .populate('admin', 'username avatar')
         .populate('pendingMembers', 'username avatar');

        if (!group) return res.status(404).json({ message: "Lời mời không tồn tại hoặc bạn đã tham gia nhóm" });

        const systemMessage = new Message({
            groupId: groupId,
            sender: userId, 
            text: "đã tham gia nhóm",
            messageType: "system" 
        });
        await systemMessage.save();

        group.lastMessage = {
            text: "đã tham gia nhóm",
            sender: userId,
            createdAt: new Date(),
            messageType: "system"
        };
        await group.save();

        const populatedMsg = await Message.findById(systemMessage._id).populate('sender', 'username avatar');

        res.status(200).json({ 
            message: "Tham gia nhóm thành công", 
            group, 
            updatedGroup: group,  
            systemMessage: populatedMsg 
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi tham gia nhóm" });
    }
};

// Từ chối lời mời
export const declineGroupInvite = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    await Group.findByIdAndUpdate(groupId, {
      $pull: { pendingMembers: userId }
    });
    res.status(200).json({ message: "Đã từ chối lời mời vào nhóm" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xử lý" });
  }
};

// Lấy lời mời nhóm chờ xác nhận
export const getPendingGroups = async (req, res) => {
  try {
    const { userId } = req.params;

    const pendingGroups = await Group.find({
      pendingMembers: userId
    })
    .populate('admin', 'username avatar') 
    .sort({ createdAt: -1 });

    res.status(200).json(pendingGroups);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy lời mời nhóm" });
  }
};

// Lấy lời mời nhóm dã gửi
export const getSentGroupInvites = async (req, res) => {
  try {
    const { adminId } = req.params;
    const groups = await Group.find({
      admin: adminId,
      pendingMembers: { $exists: true, $not: { $size: 0 } }
    }).populate('pendingMembers', 'username avatar phone');

    const sentInvites = groups.flatMap(group => 
      group.pendingMembers.map(member => ({
        _id: `${group._id}_${member._id}`, 
        groupId: group._id,
        groupName: group.name,
        receiver: member,
        createdAt: group.updatedAt 
      }))
    );

    res.status(200).json(sentInvites);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách đã mời" });
  }
};