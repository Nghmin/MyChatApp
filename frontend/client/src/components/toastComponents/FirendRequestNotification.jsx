import React from 'react';
import { toast } from 'react-toastify';

const FirendRequestNotification = ({ message, onConfirm, toastId }) => {
  return (
    <div className="p-1">
      <p className="text-[14px] font-medium text-gray-800 mb-3">{message}</p>
      <div className="flex gap-2 h-8">
        <button 
          onClick={() => { onConfirm(); toast.dismiss(toastId); }}
          className="flex-1 bg-red-500 text-white rounded-md text-[12px] font-bold hover:bg-red-600 transition-colors"
        >
          Xác nhận
        </button>
        <button 
          onClick={() => toast.dismiss(toastId)}
          className="flex-1 bg-gray-100 text-gray-600 rounded-md text-[12px] font-bold hover:bg-gray-200 transition-colors"
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

export default FirendRequestNotification;