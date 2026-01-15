import React, { useState, useEffect, useRef } from 'react';
import { getTimelineLabel } from '../../utils/TimelineChat';
import { 
  Send, Phone, Video, Search, PanelRight, Clock, Check, 
  AlertCircle, Smile, Paperclip, Image as ImageIcon, 
  FileVideo, ThumbsUp 
} from 'lucide-react';
import { io } from 'socket.io-client';

import ChatUploadTool from './ChatUploadTool';

const socket = io('http://localhost:5000', {
  path: '/socket.io',
  transports: ['websocket']
});

const ChatWindow = ({ selectedUser, myInfo, onShowFriendProfile }) => {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const endOfMessagesRef = useRef(null);
  const myId = myInfo?.userId || myInfo?._id;

  useEffect(() => {
    if (myId && selectedUser?._id) {
      socket.emit('join_chat', { myId, friendId: selectedUser._id });
    }
  }, [selectedUser?._id, myId]);

  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      if (newMessage.sender === myId) return;
      if (newMessage.sender === selectedUser?._id) {
        setMessages((prev) => {
          if (prev.find(m => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
      }
    };
    socket.on('receive_message', handleReceiveMessage);
    return () => socket.off('receive_message', handleReceiveMessage);
  }, [selectedUser?._id, myId]);

  useEffect(() => {
    if (!selectedUser?._id || !myId) return;
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/messages/${myId}/${selectedUser._id}`, {
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
      messageType: type,
      text: type === 'image' ? 'image' : 'file',
      isSending: true,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' ,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sender: myId,
          receiver: selectedUser._id,
          fileUrl: url,
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
      const response = await fetch('http://localhost:5000/api/messages', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ sender: myId, receiver: selectedUser._id, text: msgText }),
      });

      if (response.ok) {
        const savedMessage = await response.json();
        socket.emit('send_message', savedMessage);
        setMessages((prev) => prev.map(msg => msg._id === optimisticId ? savedMessage : msg));
      }
    } catch (error) {
      setMessages((prev) => prev.map(msg => msg._id === optimisticId ? { ...msg, isSending: false, error: true } : msg));
    }
  };

  if (!selectedUser) return <div className="flex-1 bg-[#f0f2f5]" />;

  return (
    <div className="flex-1 bg-[#e2e9f1] flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-10 shadow-sm">
        <div onClick={onShowFriendProfile} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors">
          <img src={selectedUser.avatar || "/default-avatar.png"} className="w-10 h-10 rounded-full object-cover border" alt="avatar" />
          <div className="ml-3">
            <h3 className="font-bold text-[15px] text-gray-800">{selectedUser.username}</h3>
            <p className="text-[12px] text-green-500 font-medium italic">Đang hoạt động</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"><Search size={20} /></button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"><Phone size={20} /></button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"><Video size={20} /></button>
          <button onClick={onShowFriendProfile} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"><PanelRight size={22} /></button>
        </div>
      </div>

      {/* Khung Tin Nhắn */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-[#e2e9f1]">
        {messages.map((msg, index) => {
          const isMe = msg.sender === myId;
          const showAvatar = !isMe && (index === 0 || messages[index - 1].sender !== msg.sender);
          const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const timelineLabel = getTimelineLabel(msg, messages[index - 1]);

          return (
            <React.Fragment key={msg._id}>
              {timelineLabel && (
                <div className="flex justify-center my-4">
                  <span className="bg-gray-300/50 text-gray-700 text-[11px] px-3 py-0.5 rounded-full font-medium">{timelineLabel}</span>
                </div>
              )}

              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {!isMe && (
                  <div className="w-8 h-8 shrink-0">
                    {showAvatar && <img src={selectedUser.avatar || "/default-avatar.png"} className="w-8 h-8 rounded-full object-cover -translate-y-5" alt="avatar" />}
                  </div>
                )}
                
                <div className={`relative max-w-[70%] px-3 py-1.5 rounded-xl shadow-sm border ${
                  isMe ? 'bg-[#e5efff] border-[#c6d9fb] rounded-tr-none' : 'bg-white border-transparent rounded-tl-none'
                }`}>
                  {/* MULTIMEDIA */}
                  {msg.fileUrl && (
                    <div className="mb-1 mt-1">
                      {msg.messageType === 'image' ? (
                        <img 
                          src={msg.fileUrl} 
                          className="max-w-full max-h-60 rounded-lg cursor-pointer border object-cover" 
                          alt="sent content"
                          onClick={() => window.open(msg.fileUrl, '_blank')}
                        />
                      ) : msg.messageType === 'video' ? (
                        <video src={msg.fileUrl} controls className="max-w-full max-h-60 rounded-lg" />
                      ) : (
                        <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-gray-50 rounded border text-blue-600">
                          <Paperclip size={18} />
                          <span className="text-xs truncate max-w-[150px]">Tải tệp tin</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* hiển thịTEXT */}
                  {msg.text && (msg.messageType === 'text' || !msg.fileUrl) && (
                    <p className="text-[14px] text-gray-800 break-words leading-relaxed pr-2">{msg.text}</p>
                  )}

                  {/* Footer tin nhắn (Time & Status) */}
                  <div className={`flex items-center justify-end mt-0.5 gap-1 ${isMe ? 'text-blue-500' : 'text-gray-400'}`}>
                    <span className="text-[10px] opacity-70">{time}</span>
                    {isMe && (
                      <span className="shrink-0">
                        {msg.isSending ? <Clock size={10} className="animate-spin" /> : 
                         msg.error ? <AlertCircle size={10} className="text-red-500" /> : 
                         <Check size={12} className="text-blue-600 font-bold" />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200">
        <ChatUploadTool onUploadSuccess={handleSendMedia} />
        <div className="flex items-center gap-1 px-3 py-1">
          <input 
            className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] py-2 outline-none"
            placeholder={`Nhập tin nhắn tới ${selectedUser.username}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={() => handleSend()} disabled={!text.trim()} className={`p-2 ${text.trim() ? 'text-[#0068ff]' : 'text-gray-300'}`}>
            <Send size={24} fill={text.trim() ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;