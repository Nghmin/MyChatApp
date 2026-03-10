// Xử lý sự kiện khi người gửi (A) gửi lời mời kết bạn
socket.on('send_friend_request', (data) => {
    // Gửi thông báo cho người nhận
    io.to(data.receiverId).emit('receive_friend_request', data);
    // Cập nhật số lời mời đã gửi
    io.to(data.senderId).emit('sent_friend_request', { 
        receiverId: data.receiverId,
        senderName: data.senderName 
    });
});
// Xử lý sự kiện khi người nhận (B) chấp nhận lời mời kết bạn
socket.on('accept_friend_request', (data) => {
    // Gửi cho người gửi biết đã được chấp nhận
    io.to(data.senderId).emit('friend_request_accepted', data);
    io.to(data.receiverId).emit('friend_accepted_success', {
        senderId: data.senderId,
        senderName: data.senderName,
        friendData: data.friendData 
    });
});
// Xử lý sự kiện khi người nhận (B) từ chối lời mời kết bạn
socket.on('decline_friend_request', (data) => {
    io.to(data.senderId).emit('friend_request_declined', data);
});

// Xử lý sự kiện khi người gửi (A) thu hồi lời mời kết bạn
socket.on('cancel_friend_request', (data) => {
    // Gửi cho người nhận biết lời mời đã bị thu hồi
    io.to(data.receiverId).emit('friend_request_cancelled', {
        senderId: data.senderId,
        senderName: data.senderName
    });
});

// Xử lý sự kiện hủy kết bạn
socket.on('unfriend', (data) => {
    const { myId, friendId } = data;
    io.to(friendId.toString()).emit('unfriend_updated', { 
        personWhoDeleted: myId 
    });
    io.to(myId.toString()).emit('unfriend_updated', { 
        personDeleted: friendId 
    });
});

// Xử lý sự kiện hủy kết bạn (mới)
socket.on('unfriend_action', (data) => {
    const { myId, friendId, myName, friendName } = data;
    // Gửi cho người bị hủy kết bạn
    io.to(friendId.toString()).emit('unfriend_action', { 
        friendId: myId,
        friendName: myName
    });
    // Gửi cho người hủy kết bạn để xác nhận
    io.to(myId.toString()).emit('unfriend_confirmed', {
        friendId: friendId,
        friendName: friendName
    });
});