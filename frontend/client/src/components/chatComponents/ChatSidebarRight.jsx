// import React, { useMemo } from 'react';
// import { X, Image as ImageIcon, Video, FileText, Link as LinkIcon, Download, ExternalLink } from 'lucide-react';

// const ChatSidebarRight = ({ selectedUser, messages = [], onClose, onMediaClick }) => {
  
//   // Lọc Ảnh & Video
//   const sharedMedia = useMemo(() => 
//     messages.filter(msg => msg.fileUrl && (msg.messageType === 'image' || msg.messageType === 'video')),
//     [messages]
//   );

//   // Lọc File 
//   const sharedFiles = useMemo(() => 
//     messages.filter(msg => msg.fileUrl && msg.messageType === 'file'),
//     [messages]
//   );

//   // Lọc Links
//   const sharedLinks = useMemo(() => {
//     const urlRegex = /(https?:\/\/[^\s]+)/g;
//     const links = [];
//     messages.forEach(msg => {
//       if (msg.messageType === 'text' && msg.text) {
//         const found = msg.text.match(urlRegex);
//         if (found) links.push(...found);
//       }
//     });
//     return [...new Set(links)];
//   }, [messages]);

//   return (
//     <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full animate-in slide-in-from-right duration-300 shadow-xl z-20">
//       {/* Header */}
//       <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100 shrink-0">
//         <span className="font-bold text-gray-700 uppercase text-xs tracking-wider">Thông tin hội thoại</span>
//         <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
//           <X size={20} className="text-gray-500" />
//         </button>
//       </div>

//       <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8">
//         {/* Profile Section */}
//         <div className="flex flex-col items-center pt-2">
//           <img 
//             src={selectedUser.avatar || "/default-avatar.png"} 
//             className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md mb-3"
//             alt="avatar"
//           />
//           <h2 className="font-bold text-lg text-gray-800">{selectedUser.username}</h2>
//           <p className="text-xs text-gray-400">@{selectedUser.username?.toLowerCase()}</p>
//         </div>

//         <hr className="border-gray-50" />

//         {/* 1. Ảnh/Video Section */}
//         <div>
//           <h3 className="flex items-center justify-between text-sm font-bold text-gray-700 mb-3 px-1">
//             <div className="flex items-center gap-2">
//               <ImageIcon size={16} className="text-blue-500" />
//               <span>Ảnh/Video ({sharedMedia.length})</span>
//             </div>
//           </h3>
//           {sharedMedia.length > 0 ? (
//             <div className="grid grid-cols-3 gap-1">
//               {sharedMedia.slice(0, 9).map((media, idx) => (
//                 <div 
//                   key={idx} 
//                   className="aspect-square bg-gray-900 rounded-sm overflow-hidden group relative cursor-pointer"
//                   onClick={() => onMediaClick(media)} // Mở Lightbox
//                 >
//                   {media.messageType === 'image' ? (
//                     <img 
//                       src={media.fileUrl} 
//                       className="w-full h-full object-cover group-hover:scale-110 transition-transform opacity-100 group-hover:opacity-90" 
//                       alt="media"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center relative">
//                       {/* Video Thumbnail fix */}
//                       <video 
//                         src={media.fileUrl} 
//                         className="w-full h-full object-cover opacity-60" 
//                         preload="metadata"
//                         muted
//                       />
//                       <div className="absolute inset-0 flex items-center justify-center">
//                         <div className="bg-black/30 p-1 rounded-full backdrop-blur-sm border border-white/20">
//                            <Video size={14} className="text-white fill-white" />
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-[11px] text-gray-400 text-center py-2 italic">Chưa có phương tiện</p>
//           )}
//         </div>

//         {/* 2. File Section */}
//         <div>
//           <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 px-1">
//             <FileText size={16} className="text-orange-500" />
//             <span>File đã gửi ({sharedFiles.length})</span>
//           </h3>
//           <div className="space-y-2">
//             {sharedFiles.length > 0 ? sharedFiles.map((file, idx) => (
//               <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg group">
//                 <div className="flex items-center gap-2 min-w-0">
//                   <div className="p-2 bg-white rounded border border-gray-100 text-orange-500">
//                     <FileText size={14} />
//                   </div>
//                   <span className="text-[12px] text-gray-600 truncate">{file.text || "Tài liệu đính kèm"}</span>
//                 </div>
//                 <a href={file.fileUrl} download className="p-1 hover:text-blue-500 text-gray-400">
//                   <Download size={14} />
//                 </a>
//               </div>
//             )) : <p className="text-[11px] text-gray-400 text-center italic">Chưa có tệp tin</p>}
//           </div>
//         </div>

//         {/* 3. Link Section */}
//         <div>
//           <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 px-1">
//             <LinkIcon size={16} className="text-green-500" />
//             <span>Link liên kết ({sharedLinks.length})</span>
//           </h3>
//           <div className="space-y-2">
//             {sharedLinks.length > 0 ? sharedLinks.map((link, idx) => (
//               <a 
//                 key={idx} 
//                 href={link} 
//                 target="_blank" 
//                 rel="noreferrer" 
//                 className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-lg group transition-all border border-transparent hover:border-blue-100"
//               >
//                 <div className="p-2 bg-gray-50 rounded group-hover:bg-white text-green-500">
//                   <ExternalLink size={14} />
//                 </div>
//                 <span className="text-[11px] text-blue-600 truncate flex-1 underline">{link}</span>
//               </a>
//             )) : <p className="text-[11px] text-gray-400 text-center italic">Chưa có liên kết</p>}
//           </div>
//         </div>

