import React from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';

const IncomingCallToast = ({ callData, onAccept, onReject }) => {
  // Nếu không có dữ liệu cuộc gọi, không hiển thị gì cả
  if (!callData) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-[#1a1a2e] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 z-[999] animate-bounce-in-right select-none font-sans">
      <div className="flex items-center gap-5">
        {/* Phần Avatar với trạng thái Online */}
        <div className="relative">
          <img 
            src={callData.avatar || "https://via.placeholder.com/150"} 
            alt="caller-avatar" 
            className="w-16 h-16 rounded-full object-cover border-4 border-[#0068ff] shadow-[0_0_20px_rgba(0,104,255,0.3)]"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[#1a1a2e] shadow-md"></div>
        </div>

        {/* Phần Thông Tin Người Gọi */}
        <div className="flex-1 min-w-0">
          <h4 className="text-xl font-bold text-white truncate leading-tight">
            {callData.displayName || callData.name || "Người dùng ẩn danh"}
          </h4>
          {/* Sửa lỗi: Đưa tag p vào trong khối thông tin này */}
          <p className="text-white/60 text-sm mt-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#0068ff] rounded-full animate-pulse"></span>
            Cuộc gọi video đến...
          </p>
        </div>
      </div>

      {/* Các Nút Tương Tác: Nằm bên trong khối div chính */}
      <div className="flex gap-3 mt-5">
        <button 
          onClick={onReject}
          className="flex-1 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all duration-200 text-base font-semibold active:scale-95 flex items-center justify-center gap-2"
        >
          <PhoneOff size={18} />
          Từ chối
        </button>
        <button 
          onClick={onAccept}
          className="flex-1 py-3 bg-[#0068ff] hover:bg-[#0056d6] text-white rounded-xl transition-all duration-200 text-base font-semibold active:scale-95 shadow-[0_4px_15px_rgba(0,104,255,0.3)] flex items-center justify-center gap-2"
        >
          <Video size={18} />
          Trả lời
        </button>
      </div>
    </div>
  );
};

export default IncomingCallToast;