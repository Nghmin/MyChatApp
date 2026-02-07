import React from 'react';
import { Paperclip, Clock, Check, AlertCircle, RotateCcw, MessageCircle } from 'lucide-react';
import { getTimelineLabel } from '../../../utils/TimelineChat';

const MessageList = ({ 
  messages, 
  myId, 
  selectedUser, 
  endOfMessagesRef, 
  onMediaClick, 
  onRecallMessage, 
  isCloud, 
  onSend,
  chatContainerRef, 
  onScroll, 
  isFetchingOlder,
  isLoadingMessages // Thêm prop này để kiểm soát trạng thái đang tải
}) => {
 
  const renderTextWithLinks = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const href = part.startsWith('http') ? part : `http://${part}`;
        return (
          <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 break-all" onClick={(e) => e.stopPropagation()}>
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Trạng thái Skeleton khi đang load tin nhắn (tránh nháy màn hình chào)
  if (isLoadingMessages) {
    return (
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#e2e9f1]">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}>
            <div className="w-32 h-10 bg-gray-300/40 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    const quickReplies = [
      { text: "Chào bạn! 👋", icon: "👋" },
      { text: "Rất vui được làm quen", icon: "🤝" },
      { text: "Bạn có đang ở đó không?", icon: "💬" }
    ];

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#e2e9f1] text-center">
        <div className="mb-4 relative">
          <img 
            src={selectedUser?.avatar || selectedUser?.image || "/default-avatar.png"} 
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            alt="User avatar" 
          />
          <div className="absolute bottom-0 right-1 bg-blue-500 p-1.5 rounded-full border-2 border-white text-white">
            <MessageCircle size={16} fill="currentColor" />
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-800">{selectedUser?.username || selectedUser?.name}</h3>
        <p className="text-sm text-gray-500 mt-1 mb-6 max-w-[250px]">
          {selectedUser?.isGroup ? "Nhóm vừa được tạo. Hãy gửi lời chào đến mọi người!" : "Chưa có tin nhắn nào ở đây. Hãy bắt đầu bằng một tin nhắn!"}
        </p>

        {!isCloud && (
          <div className="flex flex-wrap justify-center gap-2">
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => onSend(reply.text)}
                className="bg-white hover:bg-blue-50 text-blue-600 text-[13px] px-4 py-2 rounded-full border border-blue-100 shadow-sm transition-all hover:scale-105 active:scale-95 font-medium"
              >
                {reply.text}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={chatContainerRef} 
      onScroll={onScroll}    
      className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-[#e2e9f1]"
    >
      {/* Hiện Loading khi đang kéo thêm tin nhắn cũ */}
      {isFetchingOlder && (
        <div className="flex justify-center py-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {messages.map((msg, index) => {
        // Lấy ID người gửi
        const senderId = msg.sender?._id || msg.sender;
        const isMe = senderId === myId;
        const isDeleted = msg.isDeleted; 
        const getSenderData = () => {
          if (isMe) return { username: "Bạn", avatar: myId?.avatar }; // Hoặc lấy từ myInfo
          
          // Nếu msg.sender là object (đã populate)
          if (msg.sender?.username) return msg.sender;

          // Nếu msg.sender chỉ là ID (lỗi socket), ta tìm trong info của selectedUser (nếu là nhóm)
          if (selectedUser?.isGroup && selectedUser.members) {
            const member = selectedUser.members.find(m => (m._id || m) === senderId);
            if (member) return member;
          }
          
          return { username: "Thành viên", avatar: "/default-avatar.png" };
        };
        const senderData = getSenderData();
        // Logic hiển thị avatar
        const isNewBlock = index === 0 || (messages[index - 1].sender?._id || messages[index - 1].sender) !== senderId;
        const showAvatar = !isMe && isNewBlock;
        
        const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timelineLabel = getTimelineLabel(msg, messages[index - 1]);

        const isSystemMsg = msg.messageType === 'system';
        return (
          <React.Fragment key={msg._id || index}>
            {timelineLabel && (
              <div className="flex justify-center my-4">
                <span className="bg-gray-300/50 text-gray-700 text-[11px] px-3 py-0.5 rounded-full font-medium">
                  {timelineLabel}
                </span>
              </div>
            )}
            {isSystemMsg ? (
              <div className="flex justify-center my-2">
                <div className="bg-black/5 text-[12px] text-gray-500 px-4 py-1 rounded-full flex items-center gap-1.5 border border-gray-200/50 italic">
                  <span className="font-bold">
                    {isMe ? "Bạn" : (senderData.username || "Thành viên")}
                  </span> 
                  {msg.text}
                </div>
              </div>
            ) : (
                  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-start gap-2 mb-1`}>
                    {/* Avatar người gửi  */}
                    {!isMe && (
                      <div className="w-8 h-8 shrink-0">
                        {showAvatar && (
                          <img 
                            src={senderData?.avatar || "/default-avatar.png"} 
                            className="w-8 h-8 rounded-full object-cover shadow-sm border border-white" 
                            alt="avatar" 
                            title={senderData?.username}
                          />
                        )}
                      </div>
                    )}

                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      {/* Hiện tên người gửi nếu là Nhóm và không phải mình */}
                      {selectedUser?.isGroup && !isMe && showAvatar && (
                        <span className="text-[11px] text-gray-500 ml-1 mb-0.5 font-medium">
                          {senderData?.username || "Thành viên"}
                        </span>
                      )}

                      <div className={`group flex items-center gap-2 w-fit ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`relative px-3 py-1.5 rounded-xl shadow-sm border transition-all ${
                          isDeleted 
                            ? 'bg-gray-200/40 border-dashed border-gray-300' 
                            : isMe ? 'bg-[#e5efff] border-[#c6d9fb] rounded-tr-none' : 'bg-white border-transparent rounded-tl-none'
                        }`}>
                          
                          {isDeleted ? (
                            <p className="text-[13px] text-gray-400 italic py-1">Tin nhắn đã được thu hồi</p>
                          ) : (
                            <>
                              {msg.fileUrl && (
                                <div className="mb-1 mt-1">
                                  {msg.messageType === 'image' ? (
                                    <img src={msg.fileUrl} className="max-w-full max-h-60 rounded-lg cursor-pointer border object-cover" alt="sent content" onClick={() => onMediaClick(msg)} />
                                  ) : msg.messageType === 'video' ? (
                                    <video src={msg.fileUrl} controls className="max-w-full max-h-60 rounded-lg" onClick={() => onMediaClick(msg)} />
                                  ) : (
                                    <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-gray-50 rounded border text-blue-600 hover:bg-white transition-colors">
                                      <Paperclip size={18} />
                                      <span className="text-xs truncate max-w-[150px]">Tải tệp tin</span>
                                    </a>
                                  )}
                                </div>
                              )}

                              {msg.text && (msg.messageType === 'text' || !msg.fileUrl) && (
                                <p className="text-[14px] text-gray-800 break-words leading-relaxed pr-2">
                                  {renderTextWithLinks(msg.text)}
                                </p>
                              )}

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
                            </>
                          )}
                        </div>

                        {/* Nút thu hồi */}
                        {isMe && !isDeleted && !msg.isSending && (
                          <button 
                            onClick={() => onRecallMessage(msg._id)}
                            className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 hover:bg-white rounded-full text-gray-400 hover:text-red-500 shadow-sm border border-transparent hover:border-gray-200 bg-white/20"
                            title="Thu hồi tin nhắn"
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
          </React.Fragment>
        );
      })}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;