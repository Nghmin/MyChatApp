import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import ChatMessageList from './ChatMessageList';
import ChatSidebarRight from './ChatSidebarRight';
import MediaViewerLayer from '../ChatModals/MediaViewerLayer';
import { showConfirmDialogToast } from '../../../utils/toastHelpers';

const ChatWindow = ({ selectedUser, myInfo, onToggleSidebar, isSidebarOpen, onShowSelectProfile, socket, onlineUsers, onSendFriendRequest, onOpenCreateNewGroup, onOpenAddMembersToGroup }) => {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true); 
  const [isRecalling, setIsRecalling] = useState(false); 
  
  const endOfMessagesRef = useRef(null);
  const chatContainerRef = useRef(null); 
  
  const [previewMedia, setPreviewMedia] = useState(null);
  const [isFetchingOlder, setIsFetchingOlder] = useState(false); 
  const [hasMore, setHasMore] = useState(true); 

  const myId = myInfo?.userId || myInfo?._id;
  const isCloud = selectedUser?.username === "Cloud của tôi";
  const limit = 20;

  //  Hàm lấy tin nhắn 
  const fetchMessages = useCallback(async (isLoadMore = false) => {
    if (!selectedUser?._id || !myId) return;

    if (!isLoadMore) setIsLoadingMessages(true);

    try {
      const token = localStorage.getItem('token');
      const isGroup = selectedUser.isGroup;
      const currentSkip = isLoadMore ? messages.length : 0;

      const url = isGroup 
        ? `http://127.0.0.1:5000/chat/messages/${myId}/${selectedUser._id}?isGroup=true&limit=${limit}&skip=${currentSkip}`
        : `http://127.0.0.1:5000/chat/messages/${myId}/${selectedUser._id}?limit=${limit}&skip=${currentSkip}`;

      const response = await fetch(url, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      if (response.ok) {
        const rawData = await response.json();
        const data = [...rawData].reverse();
        // Nếu số tin trả về ít hơn limit tức là đã hết tin cũ
        if (data.length < limit) setHasMore(false);
        else setHasMore(true);

        if (isLoadMore) {
          // Lưu lại chiều cao trước khi thêm tin mới để giữ vị trí cuộn
          const container = chatContainerRef.current;
          const oldScrollHeight = container.scrollHeight;
          const oldScrollTop = container.scrollTop;
          setMessages((prev) => [...data, ...prev]);

          // Giữ màn hình đứng yên tại vị trí đang đọc sau khi load tin cũ
          requestAnimationFrame(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight;
              container.scrollTop = (newScrollHeight - oldScrollHeight) + oldScrollTop;
            }
          });
        } else {
          // Load tin nhắn lần đầu khi vào chat
          setMessages(data);
          setTimeout(() => {
            endOfMessagesRef.current?.scrollIntoView({ behavior: "auto" });
          }, 50);
        }
      }
    } catch (error) { 
      console.error("Lỗi fetch messages:", error);
    } finally {
      setIsFetchingOlder(false);
      setIsLoadingMessages(false);
    }
  }, [selectedUser?._id, myId, messages.length]);

  // Lắng nghe socket
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage) => {
      const senderId = newMessage.sender?._id || newMessage.sender;
      if (senderId === myId && newMessage.messageType !== 'system') return;

      const isCurrentGroup = newMessage.groupId && newMessage.groupId === selectedUser?._id;
      const isCurrentPrivate = !newMessage.groupId && (senderId === selectedUser?._id || newMessage.receiver === selectedUser?._id);

      if (isCurrentGroup || isCurrentPrivate) {
        setMessages((prev) => {
          if (prev.find(m => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
        setTimeout(() => {
          endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    };

    const handleRecallUpdate = (recalledMessage) => {
      setMessages((prev) => 
        prev.map(msg => msg._id === recalledMessage._id ? recalledMessage : msg)
      );
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('recall_message', handleRecallUpdate);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('recall_message', handleRecallUpdate);
    };
  }, [selectedUser?._id, myId, socket]);

  // Effect khi đổi người chat: Reset và fetch lại từ đầu
  useEffect(() => {
    setMessages([]);
    setHasMore(true);
    fetchMessages(false);
  }, [selectedUser?._id]);

  // Hàm xử lý khi người dùng cuộn lên đỉnh
  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop <= 150 && hasMore && !isFetchingOlder && messages.length >= limit) {
      setIsFetchingOlder(true);
      fetchMessages(true);
    }
  };

  // Logic gửi media
  const handleSendMedia = async (url, type, publicId) => { 
    if (!selectedUser || !url) return;
    const isGroup = selectedUser.isGroup;
    const optimisticId = Date.now().toString();

    // Tạo tin nhắn giả (Optimistic UI)
    const optimisticMessage = {
      _id: optimisticId,
      sender: { _id: myId, username: myInfo.username, avatar: myInfo.avatar }, 
      receiver: isGroup ? null : selectedUser._id,
      groupId: isGroup ? selectedUser._id : null,
      fileUrl: url,
      filePublicId: publicId,
      messageType: type,
      text: type === 'image' ? '[Hình ảnh]' : '[Tệp tin]',
      isSending: true,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/chat/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sender: myId,
          receiver: isGroup ? null : selectedUser._id, 
          groupId: isGroup ? selectedUser._id : null, 
          fileUrl: url,
          filePublicId: publicId,
          messageType: type,
          text: type === 'image' ? 'image' : 'file'
        }),
      });

      if (response.ok) {
        const savedMessage = await response.json();
        socket?.emit('send_message', savedMessage);
        setMessages((prev) => 
          prev.map(msg => msg._id === optimisticId ? savedMessage : msg)
        );
      }
    } catch (error) {
      setMessages((prev) => 
        prev.map(msg => msg._id === optimisticId ? { ...msg, isSending: false, error: true } : msg)
      );
    }
  };

  // Hàm gửi tin nhắn văn bản
  const handleSend = async (content = text) => {
    const msgText = content.trim();
    if (!msgText || !selectedUser) return;
    if (content === text) setText('');

    const isGroup = selectedUser.isGroup;
    const optimisticId = Date.now().toString();
    
    const optimisticMessage = {
        _id: optimisticId, 
        sender: { _id: myId, username: myInfo.username, avatar: myInfo.avatar },
        receiver: isGroup ? null : selectedUser._id,
        groupId: isGroup ? selectedUser._id : null,
        text: msgText,
        isSending: true,
        createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/chat/messages', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            sender: myId, 
            receiver: isGroup ? null : selectedUser._id, 
            groupId: isGroup ? selectedUser._id : null, 
            text: msgText 
          }),
      });

      if (response.ok) {
        const savedMessage = await response.json();
        socket?.emit('send_message', savedMessage);
        setMessages((prev) => prev.map(msg => msg._id === optimisticId ? savedMessage : msg));
      }
    } catch (error) {
      setMessages((prev) => prev.map(msg => msg._id === optimisticId ? { ...msg, isSending: false, error: true } : msg));
    }
  };

  // Hàm thu hồi tin nhắn
  const handleRecallMessage = async (messageId) => {
    if (isRecalling) return;
    setIsRecalling(true);

    showConfirmDialogToast.confirmRecall(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:5000/chat/messages/recall', {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ messageId, userId: myId }),
        });

        if (response.ok) {
          const updatedMessage = await response.json();
          setMessages((prev) => 
            prev.map(msg => msg._id === messageId ? updatedMessage : msg)
          );

          socket?.emit('recall_message', {
            ...updatedMessage,
            receiverId: selectedUser._id 
          });
          showConfirmDialogToast.success("Đã thu hồi tin nhắn");
        }
      } catch (error) {
        showConfirmDialogToast.error("Không thể thu hồi tin nhắn");
      } finally {
        setIsRecalling(false);
      }
    }, () => {
      setIsRecalling(false);
    });
  };

  if (!selectedUser) return <div className="flex-1 bg-[#f0f2f5]" />;

  return (
    <div className="flex-1 flex overflow-hidden h-full">
      
      {/* Cột trái khung chat */}
      <div className="flex-1 bg-[#e2e9f1] flex flex-col h-full overflow-hidden border-r border-gray-200">
        <ChatHeader 
          selectedUser={selectedUser} 
          onShowSelectProfile={onShowSelectProfile}
          onlineUsers={onlineUsers}
          onToggleSidebar={onToggleSidebar}
        />

        <ChatMessageList 
          messages={messages} 
          myId={myId} 
          selectedUser={selectedUser} 
          endOfMessagesRef={endOfMessagesRef} 
          chatContainerRef={chatContainerRef} 
          onScroll={handleScroll}             
          isFetchingOlder={isFetchingOlder}   
          isLoadingMessages={isLoadingMessages}
          onMediaClick={(previewMedia) => setPreviewMedia(previewMedia)}
          onRecallMessage={handleRecallMessage}
          isCloud = {isCloud}
          onSend={handleSend}
        />

        <ChatInput 
          text={text}
          setText={setText}
          onSend={handleSend}
          onSendMedia={handleSendMedia}
          placeholder={`Nhập tin nhắn tới ${selectedUser.username}`}
        />
      </div>

      {/* Cột phải sidebar open */}
      {isSidebarOpen && (
        <ChatSidebarRight 
          selectedUser={selectedUser} 
          messages={messages}
          onClose={onToggleSidebar}
          onMediaClick={(previewMedia) => setPreviewMedia(previewMedia)}
          onOpenCreateNewGroup={onOpenCreateNewGroup}
          onOpenAddMembersToGroup={onOpenAddMembersToGroup}
        />
      )}
      
      {/* Media Viewer Layer */}
      {previewMedia && (
      <MediaViewerLayer 
        media={previewMedia} 
        mediaList={messages.filter(msg => 
          msg.fileUrl && (msg.messageType === 'image' || msg.messageType === 'video')
        )}
        onSelectMedia={(m) => setPreviewMedia(m)}
        onClose={() => setPreviewMedia(null)} 
      />
    )}
    </div>
  );
};

export default ChatWindow;