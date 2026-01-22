import React, { useState } from 'react';
import { X, Phone, UserPlus, Info } from 'lucide-react';

const AddFriendModal = ({ isOpen, onClose, onSendRequest }) => {
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneInput) return;
    
    setLoading(true);
    setError('');
    
    const result = await onSendRequest(phoneInput);
    
    if (result.success) {
      setPhoneInput('');
      onClose(); // Đóng modal khi thành công
    } else {
      setError(result.message || 'Không tìm thấy người dùng hoặc lỗi kết nối');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay mờ phía sau */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" 
        onClick={onClose}
      />
      
      {/* Nội dung Modal */}
      <div className="relative bg-white w-full max-w-[400px] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <UserPlus size={18} className="text-blue-600" />
            Thêm bạn mới
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-2">
              Nhập số điện thoại để tìm kiếm tài khoản trên hệ thống.
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-400 font-medium text-sm border-r pr-2">+84</span>
              </div>
              <input 
                autoFocus
                type="tel"
                value={phoneInput}
                onChange={(e) => {
                    setError('');
                    setPhoneInput(e.target.value.replace(/\D/g, ""));
                }}
                className={`w-full pl-14 pr-4 py-3 bg-gray-50 border ${error ? 'border-red-400' : 'border-gray-200'} rounded-lg text-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all`}
                placeholder="Số điện thoại..."
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs mt-1 animate-in fade-in slide-in-from-top-1">
                <Info size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="mt-8 flex gap-3 justify-end">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button 
              disabled={loading || !phoneInput}
              className={`px-6 py-2 text-sm font-bold rounded-lg shadow-md transition-all ${
                loading || !phoneInput 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#0068ff] text-white hover:bg-blue-700 active:scale-95'
              }`}
            >
              {loading ? 'Đang xử lý...' : 'Tìm kiếm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFriendModal;