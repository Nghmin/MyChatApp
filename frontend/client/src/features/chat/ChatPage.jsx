import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
// import {FriendRequestToast} from '../../components/toastComponents/FriendRequestToast';
import {showConfirmDialogToast} from '../../utils/toastHelpers';
import { showFirendRequestNotification } from '../../utils/toastHelpers';
import { showCallNotification } from '../../utils/toastHelpers';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../components/SidebarNav';
import ConversationList from '../../components/chatComponents/ConversationListComponents/ConversationList';
import ProfileModal from '../../components/chatComponents/ChatModals/ProfileModal';
import GroupInfoModal from '../../components/chatComponents/ChatModals/GroupInfoModal';
import CreateGroupModal from '../../components/chatComponents/ChatModals/CreateGroupModal';
import ChatWindow from '../../components/chatComponents/ChatWindowComponents/ChatWindow';
import ContactItempList from '../../components/contactComponents/ContactItemComponents/ContactItemList'; 
import ContactWindow from '../../components/contactComponents/ContactWindowComponents/ContactWindow';
import { useVideoCall } from '../hooks/useVideoCall';
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
  const currentCallToastId = useRef(null);
  const processedMessagesRef = useRef(new Set());
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  
  const myId = currentUser?.userId || currentUser?._id;
  
  // Hàm lấy danh sách bạn bè từ server
  const fetchFriends = async () => {
    if (!currentUser) return;
    try {
      // const token = localStorage.getItem('token');
      // console.log("Fetching friends with token:", token);
      const myId = currentUser.userId || currentUser._id;
      const response = await fetch(`http://localhost:5000/chat/users?currentUserId=${myId}`,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
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
  const refreshFriendData = useCallback(async () => {
    await fetchFriends();       
    await fetchRequestCounts();  
  }, [currentUser]);


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
      const response = await fetch(`http://localhost:5000/friend/friend/friend/accept`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
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
        // Giảm request count ngay lập tức
        setRequestCounts(prev => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          friend: Math.max(0, prev.friend - 1)
        }));
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
    
    socket.current = io('http://localhost:5000', {
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
  // Prevent duplicate message processing
  if (processedMessagesRef.current.has(msg._id)) {
    
    return;
  }
  processedMessagesRef.current.add(msg._id);

  //console.log("📨 Dữ liệu tin nhắn từ socket:", msg);
  setFriends(prevFriends => {
    const updatedFriends = prevFriends.map(f => {
      const senderId = (msg.sender?._id || msg.sender || "").toString(); 
      const receiverId = (msg.receiver?._id || msg.receiver || "").toString();
      const msgGroupId = msg.groupId?.toString();
      const friendId = f._id.toString();

      // Tin nhắn nhóm
      if (msgGroupId && friendId === msgGroupId) {
        const isCurrentChat = selectedUserRef.current?._id === msgGroupId;
        
        let unreadCount = f.unreadCount || 0;
        
        if (isCurrentChat) {
          // Đang xem chat này thì reset unreadCount
          unreadCount = 0;
        } else if (senderId !== myId && !msg.isDeleted) {
          // Tin từ người khác, chưa mở chat → cộng thêm 1
          unreadCount = (f.unreadCount || 0) + 1;
          console.log(`Nhóm ${f._id}: unreadCount ${f.unreadCount || 0} → ${unreadCount}`);
        }

        return {
          ...f,
          lastMessage: msg,
          lastSeen: msg.createdAt,
          unreadCount: unreadCount
        };
      }

      const isCloud = f.username === "Cloud của tôi";
      const isPartner = friendId === senderId || friendId === receiverId;

      if (!msgGroupId && isPartner) {
        // Nếu là Cloud
        if (isCloud && senderId === myId && receiverId === myId) {
          return { ...f, lastMessage: msg, lastSeen: msg.createdAt };
        }
        
        // Nếu là bạn bè
        if (!isCloud) {
          const isCurrentChat = selectedUserRef.current?._id === friendId;
          const isIncoming = senderId !== myId;
          
          let unreadCount = f.unreadCount || 0;
          
          if (isCurrentChat) {
            // Đang xem chat này thì reset unreadCount
            unreadCount = 0;
          } else if (isIncoming && !msg.isDeleted) {
            // Tin từ người khác, chưa mở chat → cộng thêm 1
            unreadCount = (f.unreadCount || 0) + 1;
            console.log(`📍 Bạn ${f.username} (${friendId}): unreadCount ${f.unreadCount || 0} → ${unreadCount}`);
          }

          return {
            ...f,
            lastMessage: msg,
            lastSeen: msg.createdAt,
            unreadCount: unreadCount
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
      // Cập nhật request counts ngay lập tức
      setRequestCounts(prev => ({
        ...prev,
        total: prev.total + 1,
        friend: prev.friend + 1
      }));
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
      console.log("Người bạn đã chấp nhận lời mời", data);
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
      console.log("Có thành viên mới join nhóm:", data);
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
      refreshFriendData();
    };

    // Hàm xử lý khi lời mời nhóm bị thu hồi
    const handleGroupInvitationCancelled = (data) => {
      console.log("Lời mời nhóm bị thu hồi", data);
      showFirendRequestNotification.success(`${data.inviterName} đã thu hồi lời mời tham gia nhóm`);
      // Giảm badge
      setRequestCounts(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        group: Math.max(0, prev.group - 1)
      }));
    };

    // Hàm cập nhật số lượng lời mời kết bạn
    const handleSentFriendRequest = (data) => {
      console.log("Đã gửi lời mời kết bạn", data);
      // Tăng badge ngay mà không cần fetch lại
      setRequestCounts(prev => ({
        ...prev,
        total: prev.total + 1,
        friend: prev.friend + 1
      }));
    };

    // Hàm cập nhật số lượng lời mời nhóm
    const handleSentGroupInvitation = (data) => {
      console.log("Đã gửi lời mời nhóm", data);
      // Tăng badge ngay
      setRequestCounts(prev => ({
        ...prev,
        total: prev.total + 1,
        group: prev.group + 1
      }));
    };

    // Hàm xử lý khi lời mời bị thu hồi
    const handleFriendRequestCancelled = (data) => {
      console.log("✗ Lời mời kết bạn bị thu hồi", data);
      showFirendRequestNotification.success(`${data.senderName} đã thu hồi lời mời kết bạn`);
      // Giảm badge
      setRequestCounts(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        friend: Math.max(0, prev.friend - 1)
      }));
    };

    // Hàm xử lý hủy kết bạn
    const handleUnfriendUpdated = async (data) => {
      console.log("Cập nhật hủy kết bạn", data);
      // Refresh lại toàn bộ danh sách để đồng bộ dữ liệu
      try {
        const myID = myId;
        const response = await fetch(`http://localhost:5000/chat/users?currentUserId=${myID}`,{
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        if (response.ok) {
          const newFriendsData = await response.json();
          const myCloud = {
            _id: myID,
            username: "Cloud của tôi",
            avatar: "https://img.icons8.com/fluency/48/cloud.png", 
          };
          const updatedFriendsList = [myCloud, ...newFriendsData];
          setFriends(updatedFriendsList);
          
          // Cập nhật selectedUser nếu đó là người vừa unfriend
          if (selectedUserRef.current?._id === data.friendId) {
            const updatedFriend = updatedFriendsList.find(f => f._id === data.friendId);
            if (updatedFriend) {
              setSelectedUser(updatedFriend);
            } else {
              const unfriendedUser = {
                ...selectedUserRef.current,
                isFriend: false
              };
              setSelectedUser(unfriendedUser);
            }
          }
        }
      } catch (err) {
        console.error("Lỗi refresh danh sách bạn:", err);
      }
      // Đóng profile modal
      setIsProfileModalOpen(false);
      // Hiển thị thông báo
      showConfirmDialogToast.success(`${data.friendName} đã hủy kết bạn với bạn`);
    };

    // Hàm xử lý rời nhóm
    const handleUserLeftGroup = (data) => {
      console.log("Thành viên đã rời nhóm:", data.groupId);
      refreshFriendData();
    };

    // Hàm xử lý cập nhật avatar nhóm
    const handleGroupAvatarUpdated = (data) => {
      console.log("Avatar nhóm đã được cập nhật:", data);
      const { groupId, updatedGroup } = data;
      
      // Merge với dữ liệu cũ để không mất các field
      setFriends(prev => 
        prev.map(f => {
          if (f._id === groupId) {
            return { ...f, ...updatedGroup };
          }
          return f;
        })
      );
      
      // Cập nhật modal nếu đang mở
      setGroupForModal(prev => 
        prev?._id === groupId ? { ...prev, ...updatedGroup } : prev
      );
      
      // Cập nhật selectedUser nếu là nhóm hiện tại
      setSelectedUser(prev => 
        prev?._id === groupId ? { ...prev, ...updatedGroup } : prev
      );
    };

    // Xử lý cuộc gọi đến
    const handleIncomingCall = (data) => {
      console.log(">>> Có cuộc gọi tới từ:", data.name);

      if (currentCallToastId.current) {
          console.log("⚠️ Đang có một cuộc gọi khác đang chờ, bỏ qua thông báo này.");
          return;
      }

      const toastId = showCallNotification.incomingCall(data, 
          () => {
              if (toastId) toast.dismiss(toastId);
              currentCallToastId.current = null; 

              const width = 800;
              const height = 600;
              const left = window.screen.width / 2 - width / 2;
              const top = window.screen.height / 2 - height / 2;

              if (data.signal) {
                  localStorage.setItem('pendingSignal', JSON.stringify(data.signal));
              }

              const callUrl = `/video-call?targetId=${data.from}&type=${data.type}&isInitiator=false&displayName=${encodeURIComponent(data.name)}&displayAvatar=${encodeURIComponent(data.avatar || '')}`;
              
              setTimeout(() => {
                  window.open(
                      callUrl,
                      'VideoCallWindow',
                      `width=${width},height=${height},left=${left},top=${top},menubar=no,status=no,toolbar=no`
                  );
              }, 100);
          },
          
          () => {
              if (toastId) toast.dismiss(toastId);
              currentCallToastId.current = null; 

              
              s.emit('end_call', { 
                  to: data.from, 
                  from: myId, 
                  reason: 'rejected' 
              });
          }
      );

      // Lưu lại toastId vào ref ngay khi vừa hiện thông báo
      currentCallToastId.current = toastId;
  };
    // Đăng ký sự kiện
    s.on('receive_friend_request', handleRequest);
    s.on('friend_request_accepted', handleAccepted);
    s.on('friend_accepted_success', handleFriendAcceptedSuccess);
    s.on('friend_request_cancelled', handleFriendRequestCancelled);
    s.on('receive_group_invite', handleGroupInvite);
    s.on('group_member_joined', handleGroupMemberJoined);
    s.on('group_joined_success', handleJoinedGroup);
    s.on('group_invitation_cancelled', handleGroupInvitationCancelled);
    s.on('group_avatar_updated', handleGroupAvatarUpdated);
    s.on('receive_message', (msg) => {
      console.log("📬 Received message event:", msg._id);
      updateFriendsWithLastMessage(msg);
      // Cập nhật lastSeen cho selectedUser để hiển thị thời gian hoạt động cuối
      if (selectedUserRef.current && (selectedUserRef.current._id === msg.sender || selectedUserRef.current._id === msg.groupId)) {
        setSelectedUser(prev => prev && prev._id === selectedUserRef.current._id ? { ...prev, lastSeen: msg.createdAt } : prev);
      }
    });
    s.on('recall_message', (msg) => {
      console.log("🔄 Recalled message:", msg._id);
      updateFriendsWithLastMessage(msg);
      if (selectedUserRef.current && (selectedUserRef.current._id === msg.sender || selectedUserRef.current._id === msg.groupId)) {
        setSelectedUser(prev => prev && prev._id === selectedUserRef.current._id ? { ...prev, lastSeen: msg.createdAt } : prev);
      }
    });
    s.on('new_group_created', handleNewGroup);
    s.on('group_created_update_converlist', handleNewGroup);  
    s.on('sent_friend_request', handleSentFriendRequest);
    s.on('sent_group_invitation', handleSentGroupInvitation);
    s.on('unfriend_updated', handleUnfriendUpdated);
    s.on('unfriend_action', handleUnfriendUpdated);
    s.on('unfriend_confirmed', handleUnfriendUpdated);
    s.on('user_left_group', handleUserLeftGroup);
    s.on('get_online_users', (users) => {
      console.log("Online users:", users);
      setOnlineUsers(users || []);
    });
    s.on('incoming_call', handleIncomingCall);
    
    
    return () => {
      s.off('receive_friend_request', handleRequest);
      s.off('friend_request_accepted', handleAccepted);
      s.off('friend_accepted_success', handleFriendAcceptedSuccess);
      s.off('friend_request_cancelled', handleFriendRequestCancelled);
      s.off('receive_group_invite', handleGroupInvite);
      s.off('group_member_joined', handleGroupMemberJoined);
      s.off('group_joined_success', handleJoinedGroup);
      s.off('group_invitation_cancelled', handleGroupInvitationCancelled);
      s.off('group_avatar_updated', handleGroupAvatarUpdated);
      s.off('get_online_users');
      s.off('receive_message', updateFriendsWithLastMessage);
      s.off('recall_message', updateFriendsWithLastMessage);
      s.off('new_group_created', handleNewGroup);
      s.off('group_created_update_converlist', handleNewGroup);
      s.off('sent_friend_request', handleSentFriendRequest);
      s.off('sent_group_invitation', handleSentGroupInvitation);
      s.off('unfriend_updated', handleUnfriendUpdated);
      s.off('unfriend_action', handleUnfriendUpdated);
      s.off('unfriend_confirmed', handleUnfriendUpdated);
      s.off('user_left_group', handleUserLeftGroup);
      s.off('incoming_call', handleIncomingCall);

    };
  }, [myId, groupForModal, selectedUser?._id , refreshFriendData]);
  //}, [myId]);

  // Vào phòng chat khi chọn người dùng
  useEffect(() => {
    if (socket.current && myId && selectedUser?._id) {
      const isGroup = selectedUser.isGroup || false;
      socket.current.emit('join_chat', { myId, friendId: selectedUser._id, isGroup: isGroup });
      console.log(`>>> Đã vào phòng ${isGroup ? 'NHÓM' : 'CÁ NHÂN'}: ${selectedUser._id}`);
    }
  }, [selectedUser?._id, myId]);
     
  // Hàm xử lý khi bắt đầu cuộc gọi video (có debounce để tránh spam)
  const lastCallTimeRef = useRef(0);
  const handleStartCall = (targetId, type, friendName) => {
    const now = Date.now();
    // Throttle: chỉ cho phép gọi sau 1 giây
    if (now - lastCallTimeRef.current < 1000) {
      console.log("⏱️ Spam protection: vui lòng chờ trước khi gọi lại");
      return;
    }
    lastCallTimeRef.current = now;

    const width = 800;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    // 1. Avatar của đối phương (người mình đang chat cùng)
    const targetAvatar = selectedUser?.avatar || '';

    // 2. Tạo URL thống nhất:
    // - displayName: Tên bạn bè (để hiện "Đang gọi cho...")
    // - displayAvatar: Avatar bạn bè
    const callUrl = `/video-call?targetId=${targetId}&type=${type}&isInitiator=true&displayName=${encodeURIComponent(friendName)}&displayAvatar=${encodeURIComponent(targetAvatar)}`;
    
    window.open(
        callUrl,
        'VideoCallPage',
        `width=${width},height=${height},left=${left},top=${top},menubar=no,status=no,toolbar=no`
    );
  };

  // Hàm lấy số lượng lời mời kết bạn
  const fetchRequestCounts = async () => {
    if (!myId) return;
    try {
        // Thêm timeout 10s cho mỗi request
        const fetchWithTimeout = (url, timeout = 10000) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            return fetch(url, {
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                credentials: 'include'
            })
                .finally(() => clearTimeout(timeoutId))
                .catch(err => {
                    if (err.name === 'AbortError') {
                        throw new Error('API timeout');
                    }
                    throw err;
                });
        };

        try {
            const [resFriend, resGroup] = await Promise.all([
                fetchWithTimeout(`http://localhost:5000/friend/friend/friend/received/${myId}`),
                fetchWithTimeout(`http://localhost:5000/friend/friend/group/pending/${myId}`)
            ]);

            let friendLen = 0;
            let groupLen = 0;
            
            // Parse friend requests
            if (resFriend.ok) {
                try {
                    const dataFriend = await resFriend.json();
                    friendLen = Array.isArray(dataFriend) ? dataFriend.length : 0;
                } catch (e) {
                    console.warn("Lỗi parse friend requests:", e);
                    friendLen = 0;
                }
            }
            
            // Parse group invites
            if (resGroup.ok) {
                try {
                    const dataGroup = await resGroup.json();
                    groupLen = Array.isArray(dataGroup) ? dataGroup.length : 0;
                } catch (e) {
                    console.warn("Lỗi parse group invites:", e);
                    groupLen = 0;
                }
            }

            setRequestCounts({
                total: friendLen + groupLen,
                friend: friendLen,
                group: groupLen
            });
        } catch (timeoutErr) {
            console.warn("API timeout khi lấy lời mời, bỏ qua:", timeoutErr.message);
            // Giữ nguyên requestCounts cũ, không update
        }
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
    try {
      const myRealId = currentUser.userId || currentUser._id;
      
      let endpoint = 'http://localhost:5000/chat/messages/mark-as-read';
      let body = { senderId: user._id, receiverId: myRealId };
      if (user.isGroup) {
        endpoint = 'http://localhost:5000/chat/messages/mark-group-as-read';
        body = { groupId: user._id, userId: myRealId };
      }
      await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
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
      const response = await fetch(`http://localhost:5000/friend/friend/friend/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          senderId: myId,
          receiverPhone: targetPhoneOrId
        })
      });
      console.log(`Gửi lời mời kết bạn đến ${targetPhoneOrId}...`, response);
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
        fetchRequestCounts();
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.log(err);
      return { success: false, message: "Lỗi kết nối server" };
    }
  };

  // Hàm xử lý hủy kết bạn
  const handleUnfriend = async (friend) => {
    showConfirmDialogToast.confirmGeneral(
      `Xác nhận xóa kết bạn với ${friend.username}?`,
      "Xóa nhận",
      "bg-red-600",
      async () => {
        try {
          const friendId = typeof friend === 'object' ? friend._id : friend;
          const response = await fetch(`http://localhost:5000/friend/friend/friend/unfriend`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ myId: myId, friendId: friendId })
          });

          if (response.ok) {
            const data = await response.json();
            showConfirmDialogToast.success("Đã xóa kết bạn thành công");
            
            // Đóng profile modal
            setIsProfileModalOpen(false);
            
            // Refresh lại toàn bộ danh sách bạn để sync đúng
            const myID = myId;
            const response2 = await fetch(`http://localhost:5000/chat/users?currentUserId=${myID}`,{
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include'
            });
            if (response2.ok) {
              const newFriendsData = await response2.json();
              const updatedFriend = newFriendsData.find(f => f._id === friendId);
              // Cập nhật selectedUser nếu đó là người vừa unfriend
              if (selectedUserRef.current?._id === friendId && updatedFriend) {
                setSelectedUser(updatedFriend);
              }
            }
            
            // Emit socket event
            if (socket.current) {
              socket.current.emit('unfriend_action', {
                myId: myId,
                friendId: friendId,
                myName: currentUser?.username,
                friendName: friend.username,
                systemMessage: data.systemMessage
              });
            }
          }
        } catch (error) {
          showConfirmDialogToast.error("Lỗi khi xóa kết bạn");
          console.log("Lỗi khi xóa kết bạn:", error);
        }
      }
    );
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
      const isInviteMode = !!groupData.groupId;

      if (isInviteMode) {
        
        const response = await fetch('http://localhost:5000/friend/friend/group/invite', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            groupId: groupData.groupId,
            inviterId: myId,
            inviteeIds: groupData.newMembers 
          })
        });

        const data = await response.json();

        if (response.ok) {
          
          if (socket.current) {
            socket.current.emit('send_group_invitation', {
              groupId: groupData.groupId,
              inviteeIds: groupData.newMembers,
              inviterId: myId,
              groupName: groupData.name
            });
          }
          showFirendRequestNotification.success("Đã gửi lời mời vào nhóm!");
          setIsCreateGroupOpen(false);
        } else {
          // Xử lý error từ backend
          showFirendRequestNotification.error(data.message || "Không thể gửi lời mời");
        }
      } else {
      
        const response = await fetch('http://localhost:5000/friend/friend/group/createGroup', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ ...groupData, adminId: myId })
        });
        
        if (response.ok) {
          const newGroup = await response.json();
          if (socket.current) socket.current.emit('create_group', newGroup);
          showFirendRequestNotification.success("Tạo nhóm thành công!");
          setIsCreateGroupOpen(false);
          refreshFriendData();
        } else {
          const data = await response.json();
          showFirendRequestNotification.error(data.message || "Không thể tạo nhóm");
        }
      }
    } catch (error) {
      console.log("Lỗi nhóm: ",error);
      showFirendRequestNotification.error("Thao tác thất bại");
    }
  };

  // Hàm rời nhóm
  const handleLeaveGroup = async (groupId) => {
  showConfirmDialogToast.confirmGeneral(
    "Bạn có chắc chắn muốn rời nhóm này?",
    "Rời nhóm",
    "bg-red-600",
    async () => {
      try {
        const response = await fetch(`http://localhost:5000/friend/friend/group/leave-group`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ userId: myId, groupId })
        });

        if (response.ok) {
          const result = await response.json();
          socket.current?.emit('leave_group', { 
            groupId, 
            userId: myId,
            systemMessage: result.systemMessage
          });

          showConfirmDialogToast.success("Đã rời nhóm");
          setSelectedUser(null);
          refreshFriendData();
        }
      } catch (error) {
        showConfirmDialogToast.error("Lỗi khi rời nhóm");
      }
    }
  );
};

  console.log("Render ChatPage với selectedUser:", selectedUser);

  // Hàm đăng xuất
  const handleLogout = () => {
    if (socket.current) {
      socket.current.disconnect();
    }
    // localStorage.removeItem('token');
    localStorage.removeItem('user');

    setFriends([]);
    setCurrentUser(null);
    navigate('/login'); 
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
        onLogout={handleLogout}
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
            onUnfriend={handleUnfriend}
            onLeaveGroup={handleLeaveGroup}
            onStartVideoCall={() => handleStartCall(selectedUser._id, 'video', selectedUser.username)}
            onStartVoiceCall={() => handleStartCall(selectedUser._id, 'voice', selectedUser.username)}
            onMessageSent={updateFriendsWithLastMessage}
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
        <GroupInfoModal 
        isOpen={isGroupInfoModalOpen}
        onClose={() => setIsGroupInfoModalOpen(false)}
        groupData={groupForModal}
        currentUserId={myId}
        friends={friends}
        onShowProfile={openSelectProfile}
        onAddMember={() => {
          setIsGroupInfoModalOpen(false);
          openAddMembersToGroup(groupForModal);
        }}
        onOpenCreateGroup={openCreateNewGroup}
        onGroupUpdated={(updatedGroup) => {
          // Merge với dữ liệu cũ để không mất các field
          const mergedGroup = { ...groupForModal, ...updatedGroup };
          setGroupForModal(mergedGroup);
          setFriends(prev => prev.map(f => f._id === updatedGroup._id ? mergedGroup : f));
          setSelectedUser(prev => prev?._id === updatedGroup._id ? mergedGroup : prev);
        }}
        socket={socket.current}
      />

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)}
        targetUser={userForModal}
        myInfo={currentUser}
        onUpdateSuccess={handleUpdateSuccess}
        onSendFriendRequest={handleSendFriendRequest}
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