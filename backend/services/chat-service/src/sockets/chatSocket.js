import User from '../models/User.js';

let onlineUsers = new Map();

export const initSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        
        // Gửi danh sách online users hiện tại cho client mới vừa kết nối
        socket.emit('get_online_users', Array.from(onlineUsers.keys()));
        
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
                // Gửi đến tất cả trong phòng private chat
                io.to(roomId).emit('receive_message', savedMsg);
                // Cũng gửi đến personal room của receiver để update unread nếu họ không ở room
                io.to(savedMsg.receiver).emit('receive_message', savedMsg);
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

        // Sự kiện đăng ký socket cho cuộc gọi video/voice
        socket.on('register_call_socket', (userId) => {
            if (userId) {
                const callRoom = `call_room_${userId}`;
                socket.join(callRoom); 
                console.log(`Cửa sổ gọi của ${userId} đã join ${callRoom}`);
            }
        });

        // Sự kiện gọi điện/video
        socket.on('call_user', (data) => {
            console.log(`[VideoCall] ${data.from} đang gọi tới ${data.userToCall}`);

            // Dữ liệu cần gửi đi
            const callPayload = {
                signal: data.signalData, 
                from: data.from, 
                name: data.name,
                displayName: data.displayName || data.name,
                type: data.type,
                avatar: data.avatar
            };
            io.to(`call_room_${data.userToCall}`).emit('incoming_call', callPayload);
        });

        // Sự kiện trả lời tín hiệu 
        socket.on('answer_call', (data) => {
            socket.to(`call_room_${data.to}`).emit('call_accepted', data.signal);
        });    

        // Sự kiện kết thúc/Từ chối cuộc gọi
        socket.on('end_call', ({ to, reason }) => {
            io.to(`call_room_${to}`).emit('call_ended', { reason });
        }); 

        // Sự kiện phát tín hiệu ICE Candidate 
        socket.on('ice_candidate', (data) => {
            io.to(`call_room_${data.to}`).emit('ice_candidate', data.candidate);
        });

        // Sự kiện toggle video/audio
        socket.on('toggle_video', ({ to, from ,muted }) => {
            io.to(`call_room_${to}`).emit('remote_video_toggled', { from, muted });
            console.log("targetId:", to, "myId:", from, "muted:", muted);
        });

        socket.on('toggle_audio', ({ to, from, muted }) => {
            io.to(`call_room_${to}`).emit('remote_audio_toggled', { from, muted });
            console.log("targetId:", to, "myId:", from, "muted:", muted);
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
                    await User.findByIdAndUpdate(disconnectedUserId, { lastSeen: new Date() });
                } catch (err) { console.error(err); }
                io.emit('get_online_users', Array.from(onlineUsers.keys()));
            }
        });
    });
};