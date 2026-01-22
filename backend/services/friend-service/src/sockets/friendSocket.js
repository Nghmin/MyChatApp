// Xử lý sự kiện khi người gửi (A) gửi lời mời kết bạn
socket.on('send_friend_request', (data) => {
    // data: { receiverId, senderName, ... }
    // Gửi đến room cá nhân của người nhận (B) mà ông đã join bằng myId
    socket.to(data.receiverId).emit('receive_friend_request', data);
});
// Xử lý sự kiện khi người nhận (B) chấp nhận lời mời kết bạn
socket.on('accept_friend_request', (data) => {
    // data: { senderId, receiverName }
    socket.to(data.senderId).emit('friend_request_accepted', data);
});
// Xử lý sự kiện khi người nhận (B) từ chối lời mời kết bạn
socket.on('decline_friend_request', (data) => {
    // data: { senderId, receiverName }
    socket.to(data.senderId).emit('friend_request_declined', data);
});