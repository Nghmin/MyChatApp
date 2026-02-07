import { X, LogOut, Trash2, UserPlus } from 'lucide-react';
import React from 'react';
const GroupInfoModal = ({ isOpen, onClose, groupData, currentUserId , onOpenCreateGroup }) => {
  if (!isOpen || !groupData) return null;

  const isAdmin = groupData.admin === currentUserId;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg w-full max-w-[380px] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-600">
          <div className="absolute top-0 w-full p-3 flex justify-between items-center text-white">
            <h3 className="text-[15px] font-semibold">Thông tin nhóm</h3>
            <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1"><X size={20} /></button>
          </div>
          {/* Avatar nhóm */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
             <div className="w-20 h-20 rounded-full border-[3px] border-white overflow-hidden bg-gray-100 shadow-md">
                <img src={groupData.avatar || 'https://img.icons8.com/fluency/96/group.png'} className="w-full h-full object-cover" />
             </div>
          </div>
        </div>

        <div className="px-5 pt-12 pb-6">
          <h2 className="text-center text-lg font-bold text-gray-800">{groupData.username}</h2>
          
          <div className="mt-6">
            <div className="flex justify-between items-center border-b pb-2">
                <h4 className="font-bold text-sm text-gray-700">Thành viên ({groupData.members?.length})</h4>
                {isAdmin && <button className="text-blue-600 hover:text-blue-700"><UserPlus size={18} onClick={() => {onOpenCreateGroup(groupData)}} /></button>}
            </div>
            
            <div className="max-h-48 overflow-y-auto mt-2 custom-scrollbar">
              {groupData.membersDetails?.map(member => (
                <div key={member._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={member.avatar || 'https://img.icons8.com/color/48/user.png'} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                        <p className="text-sm font-medium text-gray-800">{member.username}</p>
                        {groupData.admin === member._id && <p className="text-[10px] text-blue-500 font-semibold uppercase">Trưởng nhóm</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-red-500 hover:bg-red-50 rounded-xl text-sm font-semibold transition-all">
                <LogOut size={18} /> Rời nhóm
            </button>
            {isAdmin && (
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-bold transition-all">
                <Trash2 size={18} /> Giải tán nhóm
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default GroupInfoModal;