//         {/* Privacy Action */}
//         <div className="pt-4 pb-8">
//           <button className="w-full text-left px-3 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
//              Chặn người dùng này
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatSidebarRight;


import React, { useMemo } from 'react';
import { X, Image as ImageIcon, Video, FileText, Link as LinkIcon, Download, ExternalLink } from 'lucide-react';

const ChatSidebarRight = ({ selectedUser, messages = [], onClose, onMediaClick  , onOpenGallery}) => {
  
  //Lọc Ảnh & Video 
  const sharedMedia = useMemo(() => 
    messages.filter(msg => msg.fileUrl && (msg.messageType === 'image' || msg.messageType === 'video')),
    [messages]
  );

  // Lọc File (
  const sharedFiles = useMemo(() => 
    messages.filter(msg => msg.fileUrl && msg.messageType === 'file'),
    [messages]
  );

  //Lọc Links 
  const sharedLinks = useMemo(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const links = [];
    messages.forEach(msg => {
      if (msg.messageType === 'text' && msg.text) {
        const found = msg.text.match(urlRegex);
        if (found) links.push(...found);
      }
    });
    return [...new Set(links)]; 
  }, [messages]);

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full animate-in slide-in-from-right duration-300 shadow-xl z-20">
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100 shrink-0">
        <span className="font-bold text-gray-700 uppercase text-xs tracking-wider">Thông tin hội thoại</span>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8">
        {/* Profile Section */}
        <div className="flex flex-col items-center pt-2">
          <img 
            src={selectedUser.avatar || "/default-avatar.png"} 
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md mb-3"
            alt="avatar"
          />
          <h2 className="font-bold text-lg text-gray-800">{selectedUser.username}</h2>
          <p className="text-xs text-gray-400 font-mono">@{selectedUser._id?.slice(-6)}</p>
        </div>

        <hr className="border-gray-50" />

        {/*ẢNH & VIDEO */}
        <div>
          <h3 className="flex items-center justify-between text-sm font-bold text-gray-700 mb-3 px-1">
            <div className="flex items-center gap-2">
              <ImageIcon size={16} className="text-blue-500" />
              <span>Ảnh/Video ({sharedMedia.length})</span>
            </div>
          </h3>
          {sharedMedia.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {/* Chỉ hiện 9 ảnh đầu tiên */}
              {sharedMedia.slice(0, 9).map((media, idx) => (
                <div 
                  key={idx} 
                  className="aspect-square bg-gray-900 rounded-sm overflow-hidden group relative cursor-pointer"
                  onClick={() => onMediaClick(media)} // Vẫn mở Lightbox khi click ảnh nhỏ
                >
                  {media.messageType === 'image' ? (
                    <img src={media.fileUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="media" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <video src={media.fileUrl} className="w-full h-full object-cover opacity-60" preload="metadata" muted />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                        <Video size={14} className="text-white fill-white" />
                      </div>
                    </div>
                  )}
                  {/* Hiện lớp phủ số lượng nếu là ô cuối cùng và còn ảnh */}
                  {idx === 8 && sharedMedia.length > 9 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">+{sharedMedia.length - 9}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-400 text-center py-4 bg-gray-50 rounded-md">Chưa có phương tiện</p>
          )}
          
          {sharedMedia.length > 3 && (
            <button 
              onClick={onOpenGallery} 
              className="w-full py-2 mt-2 text-xs text-gray-500 font-medium hover:bg-gray-50 rounded transition-colors"
            >
              Xem tất cả {sharedMedia.length} ảnh/video
            </button>
          )}
        </div>

        {/* FILE ĐÃ GỬI */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 px-1">
            <FileText size={16} className="text-orange-500" />
            <span>File đã gửi ({sharedFiles.length})</span>
          </h3>
          <div className="space-y-2">
            {sharedFiles.length > 0 ? sharedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group border border-transparent hover:border-gray-100 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 flex items-center justify-center bg-orange-50 rounded text-orange-500 shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12px] font-medium text-gray-700 truncate">{file.text || "Tài liệu đính kèm"}</span>
                    <span className="text-[10px] text-gray-400 lowercase">Tệp tin</span>
                  </div>
                </div>
                <a href={file.fileUrl} download className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-blue-500 transition-colors">
                  <Download size={14} />
                </a>
              </div>
            )) : <p className="text-[11px] text-gray-400 text-center py-4 bg-gray-50 rounded-md">Chưa có tệp tin</p>}
          </div>
        </div>

        {/* LINK LIÊN KẾT */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 px-1">
            <LinkIcon size={16} className="text-green-500" />
            <span>Link liên kết ({sharedLinks.length})</span>
          </h3>
          <div className="space-y-2">
            {sharedLinks.length > 0 ? sharedLinks.map((link, idx) => (
              <a 
                key={idx} 
                href={link} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-3 p-2 hover:bg-blue-50 rounded-lg group transition-all border border-transparent hover:border-blue-100"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-green-50 rounded text-green-500 shrink-0 group-hover:bg-white">
                  <ExternalLink size={16} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] text-blue-600 truncate underline font-medium">{link}</span>
                  <span className="text-[10px] text-gray-400">Trang web</span>
                </div>
              </a>
            )) : <p className="text-[11px] text-gray-400 text-center py-4 bg-gray-50 rounded-md">Chưa có liên kết</p>}
          </div>
        </div>

        <div className="pt-4 pb-10">
          <button className="w-full py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100">
             Chặn người dùng này
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebarRight;