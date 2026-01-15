import React, { useState } from 'react';
import axios from 'axios';
import { ImageIcon, FileVideo, Paperclip, Loader2 } from 'lucide-react';

const ChatUploadTool = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Dung lượng file quá lớn (tối đa 10MB)");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/upload/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data' ,
          'Authorization': `Bearer ${token}` 
        },
        
      });

      if (response.data && response.data.url) {
        console.log("Upload thành công:", response.data.url);
        onUploadSuccess(response.data.url, type);
      }
    } catch (error) {
      console.error("Lỗi upload file:", error);
      alert("Không thể gửi file.");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="h-10 border-b border-gray-100 flex items-center px-4 gap-5 shrink-0 bg-white relative">
      {/* Hiệu ứng loading*/}
      {isUploading && (
        <div className="absolute inset-0 bg-white/80 z-10 flex items-center px-4 gap-2">
          <Loader2 size={16} className="animate-spin text-blue-600" />
          <span className="text-[12px] text-blue-600 font-medium">Đang tải lên...</span>
        </div>
      )}

      {/* Nút Upload Ảnh */}
      <label className="cursor-pointer text-gray-500 hover:text-blue-600 transition-colors">
        <ImageIcon size={20} />
        <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'image')} disabled={isUploading} />
      </label>

      {/* Nút Upload Video */}
      <label className="cursor-pointer text-gray-500 hover:text-blue-600 transition-colors">
        <FileVideo size={20} />
        <input type="file" hidden accept="video/*" onChange={(e) => handleFileChange(e, 'video')} disabled={isUploading} />
      </label>

      {/* Nút Upload File tài liệu */}
      <label className="cursor-pointer text-gray-500 hover:text-blue-600 transition-colors">
        <Paperclip size={20} />
        <input type="file" hidden onChange={(e) => handleFileChange(e, 'file')} disabled={isUploading} />
      </label>
      
      <div className="w-px h-4 bg-gray-200" />
      <button className="text-gray-500 hover:text-blue-600 text-[13px] font-medium" disabled={isUploading}>Gửi danh thiếp</button>
    </div>
  );
};

export default ChatUploadTool;