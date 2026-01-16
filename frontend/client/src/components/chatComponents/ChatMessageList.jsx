import React from 'react';
import { Paperclip, Clock, Check, AlertCircle } from 'lucide-react';
import { getTimelineLabel } from '../../utils/TimelineChat';

const MessageList = ({ messages, myId, selectedUser, endOfMessagesRef }) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-[#e2e9f1]">
      {messages.map((msg, index) => {
        const isMe = msg.sender === myId;
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

            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              {!isMe && (
                <div className="w-8 h-8 shrink-0">
                  {showAvatar && (
                    <img 
                      src={selectedUser.avatar || "/default-avatar.png"} 
                      className="w-8 h-8 rounded-full object-cover -translate-y-5 shadow-sm border border-white" 
                      alt="avatar" 
                    />
                  )}
                </div>
              )}
              
              <div className={`relative max-w-[70%] px-3 py-1.5 rounded-xl shadow-sm border ${
                isMe ? 'bg-[#e5efff] border-[#c6d9fb] rounded-tr-none' : 'bg-white border-transparent rounded-tl-none'
              }`}>
                {/* HIỂN THỊ MULTIMEDIA */}
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

                {/* HIỂN THỊ TEXT */}
                {msg.text && (msg.messageType === 'text' || !msg.fileUrl) && (
                  <p className="text-[14px] text-gray-800 break-words leading-relaxed pr-2">{msg.text}</p>
                )}

                {/* TRẠNG THÁI TIN NHẮN */}
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
  );
};

export default MessageList;