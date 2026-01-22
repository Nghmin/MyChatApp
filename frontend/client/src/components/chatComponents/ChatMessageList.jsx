import React from 'react';
import { Paperclip, Clock, Check, AlertCircle, RotateCcw } from 'lucide-react';
import { getTimelineLabel } from '../../utils/TimelineChat';

const MessageList = ({ messages, myId, selectedUser, endOfMessagesRef, onMediaClick, onRecallMessage }) => {
  const renderTextWithLinks = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const href = part.startsWith('http') ? part : `http://${part}`;
        return (
          <a 
            key={index} 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 underline hover:text-blue-800 break-all"
            onClick={(e) => e.stopPropagation()} 
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-[#e2e9f1]">
      {messages.map((msg, index) => {
        const isMe = msg.sender === myId;
        const isDeleted = msg.isDeleted; 
        const showAvatar = !isMe && (index === 0 || messages[index - 1].sender !== msg.sender);
        const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timelineLabel = getTimelineLabel(msg, messages[index - 1]);

        return (
          <React.Fragment key={msg._id || index}>
            {timelineLabel && (
              <div className="flex justify-center my-4">
                <span className="bg-gray-300/50 text-gray-700 text-[11px] px-3 py-0.5 rounded-full font-medium">
                  {timelineLabel}
                </span>
              </div>
            )}

            {/* Container bao toàn bộ dòng để căn trái/phải */}
            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              
              {!isMe && (
                <div className="w-8 h-8 shrink-0 mb-1">
                  {showAvatar && (
                    <img 
                      src={selectedUser.avatar || "/default-avatar.png"} 
                      className="w-8 h-8 rounded-full object-cover shadow-sm border border-white" 
                      alt="avatar" 
                    />
                  )}
                </div>
              )}

              <div className={`group flex items-center gap-2 w-fit ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Khung nội dung tin nhắn */}
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
          </React.Fragment>
        );
      })}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;