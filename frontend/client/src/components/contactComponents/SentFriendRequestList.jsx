import React, { useState, useEffect } from 'react';
import { Loader2, UserMinus, Send } from 'lucide-react';

const SentFriendRequestList = ({ onShowFriendProfile , socket, myInfo}) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSentRequests();
  }, []);

  const fetchSentRequests = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const myId = user.userId || user._id;
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://127.0.0.1:5000/friend/sent/${myId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi fetch lời mời đã gửi:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId , receiverId) => {
    if (!window.confirm("Bạn muốn thu hồi lời mời này?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/friend/decline`, {
        method: 'DELETE', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId })
      });

      if (response.ok) {
        if (socket && receiverId) {
            socket.emit('cancel_friend_request', {
            receiverId: receiverId,
            senderId: myInfo?.userId || myInfo?._id
            });
        }
        setRequests(prev => prev.filter(r => r._id !== requestId));
        console.log("Đã hủy lời mời kết bạn" + requestId);
      }
    } catch (err) { console.error("Lỗi khi hủy lời mời:", err); }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="flex-1 overflow-y-auto bg-[#f9fafb] p-6 custom-scrollbar">
      {requests.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {requests.map((req) => (
            <div key={req._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => onShowFriendProfile(req.receiver)}>
                <img 
                  src={req.receiver?.avatar || "https://www.w3schools.com/howto/img_avatar.png"} 
                  className="w-12 h-12 rounded-full object-cover" 
                  alt="avatar" 
                />
                <div>
                  <h4 className="font-bold text-gray-800">{req.receiver?.username}</h4>
                  <p className="text-[12px] text-blue-500">Đang chờ phản hồi...</p>
                </div>
              </div>
              <button 
                onClick={() => handleCancel(req._id , req.receiver?._id)}
                className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                Thu hồi
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center mt-20 text-gray-400">
            <Send size={48} className="mx-auto mb-4 opacity-20" />
            <p>Bạn chưa gửi lời mời kết bạn nào</p>
        </div>
      )}
    </div>
  );
};

export default SentFriendRequestList;