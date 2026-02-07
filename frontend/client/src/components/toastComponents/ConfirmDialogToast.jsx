import React from 'react';
import { toast } from 'react-toastify';

const ConfirmDialogToast = ({ message, onConfirm, toastId , onCancel , confirmText, confirmColor}) => {
  return (
    <div className="p-1">
      <p className="text-[14px] font-medium text-gray-800 mb-3">{message}</p>
      <div className="flex gap-2 h-8">
        <button 
          onClick={() => { onConfirm(); toast.dismiss(toastId); }}
          className={`flex-1 ${confirmColor || 'bg-red-500'} text-white rounded-md text-[12px] font-bold hover:opacity-90 transition-colors`}
        >
          {confirmText || 'Thu hồi'}
        </button>
        <button 
          onClick={() => { 
            if (onCancel) onCancel(); 
            toast.dismiss(toastId); 
          }}
          className="flex-1 bg-gray-100 text-gray-600 rounded-md text-[12px] font-bold hover:bg-gray-200 transition-colors"
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

export default ConfirmDialogToast;