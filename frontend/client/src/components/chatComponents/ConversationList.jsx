import React from 'react';
import { Search, UserPlus } from 'lucide-react';

const ConversationList = ({ friends, onSelectUser, selectedId }) => {
  
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header Tìm kiếm */}
      <div className="p-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search size={16} />
            </span>
            <input 
              className="w-full pl-9 pr-3 py-1.5 bg-[#f1f2f4] border-none rounded-md text-[13px] outline-none focus:ring-1 focus:ring-blue-400 placeholder-gray-500"
              placeholder="Tìm kiếm"
            />
          </div>
          <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors" title="Thêm bạn">
            <UserPlus size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Tab Phân loại (Zalo style) */}
        <div className="flex gap-4 mt-4 text-[13px] font-medium text-gray-500 px-1 border-b border-gray-100">
          <button className="pb-2 border-b-2 border-[#0068ff] text-[#0068ff]">Tất cả</button>
          <button className="pb-2 border-b-2 border-transparent hover:text-gray-800">Chưa đọc</button>
        </div>
      </div>

      {/* Danh sách bạn bè */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {friends && friends.length > 0 ? (
          friends.map((user) => {
            const isSelected = selectedId === user._id;
            
            return (
              <div 
                key={user._id}
                onClick={() => onSelectUser(user)} 
                className={`flex items-center px-3 py-3 cursor-pointer transition-all duration-200 ${
                  isSelected ? 'bg-[#e5efff]' : 'hover:bg-[#f3f5f6]'
                }`}
              >
                {/* Avatar thực tế hoặc Chữ cái đầu */}
                <div className="relative flex-shrink-0 mr-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm bg-blue-50">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.username} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "https://www.w3schools.com/howto/img_avatar.png" }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-blue-500 uppercase text-lg">
                        {user.username ? user.username[0] : '?'}
                      </div>
                    )}
                  </div>
                  {/* Chấm xanh trạng thái online (Giả lập) */}
                  <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className={`text-[14px] truncate ${isSelected ? 'font-bold text-gray-900' : 'text-gray-800 font-medium'}`}>
                      {user.username}
                    </h3>
                    <span className="text-[10px] text-gray-400 shrink-0">12:30</span>
                  </div>
                  
                  {/* Preview tin nhắn cuối cùng (Tạm thời) */}
                  <p className={`text-[12px] truncate ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
                    Nhấn để bắt đầu trò chuyện
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
               <Search size={32} />
            </div>
            <p className="text-gray-400 text-sm italic">Không tìm thấy bạn bè...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;