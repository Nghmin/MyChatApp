import React, { useMemo } from 'react';
import { MessageSquare, Users, Settings, Cloud } from 'lucide-react';

const Sidebar = ({ avatar, onAvatarClick, requestCounts, activeTab = 'chat', onTabChange, friends = [] }) => {
  const avatarUrl = avatar || "https://res.cloudinary.com/demo/image/upload/d_avatar.png/non_existent.jpg";
  const totalUnreadMessages = useMemo(() => {
    return friends.reduce((sum, friend) => sum + (friend.unreadCount || 0), 0);
  }, [friends]);

  const menuItems = [
    { id: 'chat', icon: MessageSquare, label: 'Tin nhắn', count: totalUnreadMessages },
    { id: 'contact', icon: Users, label: 'Danh bạ', count: requestCounts },
  ];

  return (
    <div className="w-16 bg-[#0091ff] flex flex-col items-center py-4 text-white shadow-inner shrink-0 h-full">
      {/* Avatar User */}
      <div 
        className="w-12 h-12 bg-gray-200 rounded-full mb-6 cursor-pointer overflow-hidden border-2 border-white/30 hover:border-white transition-all active:scale-95 shadow-md"
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
      <div className="flex flex-col w-full">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <div 
              key={item.id}
              onClick={() => onTabChange && onTabChange(item.id)}
              className={`group relative p-4 cursor-pointer flex justify-center transition-all duration-200 
                ${isActive ? 'bg-[#0068ff]' : 'hover:bg-black/10'}`}
              title={item.label}
            >
              <div className="relative">
                <Icon 
                  size={26} 
                  strokeWidth={isActive ? 2.5 : 1.5} 
                  className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                />
                
                {item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-[#0091ff] px-1 animate-bounce-slow">
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                )}
              </div>
              
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_white]" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col items-center w-full">
        <div className="p-4 cursor-pointer flex justify-center hover:bg-black/10 transition-colors w-full" title="Cloud của tôi">
          <Cloud size={24} strokeWidth={1.5} />
        </div>
        <div className="p-4 cursor-pointer flex justify-center hover:bg-black/10 transition-colors w-full" title="Cài đặt">
          <Settings size={24} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;