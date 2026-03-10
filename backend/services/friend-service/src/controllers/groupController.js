import Group from '../models/Group.js';
import Message from '../models/Message.js';
import cloudinary from '../config/cloudinary.js';
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
        console.error("Error Creating Group:", error);
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
        const { groupId, inviteeIds, inviterId } = req.body; 

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Không tìm thấy nhóm" });

        // Check người mời 
        if (group.admin.toString() !== inviterId.toString()) {
            return res.status(403).json({ message: "Chỉ admin mới có thể thêm thành viên vào nhóm" });
        }

        // Check xem có ai trong inviteeIds đã là member hoặc pending rồi
        const alreadyMembers = inviteeIds.filter(id => 
            group.members.some(m => m.toString() === id.toString())
        );
        const alreadyPending = inviteeIds.filter(id => 
            group.pendingMembers.some(m => m.toString() === id.toString())
        );

        if (alreadyMembers.length > 0) {
            return res.status(400).json({ message: "Một số người đã là thành viên của nhóm này rồi" });
        }

        if (alreadyPending.length > 0) {
            return res.status(400).json({ message: "Bạn đã gửi lời mời cho người này rồi" });
        }

        // Add invitees vào pendingMembers
        const updatedGroup = await Group.findByIdAndUpdate(
            groupId,
            { 
                $addToSet: { 
                    pendingMembers: { $each: inviteeIds },
                    // Lưu lịch sử ai gửi lời mời cho ai
                    sentInvitations: {
                        $each: inviteeIds.map(inviteeId => ({
                            inviter: inviterId,
                            invitee: inviteeId,
                            createdAt: new Date()
                        }))
                    }
                }
            },
            { new: true }
        ).populate('pendingMembers', 'username avatar');

        res.status(200).json({ 
            message: "Đã gửi lời mời vào nhóm", 
            groupId: updatedGroup._id,
            groupName: updatedGroup.name,
            newPendingMembers: inviteeIds 
        });
    } catch (error) {
        console.error("Error inviting to group:", error);
        res.status(500).json({ message: "Lỗi khi mời thành viên" });
    }
};

// Chập nhân lời mời
export const acceptGroupInvite = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        
        // Kiểm tra xem user đã là member chưa
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Nhóm không tồn tại" });
        
        const isMember = group.members.some(memberId => memberId.toString() === userId.toString());
        if (isMember) {
            return res.status(400).json({ message: "Bạn đã là thành viên của nhóm này rồi!" });
        }
        
        // Check xem user có trong pending list không
        const isPending = group.pendingMembers.some(memberId => memberId.toString() === userId.toString());
        if (!isPending) {
            return res.status(400).json({ message: "Lời mời không tồn tại hoặc đã hết hạn" });
        }

        // Accept lời mời
        const updatedGroup = await Group.findOneAndUpdate(
            { _id: groupId, pendingMembers: userId }, 
            {
                $pull: { 
                    pendingMembers: userId,
                    sentInvitations: { invitee: userId }
                },
                $addToSet: { members: userId }
            },
            { new: true }
        ).populate('members', 'username avatar')
         .populate('admin', 'username avatar')
         .populate('pendingMembers', 'username avatar');

        const systemMessage = new Message({
            groupId: groupId,
            sender: userId, 
            text: "đã tham gia nhóm",
            messageType: "system" 
        });
        await systemMessage.save();

        updatedGroup.lastMessage = {
            text: "đã tham gia nhóm",
            sender: userId,
            createdAt: new Date(),
            messageType: "system"
        };
        await updatedGroup.save();

        const populatedMsg = await Message.findById(systemMessage._id).populate('sender', 'username avatar');

        res.status(200).json({ 
            message: "Tham gia nhóm thành công", 
            group: updatedGroup, 
            updatedGroup: updatedGroup,  
            systemMessage: populatedMsg 
        });
    } catch (error) {
        console.error("Error accepting group invite:", error);
        res.status(500).json({ message: "Lỗi tham gia nhóm" });
    }
};

// Từ chối lời mời
export const declineGroupInvite = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    // Xóa user khỏi pendingMembers 
    await Group.findByIdAndUpdate(groupId, {
      $pull: { 
        pendingMembers: userId,
        sentInvitations: { invitee: userId }
      }
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
    console.log("Fetching pending groups for user:", userId);

    const pendingGroups = await Group.find({
      pendingMembers: userId
    })
    .populate('admin', 'username avatar') 
    .sort({ createdAt: -1 })
    .maxTimeMS(5000); // Timeout 5s nếu query quá lâu

    // Thêm field isMember để check xem user đã là member hay chưa
    const groupsWithStatus = pendingGroups.map(group => {
      const groupObj = group.toObject ? group.toObject() : group;
      return {
        ...groupObj,
        isMember: (groupObj.members || []).some(memberId => memberId.toString() === userId.toString())
      };
    });

    console.log(`Found ${groupsWithStatus.length} pending groups for user ${userId}`);
    res.status(200).json(groupsWithStatus);
  } catch (error) {
    console.error("Error getting pending groups:", error.message);
    res.status(500).json({ message: "Lỗi lấy lời mời nhóm" });
  }
};

// Lấy lời mời nhóm dã gửi (cho TẤT CẢ user, bất kể admin hay không)
export const getSentGroupInvitesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching sent invitations by user:", userId);
    
    // Query tất cả groups có lời mời được gửi bởi userId này
    const groups = await Group.find({
      'sentInvitations.inviter': userId,
      pendingMembers: { $exists: true, $not: { $size: 0 } }
    })
    .populate({
      path: 'sentInvitations.inviter',
      select: 'username avatar'
    })
    .populate({
      path: 'sentInvitations.invitee',
      select: 'username avatar phone'
    })
    .populate('members', 'username avatar phone')
    .maxTimeMS(5000);

    // Filter invitations được gửi bởi userId này
    const sentInvites = groups.flatMap(group => 
      group.sentInvitations
        .filter(inv => inv.inviter._id.toString() === userId.toString())
        .map(inv => ({
          _id: `${group._id}_${inv.invitee._id}`,
          groupId: group._id,
          groupName: group.name,
          receiver: inv.invitee,
          createdAt: inv.createdAt,
          // Check xem receiver đã là member (accept lời mời) hay chưa
          isMember: group.members.some(m => m._id.toString() === inv.invitee._id.toString()),
          isPending: group.pendingMembers.some(m => m._id.toString() === inv.invitee._id.toString())
        }))
    );

    console.log(`Found ${sentInvites.length} sent invitations by user ${userId}`);
    res.status(200).json(sentInvites);
  } catch (error) {
    console.error("Error getting sent invites by user:", error.message);
    res.status(500).json({ message: "Lỗi lấy danh sách đã mời" });
  }
};

// Lấy lời mời nhóm dã gửi (legacy endpoint cho admin)
export const getSentGroupInvites = async (req, res) => {
  try {
    const { adminId } = req.params;
    console.log("Fetching sent invitations by admin:", adminId);
    
    const groups = await Group.find({
      admin: adminId,
      pendingMembers: { $exists: true, $not: { $size: 0 } }
    }).populate('pendingMembers', 'username avatar phone')
     .populate('members', 'username avatar phone')
     .maxTimeMS(5000);

    const sentInvites = groups.flatMap(group => 
      group.pendingMembers.map(member => ({
        _id: `${group._id}_${member._id}`, 
        groupId: group._id,
        groupName: group.name,
        receiver: member,
        createdAt: group.updatedAt,
        // Check xem receiver đã là member (accept lời mời) hay chưa
        isMember: group.members.some(m => m._id.toString() === member._id.toString()),
        isPending: true // Vẫn trong pendingMembers
      }))
    );

    console.log(`Found ${sentInvites.length} sent invitations by admin ${adminId}`);
    res.status(200).json(sentInvites);
  } catch (error) {
    console.error("Error getting sent invites by admin:", error.message);
    res.status(500).json({ message: "Lỗi lấy danh sách đã mời" });
  }
};

// Rời khỏi nhóm
export const leaveGroup = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        // Xóa thành viên khỏi mảng members
        const group = await Group.findByIdAndUpdate(
            groupId,
            { $pull: { members: userId } },
            { new: true }
        ).populate('members', 'username avatar');

        if (!group) return res.status(404).json({ message: "Không tìm thấy nhóm" });

        // Nếu người rời đi là Admin, hãy chỉ định Admin mới (Ví dụ: người tham gia lâu nhất)
        if (group.admin.toString() === userId && group.members.length > 0) {
            group.admin = group.members[0]._id;
            await group.save();
        }

        const systemMessage = new Message({
            groupId: groupId,
            sender: userId, 
            text: "đã rời khỏi nhóm",
            messageType: "system" 
        });
        await systemMessage.save();

        // Cập nhật lastMessage cho nhóm
        group.lastMessage = {
            text: "đã rời khỏi nhóm",
            sender: userId,
            createdAt: new Date(),
            messageType: "system"
        };
        await group.save();

        const populatedMsg = await Message.findById(systemMessage._id).populate('sender', 'username avatar');

        res.status(200).json({ 
            message: "Rời nhóm thành công", 
            groupId: group._id,
            systemMessage: populatedMsg 
        });

    } catch (error) {
        console.error("Error Leaving Group:", error);
        res.status(500).json({ message: "Lỗi khi rời nhóm" });
    }
};

// Cập nhật avatar nhóm
export const updateGroupAvatar = async (req, res) => {
    try {
        const { groupId, avatar, avatarPublicId } = req.body;
        
        if (!groupId || !avatar) {
            return res.status(400).json({ message: "Thiếu groupId hoặc avatar URL" });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Không tìm thấy nhóm" });
        }

        // Xóa ảnh cũ trên Cloudinary nếu có
        if (group.avatarPublicId) {
            try {
                await cloudinary.uploader.destroy(group.avatarPublicId);
                console.log("✅ Đã xóa ảnh cũ trên Cloudinary:", group.avatarPublicId);
            } catch (err) {
                console.error("⚠️ Lỗi xóa ảnh cũ:", err);
            }
        }

        // Cập nhật avatar mới
        const updatedGroup = await Group.findByIdAndUpdate(
            groupId,
            { 
                avatar, 
                avatarPublicId: avatarPublicId || null
            },
            { new: true }
        )
        .populate('members', 'username avatar');

        // Map name thành username để match với frontend
        const groupToReturn = {
            ...updatedGroup.toObject(),
            username: updatedGroup.name
        };

        res.status(200).json({
            message: "Cập nhật ảnh nhóm thành công",
            updatedGroup: groupToReturn
        });
    } catch (error) {
        console.error("Lỗi cập nhật avatar nhóm:", error);
        res.status(500).json({ message: "Lỗi cập nhật avatar nhóm" });
    }
};