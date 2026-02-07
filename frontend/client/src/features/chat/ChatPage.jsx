import React, { useState, useRef, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
// import {FriendRequestToast} from '../../components/toastComponents/FriendRequestToast';
import { showFirendRequestNotification } from '../../utils/toastHelpers';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../components/SidebarNav';
import ConversationList from '../../components/chatComponents/ConversationListComponents/ConversationList';
import ProfileModal from '../../components/chatComponents/ChatModals/ProfileModal';
import GroupInfoModal from '../../components/chatComponents/ChatModals/GroupInfoModal';
import CreateGroupModal from '../../components/chatComponents/ChatModals/CreateGroupModal';
import ChatWindow from '../../components/chatComponents/ChatWindowComponents/ChatWindow';
import ContactItempList from '../../components/contactComponents/ContactItemComponents/ContactItemList'; 
import ContactWindow from '../../components/contactComponents/ContactWindowComponents/ContactWindow';

import { io } from 'socket.io-client';
const ChatPage = () => {
  const [friends, setFriends] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [userForModal, setUserForModal] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  
  const [activeTab, setActiveTab] = useState('chat');
  const [requestCounts, setRequestCounts] = useState({ total: 0, friend: 0, group: 0 });
  const [contactCategory, setContactCategory] = useState('friend-list');

  const [groupForModal, setGroupForModal] = useState(null);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isGroupInfoModalOpen, setIsGroupInfoModalOpen] = useState(false);
  const [initialGroupMember, setInitialGroupMember] = useState(null);

  const socket = useRef(null);
  const selectedUserRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  
  const myId = currentUser?.userId || currentUser?._id;
  // Hàm lấy danh sách bạn bè từ server
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

  // Lấy danh sách bạn bè khi load trang và khi currentUser thay đổi
  useEffect(() => {
    fetchFriends();
    fetchRequestCounts();
  }, [currentUser]);


  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);
  // Hàm làm mới dữ liệu bạn bè và lời mời kết bạn
  const refreshFriendData = async () => {
    await fetchFriends();       
    await fetchRequestCounts();  
  };


  useEffect(() => {
    // Kiểm tra nếu socket đã sẵn sàng và đã có danh sách bạn bè/nhóm
    if (socket.current && friends.length > 0) {
      const groupIds = friends
        .filter(f => f.isGroup || f.members)
        .map(f => f._id.toString());
      
      if (groupIds.length > 0) {
        console.log(">>> Đang đăng ký nằm vùng tại các nhóm:", groupIds);
        socket.current.emit('join_all_groups', { 
          groupIds, 
          myId: currentUser?.userId || currentUser?._id 
        });
      }
    }
  }, [friends, socket.current]);
  // Hàm xử lý chấp nhận nhanh khi nhấn nút trên Toast thông báo
  const handleQuickAccept = async (requestId, senderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/friend/friend/friend/accept`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId })
      });

      if (response.ok) {
        const data = await response.json();
        if (socket.current) {
          socket.current.emit('accept_friend_request', {
            senderId: senderId,
            receiverId: myId,
            receiverName: currentUser.username,
            senderName: data.friendData?.username,
            friendData: data.friendData  
          });
        }
        refreshFriendData();
        showFirendRequestNotification.success("Đã trở thành bạn bè!");
      }
    } catch (err) {
      console.error("Lỗi chấp nhận nhanh:", err);
      showFirendRequestNotification.error("Không thể chấp nhận lời mời lúc này");
    }
  };

  // Khởi tạo kết nối Socket.IO
  useEffect(() => {
    if (!myId || socket.current) return;
    
    socket.current = io('http://127.0.0.1:5000', {
      path: '/socket.io',
      transports: ['websocket'],
      reconnection: true,
    });

    socket.current.on('connect', () => {
      console.log(">>> Socket đã kết nối:", socket.current.id);
      socket.current.emit('join_chat', { myId, friendId: myId });
    });
  }, [myId]);

  // Hàm logic cập nhật Tin nhắn và Unread Count 
  const updateFriendsWithLastMessage = (msg) => {
  console.log("Dữ liệu socket nhóm:", msg);
  setFriends(prevFriends => {
    const updatedFriends = prevFriends.map(f => {
      const senderId = (msg.sender?._id || msg.sender || "").toString(); 
      const receiverId = (msg.receiver?._id || msg.receiver || "").toString();
      const msgGroupId = msg.groupId?.toString();
      const friendId = f._id.toString();

      // Tin nhắn nhóm
      if (msgGroupId && friendId === msgGroupId) {
        const isCurrentChat = selectedUserRef.current?._id === msgGroupId;
        
        let newCount = f.unreadCount || 0;
        if (msg.isDeleted) {
            newCount = isCurrentChat ? 0 : newCount;
        } else {
            newCount = (isCurrentChat || senderId === myId) ? 0 : newCount + 1;
        }

        return {
          ...f,
          lastMessage: msg,
          unreadCount: newCount
        };
      }

      const isCloud = f.username === "Cloud của tôi";
      const isPartner = friendId === senderId || friendId === receiverId;

      if (!msgGroupId && isPartner) {
        // Nếu là Cloud
        if (isCloud && senderId === myId && receiverId === myId) {
          return { ...f, lastMessage: msg };
        }
        
        // Nếu là bạn bè
        if (!isCloud) {
          const isCurrentChat = selectedUserRef.current?._id === friendId;
          const isIncoming = senderId !== myId; 
          
          let newCount = f.unreadCount || 0;
          if (msg.isDeleted) {
              newCount = isCurrentChat ? 0 : newCount;
          } else {
              // Tin mới: Tăng 1 nếu người khác gửi và ko mở chat
              newCount = (isIncoming && !isCurrentChat) ? newCount + 1 : (isCurrentChat ? 0 : newCount);
          }

          return {
            ...f,
            lastMessage: msg,
            unreadCount: newCount
          };
        }
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
  // Thiết lập các sự kiện
  useEffect(() => {
    const s = socket.current;
    if (!s) return;
    
    // Xử lý nhận lời mời kết bạn
    const handleRequest = (data) => {
      console.log("Nhận lời mời kết bạn từ:", data,sender.username);
      const formattedData = {
        requestId: data._id,
        senderId: data.sender?._id || data.senderId,
        senderName: data.sender?.username || data.senderName,
        senderAvatar: data.sender?.avatar || data.senderAvatar
      };
      showFirendRequestNotification.friendRequest(formattedData, () => 
        handleQuickAccept(formattedData.requestId, formattedData.senderId)
      );
      refreshFriendData();
    };

    const handleGroupInvite = (data) => {
      console.log("Nhận lời mời nhóm:", data);
      showFirendRequestNotification.success(data.message);
      fetchRequestCounts(); 
    };

    // Xử lý Chấp nhận kết bạn
    const handleAccepted = (data) => {
      showFirendRequestNotification.success(`${data.receiverName} đã đồng ý kết bạn!`);
      console.log(data.receiverName);
      refreshFriendData();
    };

    const handleJoinedGroup = (data) => {
      refreshFriendData(); 
    };

    // hàm tạo nhóm chat
    const handleNewGroup = (newGroup) => {
      setFriends(prev => {
        if (prev.find(f => f._id === newGroup._id)) return prev;
        return [newGroup, ...prev]; 
      });
    };

    // Hàm cập nhật số lượng lời mời kết bạn 
    const handleFriendAcceptedSuccess = (data) => {
      console.log("✓ Người bạn đã chấp nhận lời mời", data);
      setFriends(prev => {
        const friendExists = prev.find(f => f._id === data.senderId);
        if (friendExists) {
          return prev.map(f => f._id === data.senderId ? { ...f, ...data.friendData } : f);
        } else {
          return [data.friendData, ...prev];
        }
      });
    };

    // Hàm cập nhật số lượng người trong nhóm khi người khác join
    const handleGroupMemberJoined = (data) => {
      console.log("✓ Có thành viên mới join nhóm:", data);
      const { groupId, updatedGroup } = data;
      
      // Cập nhật danh sách friends
      setFriends(prev => 
        prev.map(f => f._id === groupId ? updatedGroup : f)
      );
      // Cập nhật danh sách thành viên nhóm
      setGroupForModal(prev => 
        (prev?._id === groupId ? { ...prev, ...updatedGroup } : prev)
      );
      // Cập nhật user hien tai
      setSelectedUser(prev => 
        (prev?._id === groupId ? { ...prev, ...updatedGroup } : prev)
      );
    };

    // Hàm cập nhật số lượng lời mời kết bạn
    const handleSentFriendRequest = (data) => {
      console.log("Đã gửi lời mời kết bạn", data);
      fetchRequestCounts();
    };

    // Hàm cập nhật số lượng lời mời nhóm
    const handleSentGroupInvitation = (data) => {
      console.log("Đã gửi lời mời nhóm", data);
      fetchRequestCounts();
    };

    // Đăng ký sự kiện
    s.on('receive_friend_request', handleRequest);
    s.on('friend_request_accepted', handleAccepted);
    s.on('friend_accepted_success', handleFriendAcceptedSuccess);
    s.on('receive_group_invite', handleGroupInvite);
    s.on('group_member_joined', handleGroupMemberJoined);
    s.on('group_joined_success', handleJoinedGroup);
    s.on('get_online_users', (userIds) => setOnlineUsers(userIds));
    s.on('receive_message', updateFriendsWithLastMessage);
    s.on('recall_message', updateFriendsWithLastMessage);
    s.on('new_group_created', handleNewGroup);
    s.on('group_created_update_converlist', handleNewGroup);  // Cập nhật converlist khi tạo nhóm
    s.on('sent_friend_request', handleSentFriendRequest);
    s.on('sent_group_invitation', handleSentGroupInvitation);
    
    return () => {
      s.off('receive_friend_request', handleRequest);
      s.off('friend_request_accepted', handleAccepted);
      s.off('friend_accepted_success', handleFriendAcceptedSuccess);
      s.off('receive_group_invite', handleGroupInvite);
      s.off('group_member_joined', handleGroupMemberJoined);
      s.off('group_joined_success', handleJoinedGroup);
      s.off('get_online_users');
      s.off('receive_message', updateFriendsWithLastMessage);
      s.off('recall_message', updateFriendsWithLastMessage);
      s.off('new_group_created', handleNewGroup);
      s.off('group_created_update_converlist', handleNewGroup);
      s.off('sent_friend_request', handleSentFriendRequest);
      s.off('sent_group_invitation', handleSentGroupInvitation);
    };
  }, [myId, groupForModal, selectedUser?._id]);

  // Vào phòng chat khi chọn người dùng
  useEffect(() => {
    if (socket.current && myId && selectedUser?._id) {
      const isGroup = selectedUser.isGroup || false;
      socket.current.emit('join_chat', { myId, friendId: selectedUser._id, isGroup: isGroup });
      console.log(`>>> Đã vào phòng ${isGroup ? 'NHÓM' : 'CÁ NHÂN'}: ${selectedUser._id}`);
    }
  }, [selectedUser?._id, myId]);
     
  // Hàm lấy số lượng lời mời kết bạn
  const fetchRequestCounts = async () => {
    if (!myId) return;
      try {
          const token = localStorage.getItem('token');
          const headers = { 'Authorization': `Bearer ${token}` };

          // Gọi song song 2 API
          const [resFriend, resGroup] = await Promise.all([
              fetch(`http://127.0.0.1:5000/friend/friend/friend/received/${myId}`, { headers }),
              fetch(`http://127.0.0.1:5000/friend/friend/group/pending/${myId}`, { headers })
          ]);

          const dataFriend = await resFriend.json();
          const dataGroup = await resGroup.json();

          
          const friendLen = Array.isArray(dataFriend) ? dataFriend.length : 0;
          const groupLen = Array.isArray(dataGroup) ? dataGroup.length : 0;

          setRequestCounts({
              total: friendLen + groupLen,
              friend: friendLen,
              group: groupLen
          });
      } catch (err) {
          console.error("Lỗi khi cập nhật số lượng lời mời:", err);
      }
  };

  const openMyProfile = () => {
    setUserForModal(currentUser);
    setIsProfileModalOpen(true);
  };
  const openSelectProfile = (user) => {
    const target = user || selectedUser;
    if (!target) return;

    if (target.isGroup) {
      setGroupForModal(target); 
      setIsGroupInfoModalOpen(true);
    } else {
      setUserForModal(target);
      setIsProfileModalOpen(true);
    }
  };

  // Hàm xử lý khi chọn user trong danh sách
  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    selectedUserRef.current = user;
    setFriends(prev => prev.map(f => f._id === user._id ? { ...f, unreadCount: 0 } : f));
    if (user.isGroup) return;
    try {
      const token = localStorage.getItem('token');
      const myRealId = currentUser.userId || currentUser._id;
      
      let endpoint = 'http://127.0.0.1:5000/chat/messages/mark-as-read';
      let body = { senderId: user._id, receiverId: myRealId };
      if (user.isGroup) {
        endpoint = 'http://127.0.0.1:5000/chat/messages/mark-group-as-read'; 
        body = { groupId: user._id, userId: myRealId };
      }
      await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
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

  // Hàm xử lý khi chọn danh sách lời mời
  const handleSelectCategory = (category) => {
    if (!category) return;

    setContactCategory(category);

    if (category === 'friend-requests') {
      setRequestCounts(prev => prev ? { ...prev, friend: 0 } : { friend: 0 });
      setRequestCounts({ ...requestCounts, friend: 0 }); 
    }
    if (category === 'group-requests') {
      setRequestCounts(prev => prev ? { ...prev, groups: 0 } : { groups: 0 });
      setRequestCounts({...requestCounts, groups : 0}); 
    }
  };

  // Hàm gửi lời mời kết bạn
  const handleSendFriendRequest = async (targetPhoneOrId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/friend/friend/friend/send`, {
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
      console.log(targetPhoneOrId);
      const data = await response.json();

      if (response.ok) {
        if (socket.current) {
          socket.current.emit('send_friend_request', {
          _id: data.request?._id || data.requestId, 
          receiverId: data.receiverId,
          senderId: myId,
          sender: {                               
            _id: myId,
            username: currentUser.username,
            avatar: currentUser.avatar
          },
          message: 'Xin chào, mình kết bạn nhé!'
        });
        }
        showFirendRequestNotification.success("Đã gửi lời mời kết bạn thành công!");
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.log(err);
      return { success: false, message: "Lỗi kết nối server" };
    }
  };

  // Hàm mở modal tạo nhóm mới
  const openCreateNewGroup = (selectedUser = null) => {
    setInitialGroupMember(selectedUser || null);
    setIsCreateGroupOpen(true);
  };

  // Hàm mở modal thêm thành viên vào nhóm hiện tại
  const openAddMembersToGroup = (group) => {
    setInitialGroupMember(group);
    setIsCreateGroupOpen(true);
  };

  // Hàm xử lý tạo nhóm
  const handleGroupAction = async (groupData) => {
    try {
      const token = localStorage.getItem('token');
      const isInviteMode = !!groupData.groupId; 

      if (isInviteMode) {
        
        const response = await fetch('http://127.0.0.1:5000/friend/friend/group/invite', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            groupId: groupData.groupId,
            inviterId: myId,
            inviteeIds: groupData.newMembers 
          })
        });

        if (response.ok) {
          
          if (socket.current) {
            socket.current.emit('send_group_invitation', {
              groupId: groupData.groupId,
              inviteeIds: groupData.newMembers,
              inviterId: myId,
              groupName: selectedUser.name
            });
          }
          showFirendRequestNotification.success("Đã gửi lời mời vào nhóm!");
          setIsCreateGroupOpen(false);
        }
      } else {
      
        const response = await fetch('http://127.0.0.1:5000/friend/friend/group/createGroup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ ...groupData, adminId: myId })
        });
        if (response.ok) {
          const newGroup = await response.json();
          if (socket.current) socket.current.emit('create_group', newGroup);
          showFirendRequestNotification.success("Tạo nhóm thành công!");
          setIsCreateGroupOpen(false);
          refreshFriendData();
        }
      }
    } catch (error) {
      showFirendRequestNotification.error("Thao tác thất bại");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <ToastContainer 
        limit={3} 
        newestOnTop 
        theme="light"
      />
      <Sidebar 
        avatar={currentUser?.avatar} 
        onAvatarClick={openMyProfile} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        requestCounts={requestCounts.total}
        friends={friends}
      />
      {/* Danh sách Tin nhắn / Danh bạ */}
      {activeTab === 'chat' ? (
        <ConversationList 
          friends={friends} 
          onSelectUser={handleSelectUser} 
          selectedId={selectedUser?._id}
          onlineUsers={onlineUsers}
          onSendFriendRequest={handleSendFriendRequest}
          myInfo={currentUser}
          onOpenCreateGroup={openCreateNewGroup}
        />
      ) : (
        <ContactItempList 
          onSelectCategory={handleSelectCategory}
          activeCategory={contactCategory}
          friendRequestCount={requestCounts.friend}
          groupRequestCount={requestCounts.group}
        /> 
      )}  

      <div className="flex-1 flex overflow-hidden relative">
        {activeTab === 'chat' ? (
          <ChatWindow 
            selectedUser={selectedUser} 
            myInfo={currentUser}
            onShowSelectProfile={openSelectProfile}
            socket={socket.current}
            onlineUsers={onlineUsers}
            onToggleSidebar={() => setShowRightSidebar(!showRightSidebar)}
            isSidebarOpen={showRightSidebar}
            onSendFriendRequest={handleSendFriendRequest}
            onOpenCreateNewGroup={openCreateNewGroup}
            onOpenAddMembersToGroup={openAddMembersToGroup}
          />
        ) : (
          <ContactWindow
            friends={friends} 
            onSelectCategory={contactCategory}
            socket={socket.current} 
            myInfo={currentUser}
            onShowSelectProfile={openSelectProfile}
            refreshData={refreshFriendData}
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

      <GroupInfoModal 
        isOpen={isGroupInfoModalOpen}
        onClose={() => setIsGroupInfoModalOpen(false)}
        groupData={groupForModal}
        currentUserId={myId}
        onAddMember={() => {
          setIsGroupInfoModalOpen(false);
          openAddMembersToGroup(groupForModal);
        }}
        onOpenCreateGroup={openCreateNewGroup}
      />

      <CreateGroupModal 
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        friends={friends.filter(f => !f.isGroup && f.username !== "Cloud của tôi")}
        initialSelectedUser={initialGroupMember}
        onCreateGroup={handleGroupAction}
      />
    </div>
  );
};

export default ChatPage;