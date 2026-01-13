import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../../components/chatComponents/SidebarNav';
import ConversationList from '../../components/chatComponents/ConversationList';
import ProfileModal from '../../components/uploadComponents/ProfileModal';
import ChatWindow from '../../components/chatComponents/ChatWindow';

const ChatPage = () => {
  const [friends, setFriends] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForModal, setUserForModal] = useState(null);
  
  // Khởi tạo user từ localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // 1. Lấy danh sách bạn bè
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchFriends = async () => {
      try {
        const myId = currentUser.userId || currentUser._id;
        const response = await fetch(`http://localhost:5000/api/users?currentUserId=${myId}`);
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

  // Hàm xử lý khi cập nhật Profile 
  const handleUpdateSuccess = (newData) => {

    const updatedUser = { ...currentUser, ...newData };
    
    setCurrentUser(updatedUser); 
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar 
        avatar={currentUser?.avatar} 
        onAvatarClick={openMyProfile} 
      />

      {/* Danh sách hội thoại */}
      <ConversationList 
        friends={friends} 
        onSelectUser={setSelectedUser} 
        selectedId={selectedUser?._id} 
      />

      {/* Cửa sổ chat */}
      <ChatWindow 
        selectedUser={selectedUser} 
        myInfo={currentUser}
        onShowFriendProfile={openFriendProfile} 
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