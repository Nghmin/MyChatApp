import React from 'react';
import { toast } from 'react-toastify';
import FirendRequestNotification from '../components/toastComponents/FirendRequestNotification';
import ConfirmDialogToast from '../components/toastComponents/ConfirmDialogToast';
const defaultOptions = {
  position: "bottom-right",
  autoClose: 8000,
  closeButton: false,
  style: { 
    borderRadius: '12px', 
    padding: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  }
};

export const showConfirmDialogToast = {
  confirmRecall: (onConfirm , onCancel) => {
    const toastId = toast(
      <ConfirmDialogToast 
        message="Bạn có chắc chắn muốn thu hồi tin nhắn này không?" 
        onConfirm={onConfirm} 
        onCancel={onCancel}
        toastId={null} 
      />,
      { ...defaultOptions, autoClose: false, closeOnClick: false, onClose: onCancel }
    );
    toast.update(toastId, {
      render: <ConfirmDialogToast 
                message="Bạn có chắc chắn muốn thu hồi tin nhắn này không?" 
                onConfirm={onConfirm} 
                onCancel={onCancel}
                toastId={toastId} 
              />
    });
  },
  confirmGeneral: (message, confirmText, confirmColor, onConfirm, onCancel) => {
    const toastId = toast(
      <ConfirmDialogToast 
        message={message} 
        confirmText={confirmText} 
        confirmColor={confirmColor}
        onConfirm={onConfirm} 
        onCancel={onCancel}
        toastId={null} 
      />,
      { ...defaultOptions, autoClose: false, closeOnClick: false }
    );
    toast.update(toastId, {
      render: <ConfirmDialogToast 
                message={message} 
                confirmText={confirmText}
                confirmColor={confirmColor}
                onConfirm={onConfirm} 
                onCancel={onCancel}
                toastId={toastId} 
              />
    });
  },
  success: (message) => {
    toast.success(message, { ...defaultOptions, autoClose: 2000 });
  },

  error: (message) => {
    toast.error(message, { ...defaultOptions, autoClose: 3000 });
  }
};
export const showFirendRequestNotification = {
  friendRequest: (data, onAccept) => {
    const toastId = toast(
      <FirendRequestNotification data={data} onAccept={onAccept} toastId={null} />,
      { ...defaultOptions, icon: false , onOpen: (props) => {} }
    );
    toast.update(toastId, {
    render: <FirendRequestNotification data={data} onAccept={onAccept} toastId={toastId} />
  });
  },

  // Tin nhắn mới (Ví dụ)
  newMessage: (data, onClick) => {
    toast.info(`Tin nhắn mới từ ${data.senderName}: ${data.text}`, {
       ...defaultOptions,
       onClick: onClick
    });
  },

  //  Thành công (dùng mặc định của thư viện)
  success: (message) => {
    toast.success(message, { ...defaultOptions, autoClose: 3000 });
  },

  // Lỗi
  error: (message) => {
    toast.error(message, { ...defaultOptions, autoClose: 4000 });
  }
};