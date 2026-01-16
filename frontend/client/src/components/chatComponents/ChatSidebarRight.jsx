import React from 'react';
import { X, Image as ImageIcon, Video, FileText } from 'lucide-react';

const ChatSidebarRight = ({ selectedUser, messages, onClose }) => {
  // Lọc ra danh sách media đã gửi
  const sharedMedia = messages.filter(msg => msg.fileUrl && (msg.messageType === 'image' || msg.messageType === 'video'));

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
      {/* Header của Sidebar */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100">
        <span className="font-bold text-gray-700">Thông tin hội thoại</span>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {/* Avatar & Tên */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src={selectedUser.avatar || "/default-avatar.png"} 
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 shadow-sm mb-3"
            alt="avatar"
          />
          <h2 className="font-bold text-lg text-gray-800">{selectedUser.username}</h2>
          <p className="text-sm text-gray-500 italic">@{selectedUser.username.toLowerCase()}</p>
        </div>

        {/* Mục Ảnh/Video đã gửi */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold text-sm px-1">
            <ImageIcon size={18} />
            <span>Ảnh/Video đã gửi ({sharedMedia.length})</span>
          </div>

          {sharedMedia.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {sharedMedia.slice(0, 9).map((media, idx) => (
                <div key={idx} className="aspect-square bg-gray-100 rounded-sm overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                  {media.messageType === 'image' ? (
                    <img src={media.fileUrl} className="w-full h-full object-cover" alt="shared" onClick={() => window.open(media.fileUrl)} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center relative bg-black">
                       <Video size={16} className="text-white" />
                       <video src={media.fileUrl} className="w-full h-full object-cover opacity-50" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-lg">Chưa có ảnh/video nào</p>
          )}
        </div>

        {/* Các cài đặt khác (Demo) */}
        <div className="space-y-1">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2">
                <FileText size={16} /> File đã gửi
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors">
                Chặn người dùng này
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebarRight;