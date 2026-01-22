import React from 'react';
import { MailOpen, Users, UserPlus, Group, LayoutGrid , Send} from 'lucide-react';
import FriendRequestList from './FriendRequestList';
import SentFriendRequestList from './SentFriendRequestList';
const ContactWindow = ({ onSelectCategory, friends = [] ,socket, myInfo , onShowFriendProfile}) => {
  // Giao diện Danh sách bạn bè
  if (onSelectCategory === 'friend-list') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden h-full bg-white">
        <div className="h-14 flex items-center px-6 border-b gap-2 shrink-0 bg-white z-10">
          <Users size={20} className="text-gray-500" />
          <span className="font-bold">Danh sách bạn bè ({friends.length})</span>
        </div>
          <div className="flex-1 overflow-y-auto bg-white p-4 space-y-3 custom-scrollbar">
            {friends.slice(1).map(friend => (
              <div key={friend._id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
                <img onClick={() => onShowFriendProfile(friend)} src={friend.avatar || "https://www.w3schools.com/howto/img_avatar.png"} className="w-14 h-14 rounded-full object-cover border border-gray-100" alt={friend.username} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 truncate">{friend.username}</h4>
                  {/* <p className="text-[11px] text-green-500 font-medium bg-green-50 w-fit px-2 py-0.5 rounded-full mt-1">Bạn bè</p> */}
                </div>
              </div>
            ))}
          </div>
      </div>
    );
  }

  // Giao diện Danh sách nhóm 
  if (onSelectCategory === 'group-list') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        <div className="h-14 flex items-center px-6 border-b gap-2 shrink-0">
          <Group size={20} className="text-gray-500" />
          <span className="font-bold">Danh sách nhóm</span>
        </div>
        {/* Empty */}
        <div className="flex-1 flex flex-col items-center justify-center bg-[#f9fafb] text-center p-6">
          <div className="w-48 h-48 bg-orange-50 rounded-full flex items-center justify-center mb-4">
            <LayoutGrid size={80} className="text-orange-200" />
          </div>
          <h3 className="text-gray-800 font-bold text-lg">Chưa có nhóm nào</h3>
          <p className="text-gray-400 text-sm max-w-xs mt-2">Bạn chưa tham gia nhóm nào. Các nhóm bạn tham gia sẽ hiển thị tại đây.</p>
          <button className="mt-6 px-6 py-2 bg-[#0068ff] text-white rounded-md text-sm font-medium hover:bg-[#005ae0] transition-colors">
            Tạo nhóm mới
          </button>
        </div>
      </div>
    );
  }

  // Giao diện Lời mời kết bạn
  if (onSelectCategory === 'friend-requests') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        <div className="h-14 flex items-center px-6 border-b gap-2 shrink-0">
          <UserPlus size={20} className="text-gray-500" />
          <span className="font-bold">Lời mời kết bạn</span>
        </div>
        <FriendRequestList socket={socket} myInfo={myInfo} onShowFriendProfile={onShowFriendProfile} />
      </div>
    );
  }

  // Giao diện Lời mời vào nhóm 
  if (onSelectCategory === 'group-requests') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        <div className="h-14 flex items-center px-6 border-b gap-2 shrink-0">
          <Group size={20} className="text-gray-500" />
          <span className="font-bold">Lời mời vào nhóm</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center bg-[#f9fafb]">
          <div className="w-48 h-48 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <MailOpen size={80} className="text-green-200" />
          </div>
          <h3 className="text-gray-800 font-bold text-lg">Không có lời mời vào nhóm</h3>
          <p className="text-gray-400 text-sm mt-2">Danh sách các nhóm mời bạn tham gia sẽ hiện ở đây.</p>
        </div>
      </div>
    );
  }

  if (onSelectCategory === 'sent-requests') {
    return (
      <div className="flex-1 flex flex-col h-full bg-white">
        <div className="h-14 flex items-center px-6 border-b gap-2 shrink-0">
          <Send size={20} className="text-gray-500" />
          <span className="font-bold">Lời mời đã gửi</span>
        </div>
        <SentFriendRequestList onShowFriendProfile={onShowFriendProfile} socket={socket} myInfo={myInfo} />
      </div>
    );
  }

  return null;
};

export default ContactWindow;