// Xử lý sự kiện khi tạo nhóm
socket.on('create_group', (newGroup) => {
  const allInvolvedIds = [
    ...(newGroup.members || []),
    ...(newGroup.pendingMembers || [])
  ];
  allInvolvedIds.forEach(member => {
    const memberId = member._id || member;
    io.to(memberId.toString()).emit('new_group_created', newGroup);
  });
  // Broadcast cho tất cả member để cập nhật converlist
  const allMemberIds = newGroup.members?.map(m => (m._id || m).toString()) || [];
  allMemberIds.forEach(memberId => {
    io.to(memberId).emit('group_created_update_converlist', newGroup);
  });
});

// Xử lý sự kiện khi tham gia nhóm
socket.on('join_group_room', (groupId) => {
  socket.join(groupId);
});

// Xử lý sự kiện khi người gửi lời mời tham gia nhóm
socket.on('accept_invite_success', (data) => {
  const { groupId, systemMessage, updatedGroup } = data;
  io.to(groupId).emit('receive_message', systemMessage);
  const allMemberIds = updatedGroup.members?.map(m => (m._id || m).toString()) || [];
  allMemberIds.forEach(memberId => {
    io.to(memberId).emit('group_member_joined', {
      groupId: groupId,
      newMember: systemMessage.sender,
      updatedGroup: updatedGroup,
      systemMessage: systemMessage
    });
  });
});

// Xử lý khi có lời mời vào nhóm mới 
socket.on('send_group_invitation', (data) => {
    const { groupId, inviteeIds, groupName, inviterId } = data;
    
    inviteeIds.forEach(userId => {
        io.to(userId.toString()).emit('receive_group_invite', {
            groupId,
            groupName,
            message: `Bạn có lời mời tham gia nhóm ${groupName}`
        });
    });
    
    // Cập nhật badge lời mời nhóm cho người gửi
    io.to(inviterId).emit('sent_group_invitation', {
        groupId,
        groupName,
        inviteeCount: inviteeIds.length
    });
});

// Xử lý khi người gửi thu hồi lời mời nhóm
socket.on('cancel_group_invitation', (data) => {
    const { groupId, inviteeIds, inviterName } = data;
    
    inviteeIds.forEach(userId => {
        io.to(userId.toString()).emit('group_invitation_cancelled', {
            groupId,
            inviterName
        });
    });
});

// Xử lý khi người nhận từ chối/gỡ bỏ lời mời nhóm
socket.on('group_invitation_declined', (data) => {
    const { groupId, userId } = data;
    io.emit('group_invitation_declined', {
        groupId,
        userId
    });
});

// Xử lý sự kiên rời khỏi nhóm
socket.on('leave_group', (data) => {
    const { groupId, userId, systemMessage } = data;
  
    io.to(groupId.toString()).emit('receive_message', systemMessage);
    
    socket.to(groupId.toString()).emit('user_left_group', { 
        groupId, 
        userId 
    });
    socket.leave(groupId.toString());
});

// Xử lý cập nhật avatar nhóm
socket.on('update_group_avatar', (data) => {
    const { groupId, updatedGroup } = data;
    
    if (updatedGroup.members && updatedGroup.members.length > 0) {
        updatedGroup.members.forEach(member => {
            const memberId = member._id || member;
            io.to(memberId.toString()).emit('group_avatar_updated', {
                groupId,
                updatedGroup
            });
        });
    }
});