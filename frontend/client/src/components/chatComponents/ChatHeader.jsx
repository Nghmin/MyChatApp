import React from 'react';
import { Search, Phone, Video, PanelRight } from 'lucide-react';
import { TimeLastSeen } from '../../utils/TimeLastSeen';
const ChatHeader = ({ selectedUser, onShowFriendProfile,onlineUsers = [] ,onToggleSidebar}) => {
  if (!selectedUser) return null;
  const isOnline = onlineUsers.includes(selectedUser._id);
  const isCloud = selectedUser.username === "Cloud của tôi";
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-10 shadow-sm">
      <div 
        onClick={() => onShowFriendProfile(selectedUser)} 
        className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors"
      >
        <div className="relative">
          <img 
            src={selectedUser.avatar || "/default-avatar.png"} 
            className="w-10 h-10 rounded-full object-cover border" 
            alt="avatar" 
          />
          {/* Chấm xanh thông báo online ngay trên avatar cho đồng bộ */}
          {isOnline && !isCloud &&(
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          )}
      </div>

        <div className="ml-3">
          <h3 className="font-bold text-[15px] text-gray-800">{selectedUser.username}</h3>
          
          {/* Hiển thị trạng thái động */}
          <div className="flex items-center gap-1">
            {isOnline ? (
              <p className="text-[12px] text-green-500 font-medium animate-pulse">
                Đang hoạt động
              </p>
            ) : (
              <p className="text-[12px] text-gray-400 italic">
                {!isCloud && TimeLastSeen(selectedUser.lastMessageAt)}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"><Search size={20} /></button>
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"><Phone size={20} /></button>
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"><Video size={20} /></button>
        <button 
            onClick={onToggleSidebar} 
            className={`p-2 rounded-md transition-colors ${
                'text-gray-500 hover:bg-gray-100'
            }`}
            title="Thông tin hội thoại"
            >
            <PanelRight size={22} />
        </button>
      </div>
    </div>
  );
};

export default React.memo(ChatHeader);