import React from 'react';
import { MessageSquare, Users, Bell, Star, Settings, Cloud } from 'lucide-react';

const Sidebar = ({ avatar, onAvatarClick, activeTab = 'chat' }) => {
  const avatarUrl = avatar || "https://res.cloudinary.com/demo/image/upload/d_avatar.png/non_existent.jpg";

  return (
    <div className="w-16 bg-[#0091ff] flex flex-col items-center py-4 text-white shadow-inner">
      {/* Avatar User */}
      <div 
        className="w-12 h-12 bg-gray-200 rounded-full mb-8 cursor-pointer overflow-hidden border-2 border-white/30 hover:border-white transition-all active:scale-95"
        onClick={onAvatarClick}
      >
        <img 
          src={avatarUrl} 
          alt="User Avatar" 
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = "https://www.w3schools.com/howto/img_avatar.png" }}
        />
      </div>

      {/* Menu Icons */}
      <div className="flex flex-col space-y-2 w-full">
        {/* Chat Icon - Active State */}
        <div className={`p-3 cursor-pointer flex justify-center transition-colors ${activeTab === 'chat' ? 'bg-[#0068ff]' : 'hover:bg-white/10'}`}>
          <MessageSquare size={26} strokeWidth={activeTab === 'chat' ? 2.5 : 1.5} />
        </div>

        {/* Danh bạ */}
        <div className={`p-3 cursor-pointer flex justify-center transition-colors ${activeTab === 'contact' ? 'bg-[#0068ff]' : 'hover:bg-white/10'}`}>
          <Users size={26} strokeWidth={activeTab === 'contact' ? 2.5 : 1.5} />
        </div>

        {/* Thông báo */}
        <div className="p-3 cursor-pointer flex justify-center hover:bg-white/10 transition-colors">
          <Bell size={26} strokeWidth={1.5} />
        </div>
        
        {/* Tin nhắn đánh dấu */}
        <div className="p-3 cursor-pointer flex justify-center hover:bg-white/10 transition-colors">
          <Star size={26} strokeWidth={1.5} />
        </div>
      </div>

      {/* Bottom Icons */}
      <div className="mt-auto flex flex-col items-center space-y-4">
        {/* Lưu trữ Cloud (Zalo thường có cái này) */}
        <div className="p-3 cursor-pointer flex justify-center hover:bg-white/10 transition-colors w-full">
          <Cloud size={24} strokeWidth={1.5} />
        </div>

        <div className="p-3 cursor-pointer flex justify-center hover:bg-white/10 transition-colors w-full">
          <Settings size={26} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;