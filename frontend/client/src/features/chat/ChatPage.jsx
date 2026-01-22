import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../../components/SidebarNav';
import ConversationList from '../../components/chatComponents/ConversationList';
import ProfileModal from '../../components/chatComponents/ProfileModal';
import ChatWindow from '../../components/chatComponents/ChatWindow';
import ContactDetailView from '../../components/contactComponents/ContactWindow';

import ContactItempList from '../../components/contactComponents/ContactItempList';
import ContactWindow from '../../components/contactComponents/ContactWindow';

import { io } from 'socket.io-client';
const ChatPage = () => {
  const [friends, setFriends] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForModal, setUserForModal] = useState(null);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  
  const [activeTab, setActiveTab] = useState('chat');
  const [requestCount, setRequestCount] = useState(0);
  const [contactCategory, setContactCategory] = useState('friend-list');

  const socket = useRef(null);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const myId = currentUser?.userId || currentUser?._id;

  const fetchFriends = async () => {
    if (!currentUser) return;
    try {
      const token = localStorage.getItem('token');
      console.log("Fetching friends with token:", token);
      const myId = currentUser.userId || currentUser._id;
      const response = await fetch(`http://127.0.0.1:5000/chat/users?currentUserId=${myId}`,{
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
      const myCloud = {
        _id: myId,
        username: "Cloud của tôi",
        avatar: "https://img.icons8.com/fluency/48/cloud.png", 
      };
      setFriends([ myCloud, ...data]);
    } catch (err) {
      console.error("Lỗi lấy bạn bè", err);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchRequestCount();
  }, [currentUser]);
  
  useEffect(() => {
    if (!myId) return;
    if (!socket.current) {
      socket.current = io('http://127.0.0.1:5000', {
        path: '/socket.io',
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        timeout: 20000,
      });
    }
    try{
    socket.current.on('connect', () => {
      console.log(">>> Socket đã kết nối:", socket.current.id);
      socket.current.emit('join_chat', { myId, friendId: myId });
    });} catch(err){ console.log("Lỗi kết nối socket" , err); }

    socket.current.on('disconnect', (reason) => {
      console.log(">>> Socket disconnected:", reason);
    });

    socket.current.on('connect_error', (error) => {
      console.error(">>> Socket connection error:", error);
    });

    socket.current.on('get_online_users', (userIds) => {
      console.log("Danh sách online:", userIds);
      setOnlineUsers(userIds);
    });
    socket.current.on('receive_message', (newMessage) => {
      updateFriendsWithLastMessage(newMessage);
    });
    socket.current.on('recall_message', (recalledMessage) => {
      console.log("Sidebar nhận tin thu hồi:", recalledMessage);
      updateFriendsWithLastMessage(recalledMessage);
    });
    const updateFriendsWithLastMessage = (msg) => {
      
      setFriends(prevFriends => {
        const updatedFriends = prevFriends.map(f => {
          const isCloud = f._id === myId;
          const isSelfChat = msg.sender === myId && msg.receiver === myId;
          if (isCloud) {
            if (isSelfChat) {
              return { ...f, lastMessage: { ...msg } };
            }
            return f;
          }
          if (f._id === msg.sender || f._id === msg.receiver) {
            return {
              ...f,
              lastMessage: {...msg},
              unreadCount: (!msg.isDeleted && msg.sender !== selectedUser?._id && msg.sender !== myId) 
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
    };

    socket.current.on('receive_friend_request', (data) => {
      console.log("Thông báo kết bạn mới:", data);
      alert(`Bạn có lời mời kết bạn mới từ ${data.senderName}`);
      setRequestCount(prev => prev + 1);
    });

    socket.current.on('friend_request_accepted', (data) => {
      alert(`${data.receiverName} đã chấp nhận lời mời kết bạn của bạn!`);
      fetchFriends(); 
    });

    return () => {
      if (socket.current) {
      socket.current.off('receive_friend_request');
      socket.current.off('friend_request_accepted');
      socket.current.off('receive_message'); 
      socket.current.off('get_online_users'); 
      socket.current.off('recall_message');
      // socket.current.disconnect();
      }};
  }, [myId , selectedUser?._id]);

  useEffect(() => {
    if (socket.current && myId && selectedUser?._id) {
      const roomId = [myId, selectedUser._id].sort().join('_');
      console.log(">>> Đang kết nối vào phòng chat ID:", roomId);
      socket.current.emit('join_chat', { myId, friendId: selectedUser._id });
    }
  }, [myId]);
     
  
  const fetchRequestCount = async () => {
      try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://127.0.0.1:5000/friend/received/${myId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          setRequestCount(data.length); 
      } catch (err) { console.log(err); }
  };

  const openMyProfile = () => {
    setUserForModal(currentUser);
    setIsProfileModalOpen(true);
  };
  const openFriendProfile = (user) => {
    const target = user || selectedUser;
    if (target) {
      setUserForModal(target);
      setIsProfileModalOpen(true);
    }
    else {
      console.log("Không có user để hiển thị profile");
    }
  };

  // Hàm xử lý khi chọn user trong danh sách
  const handleSelectUser = async (user) => {
    setSelectedUser(user);

    //  Cập nhật UI ngay lập tức bằng cách đặt unreadCount về 0
    setFriends(prev => prev.map(f => f._id === user._id ? { ...f, unreadCount: 0 } : f));

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://127.0.0.1:5000/chat/messages/mark-as-read`, {
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

  const handleSelectCategory = (category) => {
    setContactCategory(category);
    if (category === 'friend-requests') {
      setRequestCount(0); 
    }
  };


  const handleSendFriendRequest = async (targetPhoneOrId) => {
    try {
      const token = localStorage.getItem('token');
    
      const response = await fetch(`http://127.0.0.1:5000/friend/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          senderId: myId,
          receiverPhone: targetPhoneOrId
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (socket.current) {
          socket.current.emit('send_friend_request', {
            receiverId: data.receiverId,
            senderName: currentUser.username,
            senderId: myId
          });
        }
        alert("Đã gửi lời mời!");
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: "Lỗi kết nối server" };
    }
  };
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar 
        avatar={currentUser?.avatar} 
        onAvatarClick={openMyProfile} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        requestCount={requestCount}
      />
      {/* Danh sách Tin nhắn / Danh bạ */}
      {activeTab === 'chat' ? (
        <ConversationList 
          friends={friends} 
          onSelectUser={handleSelectUser} 
          selectedId={selectedUser?._id}
          onlineUsers={onlineUsers}
          onSendFriendRequest={handleSendFriendRequest}
        />
      ) : (
        <ContactItempList 
          onSelectCategory={handleSelectCategory}
          activeCategory={contactCategory}
          requestCount={requestCount}
        /> 
      )}  

      <div className="flex-1 flex overflow-hidden relative">
        {activeTab === 'chat' ? (
          <ChatWindow 
            selectedUser={selectedUser} 
            myInfo={currentUser}
            onShowFriendProfile={openFriendProfile}
            socket={socket.current}
            onlineUsers={onlineUsers}
            onToggleSidebar={() => setShowRightSidebar(!showRightSidebar)}
            isSidebarOpen={showRightSidebar}
            onSendFriendRequest={handleSendFriendRequest}
          />
        ) : (
          <ContactWindow
            friends={friends} 
            onSelectCategory={contactCategory}
            socket={socket.current} 
            myInfo={currentUser}
            onShowFriendProfile={openFriendProfile}
          />
        )}
      </div>
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