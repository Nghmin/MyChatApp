import React ,{useState} from 'react';
import AddFriendModal from './AddFriendModal';
import { Search, UserPlus } from 'lucide-react';

const ConversationList = ({ friends, onSelectUser, selectedId , onlineUsers = [],onSendFriendRequest }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header Tìm kiếm & Tab (Giữ nguyên) */}
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
          <button onClick={() => setIsModalOpen(true)} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors" title="Thêm bạn">
            <UserPlus size={20} className="text-gray-700" />
          </button>
        </div>

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
            
            const isOnline = onlineUsers.includes(user._id);
            const isCloud = user.username === "Cloud của tôi";
            const lastMsg = user.lastMessage;
            const unreadCount = user.unreadCount || 0;
            const isUnread = unreadCount > 0;
            let isMy = "Bạn: ";
            const renderLastMessageText = () => {
              
              if (!lastMsg) return "Nhấn để bắt đầu trò chuyện";
              if (lastMsg.isDeleted === true) return "Tin nhắn đã được thu hồi";
              if (lastMsg.messageType === 'image') return "[Hình ảnh]";
              if (lastMsg.messageType === 'video') return "[Video]";
              if (isCloud) {
                if(!lastMsg) return isMy + lastMsg.text;
                else return "Lưu trữ tin nhắn và tài liệu";
              }
              if (lastMsg.sender === user._id) {
                isMy = "";
              } 
              return isMy + lastMsg.text;
            };

            const formatTime = (dateString) => {
              if (!dateString) return "";
              const date = new Date(dateString);
              return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            };

            return (
              <div 
                key={user._id}
                onClick={() => onSelectUser(user)} 
                className={`flex items-center px-3 py-3 cursor-pointer transition-all duration-200 ${
                  isSelected ? 'bg-[#e5efff]' : 'hover:bg-[#f3f5f6]'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0 mr-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm bg-blue-50">
                    {user.avatar ? (
                      <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-blue-500 uppercase text-lg">
                        {user.username ? user.username[0] : '?'}
                      </div>
                    )}
                  </div>
                  
                  {/* Trạng thái Online (Cập nhật logic hiển thị) */}
                  {isOnline && !isCloud && (
                    <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className={`text-[14px] truncate ${
                      isUnread ? 'font-bold text-black' : (isSelected ? 'font-bold text-gray-900' : 'text-gray-800 font-medium')
                    }`}>
                      {user.username}
                    </h3>
                    
                    <span className={`text-[10px] shrink-0 ${isUnread ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                      {formatTime(lastMsg?.createdAt)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className={`text-[12px] truncate pr-2 ${
                      isUnread ? 'font-semibold text-gray-900' : 'text-gray-500'
                    }`}>
                      {renderLastMessageText()}
                    </p>

                    {isUnread && (
                      <div className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 shadow-sm shrink-0">
                        {unreadCount > 3 ? '3+' : unreadCount}
                      </div>
                    )}
                  </div>
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
      <AddFriendModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSendRequest={onSendFriendRequest}
      />
    </div>
  );
};

export default ConversationList;