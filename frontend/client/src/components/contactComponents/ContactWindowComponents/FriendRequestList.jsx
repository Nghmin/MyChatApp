import React, { useState, useEffect } from 'react';
import { MailOpen, Check, X, Loader2 } from 'lucide-react';
import { showFirendRequestNotification, showConfirmDialogToast } from '../../../utils/toastHelpers';
const FriendRequestList = ({ socket, myInfo, onShowSelectProfile, refreshData }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewedIds, setViewedIds] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  // Thiết lập socket listeners để cập nhật real-time
  useEffect(() => {
    if (!socket) return;

    // Xử lý khi nhận lời mời kết bạn mới
    const handleNewRequest = (data) => {
      console.log("Lời mời kết bạn mới:", data);
      const newRequest = {
        _id: data._id,
        sender: data.sender || {
          _id: data.senderId,
          username: data.senderName,
          avatar: data.senderAvatar
        }
      };
      setRequests(prev => [newRequest, ...prev]);
    };

    // Xử lý khi lời mời bị hủy
    const handleRequestCancelled = (data) => {
      setRequests(prev => prev.filter(req => req.sender?._id !== data.senderId));
    };

    socket.on('receive_friend_request', handleNewRequest);
    socket.on('friend_request_cancelled', handleRequestCancelled);

    return () => {
      socket.off('receive_friend_request', handleNewRequest);
      socket.off('friend_request_cancelled', handleRequestCancelled);
    };
  }, [socket]);

  const fetchRequests = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const myId = user.userId || user._id;
      const token = localStorage.getItem('token');
      
      // Gọi sang Friend Service (Cổng 5002)
      const response = await fetch(`http://localhost:5000/friend/friend/friend/received/${myId}`, {
        //headers: { 'Authorization': `Bearer ${token}` }
        credentials: 'include'
      });
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi fetch lời mời:", err);
    } finally {
      setLoading(false);
    }
  };

    const handleItemClick = (sender) => {
        if (!viewedIds.includes(sender._id)) {
            setViewedIds(prev => [...prev, sender._id]);
        }
        onShowSelectProfile(sender);
    };

  const executeAction = async (requestId, senderId, senderName, action) => {
    try {
        const token = localStorage.getItem('token');
        const endpoint = action === 'accept' ? 'accept' : 'decline';
        const method = action === 'accept' ? 'PUT' : 'DELETE';
        const response = await fetch(`http://localhost:5000/friend/friend/friend/${endpoint}`, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                //'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify({ requestId })
        });

        if (response.ok) {
            const data = await response.json();
            if (socket) {
                const event = action === 'accept' ? 'accept_friend_request' : 'decline_friend_request';
                socket.emit(event, {
                    senderId: senderId, 
                    receiverId: myInfo?.userId || myInfo?._id,
                    receiverName: myInfo?.username || "Một người bạn",
                    senderName: action === 'accept' ? data.friendData?.username : senderName,
                    friendData: action === 'accept' ? data.friendData : undefined
                });
            }
            if (action === 'accept') {
                showConfirmDialogToast.success(`Đã kết bạn với ${senderName}!`);
                console.log("Đã chấp nhận lời mời kết bạn " + requestId);
            } else {
                showConfirmDialogToast.success(`Đã từ chối lời mời từ ${senderName}`);
                console.log("Đã từ chối lời mời kết bạn " + requestId);
            }
            if (refreshData) {
              refreshData(); 
            }
            setRequests(prev => prev.filter(r => r._id !== requestId));
        }
    } catch (err) { 
        console.error("Lỗi xử lý lời mời:", err);
        showConfirmDialogToast.error("Không thể thực hiện thao tác này");
    }
  };

  const handleAction = async (requestId, senderId, senderName, action) => {
    if (action === 'accept') {
      showConfirmDialogToast.confirmGeneral(
        `Chấp nhận lời mời kết bạn từ ${senderName}?`,
        "Chấp nhận",
        "bg-blue-600",
        () => executeAction(requestId, senderId, senderName, 'accept')
      );
    } else {
      showConfirmDialogToast.confirmGeneral(
        `Từ chối lời mời từ ${senderName}?`,
        "Từ chối",
        "bg-red-600",
        () => executeAction(requestId, senderId, senderName, 'decline')
      );
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f9fafb]">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#f9fafb] p-6 custom-scrollbar">
      {requests.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {requests.map((req) => (
            <div 
                key={req._id} 
                className={`p-4 rounded-xl shadow-sm border flex items-center justify-between transition-all 
                    ${!viewedIds.includes(req.sender?._id) 
                    ? 'bg-blue-50/50 border-blue-200 shadow-md ring-1 ring-blue-100' 
                    : 'bg-white border-gray-100' 
                    }`}
                
                >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative cursor-pointer">
                    <img 
                        src={req.sender?.avatar || "https://www.w3schools.com/howto/img_avatar.png"} 
                        className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0"
                        alt="avatar"
                        onClick={() => handleItemClick(req.sender)}
                    />
                    {/* Chấm xanh thông báo trên avatar nếu chưa xem */}
                    {!viewedIds.includes(req.sender?._id) && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-blue-600 border-2 border-white rounded-full"></span>
                    )}
                    </div>
                    <div className="min-w-0">
                    <h4 className="font-bold text-gray-800 truncate">{req.sender?.username}</h4>
                    <p className="text-[12px] text-gray-500 italic truncate">Muốn kết bạn với bạn</p>
                    </div>
                </div>
            
            <div className="flex gap-2 ml-4 " onClick={(e) => e.stopPropagation()}>
                <button onClick={() => handleAction(req._id, req.sender?._id, req.sender?.username, 'accept')} className="cursor-pointer ...">
                <Check size={18} />
                </button>
                <button onClick={() => handleAction(req._id, req.sender?._id, req.sender?.username, 'decline')} className="cursor-pointer ...">
                <X size={18} />
                </button>
            </div>
        </div>
          ))}
        </div>
      ) : (                   
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-48 h-48 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <MailOpen size={80} className="text-blue-200" strokeWidth={1} />
          </div>
          <h3 className="text-gray-800 font-bold text-lg">Bạn không có lời mời nào</h3>
          <p className="text-gray-400 text-sm mt-2 max-w-xs">
            Lời mời kết bạn từ người khác sẽ xuất hiện ở đây.
          </p>
        </div>
      )}
    </div>
  );
};

export default FriendRequestList;