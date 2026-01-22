import React, { useMemo } from 'react';
import { X, Download, Video } from 'lucide-react';

const MediaViewerLayer = ({ media, mediaList = [], onClose, onSelectMedia }) => {
  if (!media) return null;

  // Sửa lỗi hiển thị: Nhóm ảnh và log kiểm tra dữ liệu
  const groupedMedia = useMemo(() => {
    if (!mediaList || mediaList.length === 0) return {};
    
    const groups = {};
    // Sắp xếp để ảnh mới nhất ở trên
    const sorted = [...mediaList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    sorted.forEach(m => {
      // Dùng format đơn giản để làm Key nhóm
      const date = new Date(m.createdAt).toLocaleDateString('vi-VN');
      if (!groups[date]) groups[date] = [];
      groups[date].push(m);
    });
    return groups;
  }, [mediaList]);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 flex animate-in fade-in duration-300">
      
      {/* VÙNG CHÍNH: HIỂN THỊ ẢNH/VIDEO */}
      <div className="flex-1 relative flex items-center justify-center p-10">
        {/* Thông tin ngày tháng lơ lửng góc trái */}
        <div className="absolute top-6 left-6 z-[1010] bg-black/20 p-3 rounded-lg backdrop-blur-sm">
            <h3 className="text-white font-bold text-lg leading-none mb-1">
                {media.messageType === 'image' ? 'Hình ảnh' : 'Video'}
            </h3>
            <p className="text-blue-400 text-xs font-mono tracking-widest">
                {new Date(media.createdAt).toLocaleString('vi-VN')}
            </p>
        </div>

        {media.messageType === 'image' ? (
          <img 
            src={media.fileUrl} 
            className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-500" 
            alt="preview" 
          />
        ) : (
          <video src={media.fileUrl} controls autoPlay className="max-w-full max-h-full shadow-2xl" />
        )}
      </div>

      {/* VÙNG RÌA PHẢI: NÚT ĐIỀU KHIỂN & TIMELINE MEDIA */}
      <div className="w-28 bg-[#111] border-l border-white/10 flex flex-col shrink-0">
        
        {/* Hàng nút trên cùng: Download và Close ngang hàng */}
        <div className="flex items-center justify-between p-3 border-b border-white/10 gap-2">
          <a 
            href={media.fileUrl} 
            download 
            className="p-2.5 bg-white/5 hover:bg-blue-500 rounded-lg text-white transition-all flex-1 flex justify-center"
          >
            <Download size={20} />
          </a>
          <button 
            onClick={onClose} 
            className="p-2.5 bg-white/5 hover:bg-red-500 rounded-lg text-white transition-all flex-1 flex justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dải Media dài cố định */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-[#0a0a0a]">
          {Object.keys(groupedMedia).length > 0 ? (
            Object.keys(groupedMedia).map((date) => (
              <div key={date} className="mb-6">
                {/* Ngày tháng ngay trên bức ảnh */}
                <div className="text-[9px] text-gray-500 font-bold mb-2 text-center border-b border-white/5 pb-1 uppercase">
                  {date}
                </div>
                
                <div className="flex flex-col gap-2">
                  {groupedMedia[date].map((item, idx) => {
                    // Kiểm tra kĩ ID để set Active
                    const isActive = item._id === media._id || item.fileUrl === media.fileUrl;
                    return (
                      <div 
                        key={item._id || idx} 
                        onClick={() => onSelectMedia(item)}
                        className={`group relative aspect-square rounded-md overflow-hidden cursor-pointer transition-all border-2 
                          ${isActive ? 'border-blue-500 scale-100 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'border-transparent opacity-40 hover:opacity-100'}`}
                      >
                        {item.messageType === 'image' ? (
                          <img src={item.fileUrl} className="w-full h-full object-cover" alt="thumb" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900">
                            <Video size={16} className="text-white/50" />
                          </div>
                        )}
                        {/* Overlay khi hover */}
                        <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            /* Trạng thái rỗng: Vẫn chiếm chiều dài và hiện text báo */
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <div className="w-1 h-20 bg-gradient-to-b from-transparent via-white to-transparent mb-4" />
              <p className="text-[10px] text-white rotate-90 whitespace-nowrap uppercase tracking-[0.3em]">
                No Media Found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaViewerLayer;