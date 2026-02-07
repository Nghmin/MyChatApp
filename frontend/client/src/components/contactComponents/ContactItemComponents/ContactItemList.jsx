import React from 'react';
import { User, Users, UserPlus, Group, Search, Send } from 'lucide-react';

const ContactItemList = ({ onSelectCategory, activeCategory, friendRequestCount, groupRequestCount}) => {
  const menuItems = [
    { id: 'friend-list', icon: <User size={20} />, label: 'Danh sách bạn bè', color: 'text-blue-500' },
    { id: 'group-list', icon: <Users size={20} />, label: 'Danh sách nhóm', color: 'text-orange-500' },
    { id: 'friend-requests', icon: <UserPlus size={20} />, label: 'Lời mời kết bạn', color: 'text-blue-600', count: friendRequestCount},
    { id: 'group-requests', icon: <Group size={20} />, label: 'Lời mời vào nhóm', color: 'text-green-600', count: groupRequestCount },
    { id: 'sent-requests',  icon: <Send size={20} /> , label: 'Lời mời đã gửi', color: 'text-gray-600', count: 0 },
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Search Header - Làm giống Zalo hơn một chút */}
      <div className="p-4 bg-white sticky top-0 z-10">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0068ff]" size={16} />
          <input 
            className="w-full pl-10 pr-3 py-2 bg-[#f1f2f4] focus:bg-white border border-transparent focus:border-[#0068ff] rounded-md text-[13px] outline-none transition-all"
            placeholder="Tìm kiếm bạn bè..."
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Render 4 mục chính */}
        <div className="py-2">
          {menuItems.map((item) => {
            const isActive = activeCategory === item.id;
            return (
              <div 
                key={item.id}
                onClick={() => onSelectCategory(item.id)}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all ${
                  isActive ? 'bg-[#e5efff] text-[#0068ff]' : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-[#0068ff]' : item.color}`}>
                    {item.icon}
                  </span>
                  <span className={`text-[14px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </div>
                {item.count > 0 && (
                  <span className="bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 font-bold shadow-sm">
                    {item.count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContactItemList;