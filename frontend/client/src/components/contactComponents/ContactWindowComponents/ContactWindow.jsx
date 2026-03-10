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
  const handleGroupAction = async (groupId, action, groupName, isMember = false) => {
    // Nếu user đã là member, chỉ cần decline (gỡ bỏ lời mời) mà không cần confirm
    if (isMember && action === 'decline') {
      executeGroupApi(groupId, 'decline');
      return;
    }

    if (action === 'decline') {
      showConfirmDialogToast.confirmGeneral(
        `Từ chối lời mời tham gia nhóm "${groupName}"?`,
        "Từ chối",
        "bg-red-600",
        () => executeGroupApi(groupId, action)
      );
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

      const data = await response.json();

      if (response.ok) {
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
        } else if (action === 'decline' && socket) {
          // Notify người gửi lời mời biết rằng lời mời bị decline/gỡ bỏ
          socket.emit('group_invitation_declined', {
            groupId,
            userId: myInfo.userId || myInfo._id
          });
        }

        if (refreshData) refreshData();
        setActionCount(prev => prev + 1);
        showConfirmDialogToast.success(
          action === 'accept' ? "Gia nhập nhóm thành công!" : "Đã từ chối lời mời"
        );
      } else {
        // Xử lý error từ backend
        const errorMessage = data.message || "Không thể thực hiện thao tác này";
        showConfirmDialogToast.error(errorMessage);
        
        // Làm mới danh sách để cập nhật trạng thái
        if (refreshData) refreshData();
        setActionCount(prev => prev + 1);
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
    // Hàm tính bạn chung trong nhóm
    const getCommonFriendsInGroup = (group) => {
      const currentUserFriendsIds = friends
        .filter(f => !f.isGroup && f.username !== "Cloud của tôi")
        .map(f => f._id);
      
      if (!group.members) return 0;
      const commonCount = group.members.filter(member => 
        currentUserFriendsIds.includes(member._id || member)
      ).length;
      return commonCount;
    };

    return (
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        <div className="h-14 flex items-center px-6 border-b gap-2 shrink-0">
          <Group size={20} className="text-gray-500" />
          <span className="font-bold">Danh sách nhóm ({onlyGroups.length})</span>
        </div> 
        {onlyGroups.length > 0 ? (
          <div className="flex-1 overflow-y-auto bg-white p-4 space-y-3 custom-scrollbar">
            {onlyGroups.map(group => {
              const isGroupAdmin = group.admin === (myInfo?.userId || myInfo?._id);
              const commonFriends = getCommonFriendsInGroup(group);
              return (
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
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-800 truncate">{group.name || group.username}</h4>
                      {isGroupAdmin && <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">Admin</span>}
                    </div>
                    <div className="flex gap-3 text-xs text-gray-500 mt-1">
                      <span>{group.members?.length || 0} thành viên</span>
                      {commonFriends > 0 && <span className="text-blue-600 font-medium">{commonFriends} bạn chung</span>}
                    </div>
                  </div>
                </div>
              );
            })}
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
          <GroupRequestList refreshTrigger={actionCount} myId={myInfo.userId || myInfo._id} onAction={handleGroupAction} socket={socket} onShowSelectProfile={onShowSelectProfile} />
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
          {/* Lời mời kết bạn cá nhân */}
          <div className="p-4 pb-0"><span className="text-xs font-bold text-gray-400 uppercase">Kết bạn cá nhân</span></div>
          <SentFriendRequestList onShowSelectProfile={onShowSelectProfile} socket={socket} myInfo={myInfo} />
          
          <div className="my-4 border-t border-gray-100" />

          {/* Lời mời vào nhóm */}
          <div className="p-4 pb-0"><span className="text-xs font-bold text-gray-400 uppercase">Mời vào nhóm</span></div>
          <SentGroupRequestList socket={socket} myInfo={myInfo} />
        </div>
      </div>
    );
  }
  return null;
};

export default ContactWindow;