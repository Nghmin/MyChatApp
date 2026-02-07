import React, { useState, useEffect } from 'react';
import { X, Search, Camera, Check } from 'lucide-react';

const CreateGroupModal = ({ isOpen, onClose, friends, initialSelectedUser, onCreateGroup }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Kiểm tra xem là tạo nhóm mới hay thêm thành viên vào nhóm có sẵn
  const isAddingToGroup = initialSelectedUser?.isGroup;

  const existingMemberIds = isAddingToGroup 
    ? initialSelectedUser.members?.map(m => (m._id || m).toString()) || []
    : [];

  useEffect(() => {
    if (isOpen) {
      if (initialSelectedUser) {
        if (isAddingToGroup) {
          setSelectedMembers(existingMemberIds);
          setGroupName(initialSelectedUser.name || '');
        } else {
         
          setSelectedMembers([initialSelectedUser._id.toString()]);
          setGroupName('');
        }
      } else {
        setSelectedMembers([]);
        setGroupName('');
      }
      setSearchQuery('');
    }
  }, [isOpen, initialSelectedUser, isAddingToGroup]);

  if (!isOpen) return null;

  const toggleMember = (userId) => {
    const idStr = userId.toString();
    
    if (isAddingToGroup && existingMemberIds.includes(idStr)) {
      return;
    }

    setSelectedMembers(prev => 
      prev.includes(idStr) ? prev.filter(id => id !== idStr) : [...prev, idStr]
    );
  };

  const handleConfirm = () => {
    if (isAddingToGroup) {
      const newInviteeIds = selectedMembers.filter(id => !existingMemberIds.includes(id));
      
      onCreateGroup({ 
        groupId: initialSelectedUser._id,
        newMembers: newInviteeIds, 
        isInvite: true
      });
    } else {
      // Logic tạo nhóm mới như cũ
      onCreateGroup({ 
        name: groupName, 
        members: selectedMembers,
        groupId: null 
      });
    }
  };

  const filteredFriends = friends.filter(f => 
    f.username !== "Cloud của tôi" && 
    f.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 animate-fadeIn">
      <div className="bg-white w-[420px] rounded-lg shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h3 className="font-bold text-[16px]">{isAddingToGroup ? 'Thêm thành viên' : 'Tạo nhóm mới'}</h3>
          <button onClick={onClose} className="hover:bg-gray-200 p-1 rounded-full"><X size={20} /></button>
        </div>

        {/* Input Tên nhóm - Chỉ hiện khi tạo mới */}
        {!isAddingToGroup && (
          <div className="p-5 flex gap-4 items-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border-2 border-dashed border-blue-200 cursor-pointer hover:bg-blue-100">
              <Camera size={20} className="text-blue-500" />
            </div>
            <input 
              className="flex-1 border-b-2 border-gray-100 py-2 outline-none focus:border-blue-500 transition-all text-[15px]"
              placeholder="Nhập tên nhóm..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
        )}

        {/* Search */}
        <div className={`px-5 mb-2 ${isAddingToGroup ? 'mt-4' : ''}`}>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              className="w-full bg-[#f1f2f4] rounded-md py-2 pl-10 pr-4 text-[13px] outline-none"
              placeholder="Tìm kiếm bạn bè..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Danh sách bạn bè */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          <p className="px-4 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
            {isAddingToGroup ? 'Bạn bè' : 'Gợi ý'}
          </p>
          {filteredFriends.map(friend => {
            const friendIdStr = friend._id.toString();
            const isAlreadyMember = existingMemberIds.includes(friendIdStr);
            const isSelected = selectedMembers.includes(friendIdStr);

            return (
              <div 
                key={friendIdStr}
                onClick={() => toggleMember(friendIdStr)}
                className={`flex items-center px-4 py-2.5 rounded-lg transition-colors group ${
                  isAlreadyMember ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'hover:bg-blue-50 cursor-pointer'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${
                  isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                }`}>
                  {isSelected && <Check size={12} className="text-white" />}
                </div>
                <img src={friend.avatar || "/default-avatar.png"} className="w-10 h-10 rounded-full object-cover shadow-sm mr-3" alt="" />
                <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-gray-700">{friend.username}</span>
                    {isAlreadyMember && <span className="text-[10px] text-blue-500 font-medium">Đã là thành viên</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-[14px] font-bold text-gray-600 hover:bg-gray-200 rounded-md">Hủy</button>
          <button 
            onClick={handleConfirm}
            disabled={!isAddingToGroup && (!groupName.trim() || selectedMembers.length < 2)}
            className={`px-6 py-2 text-[14px] font-bold rounded-md text-white shadow-md transition-all ${
              isAddingToGroup || (groupName.trim() && selectedMembers.length >= 2)
                ? 'bg-blue-500 hover:bg-blue-600 active:scale-95' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isAddingToGroup ? 'Xác nhận' : 'Tạo nhóm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;