import React ,{ useState } from 'react';
import { MailOpen, Users, UserPlus, Group, LayoutGrid , Send} from 'lucide-react';
import FriendRequestList from './FriendRequestList';
import GroupRequestList from './GroupRequestList';
import SentFriendRequestList from './SentFriendRequestList';
import SentGroupRequestList from './SentGroupRequestList';
import { showConfirmDialogToast } from '../../../utils/toastHelpers';
const ContactWindow = ({ onSelectCategory, friends = [] ,socket, myInfo , onShowSelectProfile , refreshData}) => {
  const onlyFriends = friends.filter(item => !item.isGroup && item.username !== "Cloud của tôi");
  const onlyGroups = friends.filter(item => item.isGroup);
  const [actionCount, setActionCount] = useState(0);
  // Hàm xử lý nhóm
  const handleGroupAction = async (groupId, action, groupName) => {
    if (action === 'decline') {
      executeGroupApi(groupId, action);
      return;
    }

    showConfirmDialogToast.confirmGeneral(
      `Bạn có chắc chắn muốn tham gia nhóm "${groupName}" không?`,
      "Tham gia",
      "bg-blue-600",
      () => executeGroupApi(groupId, action)  
    );
  };

  // Hàm Api xử lý nhóm
  const executeGroupApi = async (groupId, action) => {
    try {
      const endpoint = action === 'accept' ? 'accept' : 'decline';
      const token = localStorage.getItem('token');

      const response = await fetch(`http://127.0.0.1:5000/friend/friend/group/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ groupId, userId: myInfo.userId || myInfo._id })
      });

      if (response.ok) {
        const data = await response.json();

        if (action === 'accept' && socket) {
          socket.emit('join_group_room', groupId);
          // Xử lý sự kiện khi người gửi lời mời tham gia nhóm
          socket.emit('accept_invite_success', {
            groupId: groupId,
            updatedGroup: data.updatedGroup, 
            systemMessage: data.systemMessage
          });
          if (data.systemMessage) {
            socket.emit('send_message', data.systemMessage);
          }
        }

        if (refreshData) refreshData();
        setActionCount(prev => prev + 1);
        showConfirmDialogToast.success(
          action === 'accept' ? "Gia nhập nhóm thành công!" : "Đã từ chối lời mời"
        );
      }
    } catch (err) {
      console.error("Lỗi xử lý nhóm:", err);
      showConfirmDialogToast.error("Không thể thực hiện thao tác này");
    }
  };

  // Giao diện Danh sách bạn bè
  if (onSelectCategory === 'friend-list') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden h-full bg-white">
        <div className="h-14 flex items-center px-6 border-b gap-2 shrink-0 bg-white z-10">
          <Users size={20} className="text-gray-500" />
          <span className="font-bold">Danh sách bạn bè ({friends.length})</span>
        </div>
          <div className="flex-1 overflow-y-auto bg-white p-4 space-y-3 custom-scrollbar">
            {onlyFriends.map(friend => (
              <div key={friend._id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
                <img onClick={() => onShowSelectProfile(friend)} src={friend.avatar || "https://www.w3schools.com/howto/img_avatar.png"} className="w-14 h-14 rounded-full object-cover border border-gray-100" alt={friend.username} />
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
          <span className="font-bold">Danh sách nhóm ({onlyGroups.length})</span>
        </div> 
        {onlyGroups.length > 0 ? (
          <div className="flex-1 overflow-y-auto bg-white p-4 space-y-3 custom-scrollbar">
            {onlyGroups.map(group => (
              <div key={group._id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
                {/* Avatar Nhóm */}
                <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border border-gray-100">
                  {group.avatar || group.image ? (
                    <img onClick={() => onShowSelectProfile(group)} src={group.avatar || group.image} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <Users size={24} className="text-orange-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 truncate">{group.name || group.username}</h4>
                  <p className="text-xs text-gray-500">{group.members?.length || 0} thành viên</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#f9fafb] text-center p-6">
            <div className="w-48 h-48 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <LayoutGrid size={80} className="text-orange-200" />
            </div>
            <h3 className="text-gray-800 font-bold text-lg">Chưa có nhóm nào</h3>
            <p className="text-gray-400 text-sm max-w-xs mt-2">Bạn chưa tham gia nhóm nào.</p>
          </div>
        )}
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
        <FriendRequestList socket={socket} myInfo={myInfo} onShowSelectProfile={onShowSelectProfile} refreshData={refreshData}/>
      </div>
    );
  }

  // Giao diện Lời mời vào nhóm 
  if (onSelectCategory === 'group-requests') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        <div className="h-14 flex items-center px-6 border-b gap-2 shrink-0 bg-white">
          <Group size={20} className="text-gray-500" />
          <span className="font-bold">Lời mời vào nhóm</span>
        </div>
        <div className="flex-1 bg-[#f9fafb] overflow-y-auto custom-scrollbar">
          <GroupRequestList refreshTrigger={actionCount} myId={myInfo.userId || myInfo._id} onAction={handleGroupAction} />
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
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#f9fafb]">
          {/* Phần 1: Lời mời kết bạn cá nhân (Cái cũ của ông) */}
          <div className="p-4 pb-0"><span className="text-xs font-bold text-gray-400 uppercase">Kết bạn cá nhân</span></div>
          <SentFriendRequestList onShowSelectProfile={onShowSelectProfile} socket={socket} myInfo={myInfo} />
          
          <div className="my-4 border-t border-gray-100" />

          {/* Phần 2: Lời mời vào nhóm (Cái mới mình vừa làm) */}
          <div className="p-4 pb-0"><span className="text-xs font-bold text-gray-400 uppercase">Mời vào nhóm</span></div>
          <SentGroupRequestList />
        </div>
      </div>
    );
  }
  return null;
};

export default ContactWindow;