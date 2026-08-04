import React, { useState, useEffect } from 'react';
import { X, Users, Loader2 } from 'lucide-react';
import { showConfirmDialogToast } from '../../../utils/toastHelpers';

const SentGroupRequestList = ({ socket, myInfo }) => {
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSentInvites = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      const userId = user.userId || user._id;
      // Gọi endpoint mới để get sent invitations của ANY user, không chỉ admin
      const response = await fetch(`http://localhost:5000/friend/friend/group/sent-by-user/${userId}` , {
        credentials: 'include'
      });
      const data = await response.json();
      setSentRequests(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSentInvites(); }, []);

  // Socket listener để auto-update khi user accept lời mời
  useEffect(() => {
    if (!socket) return;

    const handleInviteAccepted = (data) => {
      console.log("Lời mời được chấp nhận:", data);
      // Update status của invitee từ "pending" → "member"
      setSentRequests(prev => 
        prev.map(req => 
          req.groupId === data.groupId && data.inviteeIds?.includes(req.receiver._id)
            ? { ...req, isMember: true, isPending: false }
            : req
        )
      );
    };

    const handleInviteDeclined = (data) => {
      console.log("Lời mời bị từ chối/gỡ bỏ:", data);
      // Xóa lời mời khỏi danh sách khi bị decline
      setSentRequests(prev => 
        prev.filter(req => !(req.groupId === data.groupId && req.receiver._id === data.userId))
      );
    };

    socket.on('accept_invite_success', handleInviteAccepted);
    socket.on('group_invitation_declined', handleInviteDeclined);

    return () => {
      socket.off('accept_invite_success', handleInviteAccepted);
      socket.off('group_invitation_declined', handleInviteDeclined);
    };
  }, [socket]);

  const handleCancelInvite = async (groupId, userId, groupName) => {
    showConfirmDialogToast.confirmGeneral(
      `Thu hồi lời mời vào nhóm "${groupName}"?`,
      "Thu hồi",
      "bg-red-600",
      () => executeCancelInvite(groupId, userId, groupName),
    );
  };

  const executeCancelInvite = async (groupId, userId, groupName) => {
    try {
      const response = await fetch(`http://localhost:5000/friend/friend/group/decline`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ groupId, userId })
      });

      if (response.ok) {
        if (socket) {
          socket.emit('cancel_group_invitation', {
            groupId,
            inviteeIds: [userId],
            inviterName: myInfo?.username || "Bạn"
          });
        }
        setSentRequests(prev => prev.filter(req => !(req.groupId === groupId && req.receiver._id === userId)));
      }
    } catch (err) {
      console.error("Lỗi hủy lời mời:", err);
      showConfirmDialogToast.error("Không thể thực hiện thao tác này");
    }
  };

  if (loading) return <Loader2 className="animate-spin m-auto mt-10 text-blue-500" />;

  return (
    <div className="p-4 space-y-3">
      {sentRequests.length > 0 ? (
        sentRequests.map((req) => {
          const isMember = req.isMember;
          const isPending = req.isPending;
          
          return (
            <div key={req._id} className={`bg-white p-4 rounded-xl border flex items-center justify-between shadow-sm ${isMember ? 'opacity-70 bg-gray-50' : ''}`}>
              <div className="flex items-center gap-3 flex-1">
                <img src={req.receiver.avatar || "https://www.w3schools.com/howto/img_avatar.png"} className="w-11 h-11 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-gray-800">{req.receiver.username}</h4>
                  <p className={`text-[11px] px-2 py-0.5 rounded-full w-fit font-medium ${
                    isMember 
                      ? 'bg-green-50 text-green-600' 
                      : 'bg-blue-50 text-blue-600'
                  }`}>
                    {isMember ? '✓ Đã đồng ý tham gia' : `Mời vào: ${req.groupName}`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleCancelInvite(req.groupId, req.receiver._id, req.groupName)}
                className="flex items-center gap-1 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                title={isMember ? "Gỡ bỏ (người đã tham gia)" : "Thu hồi lời mời"}
              >
                <X size={16} /> {isMember ? 'Gỡ bỏ' : 'Thu hồi'}
              </button>
            </div>
          );
        })
      ) : (
        <div className="text-center text-gray-400 mt-10">Bạn chưa gửi lời mời nhóm nào.</div>
      )}
    </div>
  );
};
export default SentGroupRequestList;