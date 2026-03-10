import React, { useMemo , useEffect, useState, useRef , } from 'react';
import { MessageSquare, Users, Settings, Cloud , LogOut , UserCog} from 'lucide-react';

const Sidebar = ({ avatar, onAvatarClick, requestCounts, activeTab = 'chat', onTabChange, friends = [] , onLogout}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [])
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
        {/* Settings*/}
        <div className="relative w-full" ref={settingsRef}>
          <div 
            className={`p-4 cursor-pointer flex justify-center transition-colors w-full ${showSettingsMenu ? 'bg-black/20' : 'hover:bg-black/10'}`} 
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            title="Cài đặt"
          >
            <Settings size={24} strokeWidth={1.5} className={showSettingsMenu ? 'rotate-45 transition-transform' : ''} />
          </div>
          {showSettingsMenu && (
            <div className="absolute bottom-0 left-full ml-2 mb-2 w-48 bg-white rounded-lg shadow-xl py-2 text-gray-800 z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200 border border-gray-100">
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Cài đặt tài khoản
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm">
                <UserCog size={18} className="text-gray-500" />
                Cài đặt hệ thống
              </button>
              <div className="h-px bg-gray-100 my-1" />
              <button 
                onClick={() => {
                  setShowSettingsMenu(false);
                  onLogout && onLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-sm text-red-600 font-medium"
              >
                <LogOut size={18} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;