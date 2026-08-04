import React, { useState, useEffect } from 'react';
import { Check, X, Loader2, Users, MailOpen } from 'lucide-react';

const GroupRequestList = ({ refreshTrigger, myId, onAction, socket , onShowSelectProfile}) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/friend/friend/group/pending/${myId}`, {
            //headers: {'Authorization': `Bearer ${token}`}
            credentials: 'include'
        });
        const data = await response.json();
        setGroups(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchInvites();
  }, [myId,refreshTrigger]);

  // Thiết lập socket listeners để cập nhật real-time
  useEffect(() => {
    if (!socket) return;

    // Xử lý khi nhận lời mời nhóm mới
    const handleGroupInvite = (data) => {
      console.log("Lời mời nhóm mới:", data);
      setGroups(prev => {
        // Kiểm tra group đã tồn tại chưa
        if (prev.find(g => g._id === data.groupId)) {
          return prev;
        }
        return [{
          _id: data.groupId,
          name: data.groupName,
          avatar: data.groupAvatar,
          admin: data.inviter || { username: "Người dùng" }
        }, ...prev];
      });
    };

    // Xử lý khi lời mời nhóm bị hủy
    const handleGroupInviteCancelled = (data) => {
      setGroups(prev => prev.filter(g => g._id !== data.groupId));
    };

    socket.on('receive_group_invite', handleGroupInvite);
    socket.on('group_invitation_cancelled', handleGroupInviteCancelled);

    return () => {
      socket.off('receive_group_invite', handleGroupInvite);
      socket.off('group_invitation_cancelled', handleGroupInviteCancelled);
    };
  }, [socket]);

  const internalHandleAction = (groupId, action , groupName, isMember) => {
    onAction(groupId, action , groupName, isMember);
  };
  

  if (loading) return <Loader2 className="animate-spin m-auto" />;

  return (
    <div className="p-4 space-y-3">
      {groups.length > 0 ? (<>
        {groups.map(group => {
          const isMember = group.isMember;
          return (
            <div key={group._id} className={`bg-white p-4 rounded-xl border flex items-center justify-between shadow-sm ${isMember ? 'opacity-60 bg-gray-50' : ''}`}>
              <div onClick={() => {onShowSelectProfile(group); console.log(group);}} className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  {group.avatar ? <img src={group.avatar} className="w-full h-full rounded-lg object-cover"/> : <Users size={24}/>}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{group.name}</h4>
                  <p className="text-[11px] text-gray-500">
                    {isMember ? "✓ Bạn đã tham gia nhóm này" : `Mời bởi: ${group.admin?.username}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {!isMember ? (
                  <>
                    <button 
                      onClick={() => internalHandleAction(group._id, 'accept', group.name, false)} 
                      className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all"
                      title="Chấp nhận lời mời"
                    >
                      <Check size={18}/>
                    </button>
                    <button 
                      onClick={() => internalHandleAction(group._id, 'decline', group.name, false)} 
                      className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all"
                      title="Từ chối lời mời"
                    >
                      <X size={18}/>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => internalHandleAction(group._id, 'decline', group.name, true)} 
                    className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-400 transition-all"
                    title="Gỡ bỏ lời mời"
                  >
                    <X size={18}/>
                  </button>
                )}
              </div>
            </div>
          );
        })}</>
      ) : (                   
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-48 h-48 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <MailOpen size={80} className="text-blue-200" strokeWidth={1} />
            </div>
            <h3 className="text-gray-800 font-bold text-lg">Bạn không có lời mời nào</h3>
            <p className="text-gray-400 text-sm mt-2 max-w-xs">
              Lời mời nhóm từ người khác sẽ xuất hiện ở đây.
            </p>
          </div>
        )}
    </div>
  );
};

export default GroupRequestList;