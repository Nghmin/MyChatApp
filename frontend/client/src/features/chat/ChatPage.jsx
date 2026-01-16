import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../../components/SidebarNav';
import ConversationList from '../../components/chatComponents/ConversationList';
import ProfileModal from '../../components/chatComponents/ProfileModal';
import ChatWindow from '../../components/chatComponents/ChatWindow';
import { io } from 'socket.io-client';
const ChatPage = () => {
  const [friends, setFriends] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForModal, setUserForModal] = useState(null);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const socket = useRef(null);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const myId = currentUser?.userId || currentUser?._id;

  // Kết nối Socket.IO và thiết lập các sự kiện
  useEffect(() => {
    if (!myId) return;

    socket.current = io('http://localhost:5000', {
      path: '/socket.io',
      transports: ['websocket'],
      reconnection: true,
    });
    socket.current.on('connect', () => {
      console.log(">>> Socket đã kết nối:", socket.current.id);
      socket.current.emit('join_chat', { myId, friendId: myId });
    });

    socket.current.on('get_online_users', (userIds) => {
      console.log("Danh sách online:", userIds);
      setOnlineUsers(userIds);
    });

    socket.current.on('receive_message', (newMessage) => {
      console.log("Nhận tin nhắn mới:", newMessage);
      console.log("Người gửi:", newMessage.sender, "Người nhận:", newMessage.receiver);
      setFriends(prevFriends => {
        // Cập nhật dữ liệu tin nhắn mới
        const updatedFriends = prevFriends.map(f => {
          if (f._id === newMessage.sender || f._id === newMessage.receiver) {
            return {
              ...f,
              lastMessage: newMessage,
              unreadCount: (newMessage.sender !== selectedUser?._id && newMessage.sender !== myId) 
                ? (f.unreadCount || 0) + 1 
                : (f.unreadCount || 0)
            };
          }
          return f;
        });
        return [...updatedFriends].sort((a, b) => {
          const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
          const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
          return timeB - timeA; 
        });
      });
    });

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [myId]);

  useEffect(() => {
    if (socket.current && myId && selectedUser?._id) {
      const roomId = [myId, selectedUser._id].sort().join('_');
      console.log(">>> Đang kết nối vào phòng chat ID:", roomId);
      socket.current.emit('join_chat', { myId, friendId: selectedUser._id });
    }
  }, [myId]);
  //Lấy danh sách bạn bè
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log("Fetching friends with token:", token);
        const myId = currentUser.userId || currentUser._id;
        const response = await fetch(`http://localhost:5000/api/users?currentUserId=${myId}`,{
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });
        if (!response.ok) {
        console.error("Lỗi xác thực hoặc Gateway chặn");
        return;
      }
        const data = await response.json();
        setFriends(data);
      } catch (err) {
        console.error("Lỗi lấy bạn bè", err);
      }
    };
    fetchFriends();
  }, [currentUser]);

  const openMyProfile = () => {
    setUserForModal(currentUser);
    setIsProfileModalOpen(true);
  };
  const openFriendProfile = () => {
    if (selectedUser) {
      setUserForModal(selectedUser);
      setIsProfileModalOpen(true);
    }
  };

  // Hàm xử lý khi chọn user trong danh sách
  const handleSelectUser = async (user) => {
    setSelectedUser(user);

    //  Cập nhật UI ngay lập tức bằng cách đặt unreadCount về 0
    setFriends(prev => prev.map(f => f._id === user._id ? { ...f, unreadCount: 0 } : f));

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/messages/mark-as-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          senderId: user._id, 
          receiverId: currentUser.userId || currentUser._id 
        })
      });
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái đã đọc:", err);
    }
  };

  // Hàm xử lý khi cập nhật Profile 
  const handleUpdateSuccess = (newData) => {

    const updatedUser = { ...currentUser, ...newData };
    
    setCurrentUser(updatedUser); 
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };
  // 
  const toggleRightSidebar = () => setShowRightSidebar(!showRightSidebar);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar 
        avatar={currentUser?.avatar} 
        onAvatarClick={openMyProfile} 
      />

      {/* Danh sách hội thoại */}
      <ConversationList 
        friends={friends} 
        onSelectUser={handleSelectUser} 
        selectedId={selectedUser?._id}
        onlineUsers={onlineUsers}
      />

      {/* Cửa sổ chat */}
      <ChatWindow 
        selectedUser={selectedUser} 
        myInfo={currentUser}
        onShowFriendProfile={openFriendProfile}
        socket={socket.current}
        onlineUsers={onlineUsers}
        onToggleSidebar={() => setShowRightSidebar(!showRightSidebar)}
        isSidebarOpen={showRightSidebar}
      />
      {/* Modal Profile */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)}
        targetUser={userForModal}
        myInfo={currentUser}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default ChatPage;