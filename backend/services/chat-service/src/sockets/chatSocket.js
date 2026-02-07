import User from '../models/User.js';

let onlineUsers = new Map();

export const initSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        // Join tất cả nhóm
        socket.on('join_all_groups', ({ groupIds, myId }) => {
            if (myId) {
                socket.join(myId);
                onlineUsers.set(myId, socket.id);
            }
            
            if (groupIds && Array.isArray(groupIds)) {
                groupIds.forEach(id => {
                    socket.join(id.toString());
                });
                console.log(`User ${myId} đã join sẵn ${groupIds.length} nhóm`);
            }
            io.emit('get_online_users', Array.from(onlineUsers.keys()));
        });
        // Tham gia phòng
        socket.on('join_chat', ({ myId, friendId, isGroup }) => {
            if (myId) {
                socket.join(myId); 
                onlineUsers.set(myId, socket.id);
            }

            if (isGroup) {
                // NẾU LÀ NHÓM: friendId chính là groupId
                socket.join(friendId);
                console.log(`User ${myId} joined Group Room: ${friendId}`);
            } else if (friendId) {
                // NẾU LÀ CÁ NHÂN: Tạo roomId ghép đôi
                const roomId = [myId, friendId].sort().join('_');
                socket.join(roomId);
                console.log(`User ${myId} joined Private Room: ${roomId}`);
            }
            
            io.emit('get_online_users', Array.from(onlineUsers.keys()));
        });

        // Gửi tin nhắn
        socket.on('send_message', (savedMsg) => {
            if (savedMsg.groupId) {
                io.to(savedMsg.groupId).emit('receive_message', savedMsg);
            } else {
                // Chat cá nhân
                const roomId = [savedMsg.sender, savedMsg.receiver].sort().join('_');
                socket.to(roomId).emit('receive_message', savedMsg);
                // Gửi đến cá nhân receiver để hiện thông báo/unread count nếu họ chưa vào phòng chat
                socket.to(savedMsg.receiver).emit('receive_message', savedMsg);
            }
        });

        // Thu hồi tin nhắn
        socket.on('recall_message', (message) => {
            if (message.groupId) {
                io.to(message.groupId).emit('recall_message', message);
            } else {
                const roomId = [message.sender, message.receiver].sort().join('_');
                io.to(roomId).emit('recall_message', message);
                io.to(message.receiver).emit('recall_message', message);
            }
        });

        // Sự kiện Tạo nhóm mới (Bắn cho tất cả thành viên)
        socket.on('create_group', (newGroup) => {
            newGroup.members.forEach(member => {
                const memberId = member._id || member;
                // Bắn về cho từng cá nhân để họ thấy nhóm mới hiện lên ở danh sách
                io.to(memberId.toString()).emit('new_group_created', newGroup);
            });
        });

        socket.on('disconnect', async () => {
            let disconnectedUserId = null;
            for (let [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    break;
                }
            }
            if (disconnectedUserId) {
                if (onlineUsers.get(disconnectedUserId) === socket.id) {
                    onlineUsers.delete(disconnectedUserId);
                }
                try {
                    await User.findByIdAndUpdate(disconnectedUserId, { lastMessageAt: new Date() });
                } catch (err) { console.error(err); }
                io.emit('get_online_users', Array.from(onlineUsers.keys()));
            }
        });
    });
};