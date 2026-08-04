import { X, LogOut, Trash2, UserPlus, ChevronDown, Camera, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';
import { showConfirmDialogToast } from '../../../utils/toastHelpers';

const GroupInfoModal = ({ isOpen, onClose, groupData, currentUserId, onOpenCreateGroup, friends = [], onShowProfile = null, onAddMember = null, onGroupUpdated = null, socket = null }) => {
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  if (!isOpen || !groupData) return null;

  const isAdmin = groupData.admin === currentUserId;
  const currentUserFriendsIds = friends
    .filter(f => !f.isGroup && f.username !== "Cloud của tôi")
    .map(f => f._id);

  // Hàm tính bạn chung
  const getCommonFriendsCount = (memberId) => {
    if (!groupData.members) return 0;
    const member = groupData.members.find(m => m._id === memberId);
    if (!member || !member.friends) return 0;
    return member.friends.filter(f => currentUserFriendsIds.includes(f._id || f)).length;
  };

  // Hàm xử lý upload avatar nhóm
  const handleUploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showConfirmDialogToast.error("Dung lượng file quá lớn (tối đa 5MB)");
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      // Upload ảnh
      const uploadRes = await axios.post('http://localhost:5000/upload/upload', formData, {
        headers: {
          // 'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      if (uploadRes.data?.url && uploadRes.data?.publicId) {
        // Cập nhật avatar nhóm
        const updateRes = await axios.put('http://localhost:5000/friend/friend/group/update-avatar', {
          groupId: groupData._id,
          avatar: uploadRes.data.url,
          avatarPublicId: uploadRes.data.publicId
        }, {
          //headers: { 'Authorization': `Bearer ${token}` }
          withCredentials: true
        });

        if (updateRes.status === 200) {
          showConfirmDialogToast.success("Cập nhật ảnh nhóm thành công!");
          if (onGroupUpdated) {
            onGroupUpdated(updateRes.data.updatedGroup);
          }
          // Emit socket event để broadcast cho tất cả thành viên
          if (socket) {
            socket.emit('update_group_avatar', {
              groupId: groupData._id,
              updatedGroup: updateRes.data.updatedGroup
            });
          }
        }
      }
    } catch (err) {
      console.error("Lỗi upload:", err);
      showConfirmDialogToast.error("Lỗi cập nhật ảnh nhóm");
    } finally {
      setIsUploading(false);
    }
  };

  // Hàm xử lý click thành viên
  const handleMemberClick = (member) => {
    if (onShowProfile) {
      onShowProfile(member);
    }
  };

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
             <div className="relative w-20 h-20">
                <div className="w-20 h-20 rounded-full border-[3px] border-white overflow-hidden bg-gray-100 shadow-md">
                   <img src={groupData.avatar || 'https://img.icons8.com/fluency/96/group.png'} className="w-full h-full object-cover" alt="group-avatar" />
                </div>
                {isAdmin && (
                  <label className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-all shadow-md border-2 border-white">
                    {isUploading ? (
                      <Loader2 size={16} className="text-white animate-spin" />
                    ) : (
                      <Camera size={16} className="text-white" />
                    )}
                    <input 
                      type="file" 
                      hidden 
                      accept="image/*" 
                      onChange={handleUploadAvatar}
                      disabled={isUploading}
                    />
                  </label>
                )}
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
              {groupData.members?.map((member, index) => {
                // Hiển thị tất cả thành viên nếu all, ngược lại chỉ hiển thị 5 thành viên đầu tiên
                if (!showAllMembers && index >= 5) return null;
                const commonFriendsCount = getCommonFriendsCount(member._id);
                return (
                  <div 
                    key={member._id} 
                    onClick={() => handleMemberClick(member)}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img src={member.avatar || 'https://img.icons8.com/color/48/user.png'} className="w-9 h-9 rounded-full object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 truncate">{member.username}</p>
                          {groupData.admin === member._id && <p className="text-[10px] text-blue-500 font-semibold uppercase">Trưởng nhóm</p>}
                          {commonFriendsCount > 0 && <p className="text-[10px] text-gray-500">{commonFriendsCount} bạn chung</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Nút xem thêm khi > 5 thành viên */}
              {groupData.members?.length > 5 && (
                <button 
                  onClick={() => setShowAllMembers(!showAllMembers)}
                  className="w-full flex items-center justify-center gap-1 p-2 mt-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors"
                >
                  <ChevronDown size={16} className={`transform transition-transform ${showAllMembers ? 'rotate-180' : ''}`} />
                  {showAllMembers ? 'Ẩn bớt' : `Xem tất cả (${groupData.members.length})`}
                </button>
              )}
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