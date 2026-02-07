import React, { useState, useEffect } from 'react';
import { X, UserPlus, Search, UserCheck, AlertCircle } from 'lucide-react';

const AddFriendModal = ({ isOpen, onClose, onSendRequest }) => {
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [isSendAdd, setIsSendAdd] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPhoneInput('');
      setFoundUser(null);
      setError('');
      setIsSendAdd(false);
    }
  }, [isOpen]);

  const handleSearch = async (phone) => {
    setSearching(true);
    setError('');
    setFoundUser(null);
    setIsSendAdd(false);

    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const myId = storedUser?.userId || storedUser?._id;
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://127.0.0.1:5000/friend/friend/friend/search?phone=${phone}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 404) {
        setError('Số điện thoại chưa đăng ký tài khoản');
        setSearching(false);
        return;
      }

      const data = await response.json();

      if (response.ok && data) {
        if (data._id === myId) {
          setError('Bạn không thể kết bạn với chính mình');
          return;
        }

        const isAlreadyFriend = data.friends?.some(id => 
          (typeof id === 'string' ? id : id._id) === myId
        );
        if (isAlreadyFriend) {
          setError('Người này đã có trong danh sách bạn bè');
          setFoundUser(data);
          return;
        }

        const pendingRes = await fetch(`http://127.0.0.1:5000/friend/friend/friend/sent/${myId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const pendingData = await pendingRes.json();
        
        const isPending = pendingData.some(req => req.receiver?._id === data._id);
        if (isPending) {
          setError('Bạn đã gửi lời mời cho người này rồi');
          setFoundUser(data);
          setIsSendAdd(true);
          return;
        }

        setFoundUser(data);
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (phoneInput.length >= 10) {
        handleSearch(phoneInput);
      } else {
        setFoundUser(null);
        setError('');
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [phoneInput]);

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 11) {
      setPhoneInput(val);
      setError('');
    }
  };

  const handleAddFriend = async () => {
    if (isSendAdd || !foundUser || error) return;
    setLoading(true);
    const result = await onSendRequest(phoneInput);
    if (result.success) {
      onClose();
    } else {
      setError(result.message || 'Không thể gửi lời mời');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const getInputStatusClass = () => {
    if (error) return 'border-red-500 bg-red-50 focus:border-red-600';
    if (foundUser && !error) return 'border-green-500 bg-green-50 focus:border-green-600';
    return 'border-gray-200 bg-gray-50 focus:border-blue-500';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-[400px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <UserPlus size={20} className="text-blue-600" />
            Thêm bạn mới
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <span className={`font-bold text-sm border-r pr-2 transition-colors ${error ? 'text-red-400' : foundUser ? 'text-green-400' : 'text-gray-400'}`}>+84</span>
              </div>
              <input 
                autoFocus
                type="tel"
                value={phoneInput}
                onChange={handleInputChange}
                className={`w-full pl-16 pr-10 py-3.5 border-2 rounded-xl text-lg outline-none transition-all duration-300 font-medium ${getInputStatusClass()}`}
                placeholder="Số điện thoại..."
              />
              {searching && (
                <div className="absolute right-3 top-4 animate-spin text-blue-500">
                  <Search size={20} />
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={18} className="shrink-0" />
                <span className="text-sm font-semibold">{error}</span>
              </div>
            )}

            <div className={`min-h-[100px] flex items-center justify-center border-2 border-dashed rounded-xl p-4 transition-colors ${foundUser ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}`}>
              {foundUser ? (
                <div className="flex items-center gap-4 w-full animate-in fade-in slide-in-from-bottom-2">
                  <div className="relative">
                    <img 
                      src={foundUser.avatar || "https://www.w3schools.com/howto/img_avatar.png"} 
                      alt="avatar" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 p-1 rounded-full border-2 border-white">
                      <UserCheck size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">{foundUser.username}</h4>
                    <p className="text-sm text-gray-500 font-medium">{foundUser.phone}</p>
                  </div>
                </div>
              ) : !error && (
                <div className="text-center text-gray-400">
                   <p className="text-sm italic">Nhập số điện thoại để tìm bạn bè</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Để sau
            </button>
            <button 
              onClick={handleAddFriend}
              disabled={loading || !foundUser || !!error || isSendAdd} 
              className={`flex-[2] px-6 py-3 text-sm font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 ${
                loading || !foundUser || !!error || isSendAdd
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-[#0068ff] text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Đang gửi...' : isSendAdd ? 'Đã gửi lời mời' : 'Kết bạn ngay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFriendModal;