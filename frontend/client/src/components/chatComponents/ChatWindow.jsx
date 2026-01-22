import React, { useState, useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import ChatMessageList from './ChatMessageList';
import ChatSidebarRight from './ChatSidebarRight';
import MediaViewerLayer from './MediaViewerLayer';
const ChatWindow = ({ selectedUser, myInfo, onToggleSidebar, isSidebarOpen,onShowFriendProfile, socket ,onlineUsers,onSendFriendRequest }) => {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const endOfMessagesRef = useRef(null);
  const [previewMedia, setPreviewMedia] = useState(null);
  const myId = myInfo?.userId || myInfo?._id;

  useEffect(() => {
    if (!socket) return;
    const handleReceiveMessage = (newMessage) => {
      if (newMessage.sender === myId) return;
      if (newMessage.sender === selectedUser?._id) {
        setMessages((prev) => {
          if (prev.find(m => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
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
  }, [selectedUser?._id, myId,socket]);

  useEffect(() => {
    if (!selectedUser?._id || !myId) return;
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:5000/chat/messages/${myId}/${selectedUser._id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(Array.isArray(data) ? data : []);
        }
      } catch (error) { setMessages([]); }
    };
    fetchMessages();
  }, [selectedUser?._id, myId]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleSendMedia = async (url, type) => {
    if (!selectedUser || !url) return;

    const optimisticId = Date.now().toString();
    const optimisticMessage = {
      _id: optimisticId,
      sender: myId,
      receiver: selectedUser._id,
      fileUrl: url,
      filePublicId: publicId,
      messageType: type,
      text: type === 'image' ? 'image' : 'file',
      isSending: true,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/chat/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' ,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sender: myId,
          receiver: selectedUser._id,
          fileUrl: url,
          filePublicId: publicId,
          messageType: type,
          text: type === 'image' ? 'image' : 'file'
        }),
      });

      if (response.ok) {
        const savedMessage = await response.json();
        socket.emit('send_message', savedMessage);
        // Cập nhật lại tin nhắn thật từ server
        setMessages((prev) => prev.map(msg => msg._id === optimisticId ? savedMessage : msg));
      }
    } catch (error) {
      setMessages((prev) => prev.map(msg => msg._id === optimisticId ? { ...msg, isSending: false, error: true } : msg));
    }
  };
  const handleSend = async (content = text) => {
    const msgText = content.trim();
    if (!msgText || !selectedUser) return;
    if (content === text) setText('');

    const optimisticId = Date.now().toString();
    const optimisticMessage = {
        _id: optimisticId, 
        sender: myId,
        receiver: selectedUser._id,
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
          body: JSON.stringify({ sender: myId, receiver: selectedUser._id, text: msgText }),
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
  const handleRecallMessage = async (messageId) => {
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
      }
    } catch (error) {
      console.error("Lỗi thu hồi tin nhắn:", error);
    }
  };

  if (!selectedUser) return <div className="flex-1 bg-[#f0f2f5]" />;

  return (
    <div className="flex-1 flex overflow-hidden h-full">
      
      {/* Cột trái khung chat */}
      <div className="flex-1 bg-[#e2e9f1] flex flex-col h-full overflow-hidden border-r border-gray-200">
        <ChatHeader 
          selectedUser={selectedUser} 
          onShowFriendProfile={onShowFriendProfile}
          onlineUsers={onlineUsers}
          onToggleSidebar={onToggleSidebar}
        />

        <ChatMessageList 
          messages={messages} 
          myId={myId} 
          selectedUser={selectedUser} 
          endOfMessagesRef={endOfMessagesRef} 
          onMediaClick={(previewMedia) => setPreviewMedia(previewMedia)}
          onRecallMessage={handleRecallMessage}
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