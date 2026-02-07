import React, { useState, useEffect } from 'react';
import { X, Users, Loader2 } from 'lucide-react';

const SentGroupRequestList = () => {
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSentInvites = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/friend/friend/group/sent/${user.userId || user._id}` , {
        headers: {'Authorization': `Bearer ${token}`},
      });
      const data = await response.json();
      setSentRequests(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSentInvites(); }, []);

  const handleCancelInvite = async (groupId, userId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://127.0.0.1:5000/friend/friend/group/declineGroupInvite`, {
      method: 'POST',
      headers: {'Authorization': `Bearer ${token}`},
      body: JSON.stringify({ groupId, userId })
    });

    if (response.ok) {
      setSentRequests(prev => prev.filter(req => !(req.groupId === groupId && req.receiver._id === userId)));
    }
  };

  if (loading) return <Loader2 className="animate-spin m-auto mt-10 text-blue-500" />;

  return (
    <div className="p-4 space-y-3">
      {sentRequests.length > 0 ? (
        sentRequests.map((req) => (
          <div key={req._id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <img src={req.receiver.avatar || "https://www.w3schools.com/howto/img_avatar.png"} className="w-11 h-11 rounded-full object-cover" />
              <div>
                <h4 className="font-bold text-gray-800">{req.receiver.username}</h4>
                <p className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                  Mời vào: {req.groupName}
                </p>
              </div>
            </div>
            <button 
              onClick={() => handleCancelInvite(req.groupId, req.receiver._id)}
              className="flex items-center gap-1 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
            >
              <X size={16} /> Thu hồi
            </button>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-400 mt-10">Bạn chưa gửi lời mời nhóm nào.</div>
      )}
    </div>
  );
};
export default SentGroupRequestList;