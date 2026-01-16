import User from '../models/User.js';

let onlineUsers = new Map();

export const initSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('join_chat', ({ myId, friendId }) => {
            if (myId) {
                onlineUsers.set(myId, socket.id);
                io.emit('get_online_users', Array.from(onlineUsers.keys()));
            }
            const roomId = [myId, friendId].sort().join('_');
            socket.join(roomId);
            socket.join(myId);
        });

        socket.on('send_message', (savedMsg) => {
            const roomId = [savedMsg.sender, savedMsg.receiver].sort().join('_');
            socket.to(roomId).emit('receive_message', savedMsg);
            socket.to(savedMsg.receiver).emit('receive_message', savedMsg);
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
                onlineUsers.delete(disconnectedUserId);
                try {
                    await User.findByIdAndUpdate(disconnectedUserId, { lastMessageAt: new Date() });
                } catch (err) { console.error(err); }
                io.emit('get_online_users', Array.from(onlineUsers.keys()));
            }
        });
    });
};