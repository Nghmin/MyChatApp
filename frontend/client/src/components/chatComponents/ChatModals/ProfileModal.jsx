import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { Camera, X, Pencil, Phone, MessageSquare } from 'lucide-react';
import { formatToVNPhone } from '../../../utils/phoneFormatUser';
import { 
  days, months, years, 
  selectDateStyles, 
  parseBirthDateToObj, 
  formatBirthDateToString 
} from '../../../utils/birthDateForm';

const ProfileModal = ({ isOpen, onClose, myInfo, targetUser, onUpdateSuccess }) => {
  const isMe = !targetUser || myInfo?._id === targetUser?._id;
  const isCloud = targetUser?.username === "Cloud của tôi";
  const userDisplay = isMe ? myInfo : targetUser;

  // States dữ liệu
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPublicId, setCurrentPublicId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [birthDate, setBirthDate] = useState({ day: '', month: '', year: '' });

  // Hàm Reset dữ liệu
  const resetData = () => {
    setIsEditing(false);
    setImage(null);
    setUsername(userDisplay?.username || '');
    setGender(userDisplay?.gender || 'Nam');
    setPhone(userDisplay?.phone || '');
    setPreviewUrl(userDisplay?.avatar || '');
    setCurrentPublicId(userDisplay?.avatarPublicId || '');
    
    if (userDisplay?.birthday) {
      const dateObj = parseBirthDateToObj(userDisplay.birthday);
      setBirthDate(dateObj);
      setBirthday(userDisplay.birthday);
    } else {
      setBirthDate({ day: '', month: '', year: '' });
      setBirthday('');
    }
  };

  useEffect(() => {
    if (isOpen) {
      resetData();
    }
  }, [isOpen, userDisplay]);

  // Giải phóng bộ nhớ cho ảnh preview
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  // Xử lý thay đổi file ảnh
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (isMe) setIsEditing(true);
    }
  };

  // Xử lý thay đổi Ngày/Tháng/Năm 
  const handleDateSelection = (field, value) => {
    const newDate = { ...birthDate, [field]: value };
    setBirthDate(newDate);
    const dateString = formatBirthDateToString(newDate);
    setBirthday(dateString);
  };

  // Hàm cập nhật Profile
  const handleUpdate = async () => {
    if (!username.trim()) return alert("Tên không được để trống");
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      let finalAvatarUrl = userDisplay?.avatar || '';
      let finalPublicId = currentPublicId || '';

      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        const uploadRes = await axios.post('http://127.0.0.1:5000/upload/upload', formData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' 
          }
        });
        if (uploadRes.data && uploadRes.data.url) {
          finalAvatarUrl = uploadRes.data.url;
          finalPublicId = uploadRes.data.publicId;
        }
      }

      const payload = {
        userId: userDisplay?.userId || userDisplay?._id,
        username,
        gender,
        birthday,
        avatar: finalAvatarUrl,
        avatarPublicId: finalPublicId
      };

      const updateRes = await axios.put('http://127.0.0.1:5000/auth/update-profile', payload, {
        headers: { 'Authorization': `Bearer ${token}` } 
      });

      if (updateRes.status === 200) {
        onUpdateSuccess(updateRes.data);
        alert("Cập nhật thành công!");
        setIsEditing(false);
        setImage(null);
      }
    } catch (err) {
      console.error("Lỗi:", err);
      alert("Lỗi cập nhật. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4 font-sans text-gray-800">
      <div className="bg-white rounded-lg w-full max-w-[380px] overflow-hidden shadow-2xl">
        
        {/* Banner */}
        <div className="relative h-32 bg-blue-500">
          <img 
            src="https://images.unsplash.com/photo-1511447333015-45b65e60f6d5" 
            className="w-full h-full object-cover opacity-80" 
            alt="cover"
          />
          <div className="absolute top-0 w-full p-3 flex justify-between items-center text-white bg-gradient-to-b from-black/40 to-transparent">
            <h3 className="text-[15px] font-semibold">Thông tin tài khoản</h3>
            <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition-colors"><X size={20} /></button>
          </div>
        </div>

        <div className="px-5 pb-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center -mt-10">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-[3px] border-white overflow-hidden bg-gray-100 shadow-md">
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" alt="avatar" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-2xl uppercase">
                    {username ? username[0] : '?'}
                  </div>
                )}
              </div>
              {isMe && (
                <label className="absolute bottom-0 right-0 bg-[#f1f2f4] p-1.5 rounded-full text-gray-700 border border-gray-300 cursor-pointer shadow-sm hover:bg-gray-200 transition-colors">
                  <Camera size={14} />
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              {isEditing ? (
                <input 
                  className="text-lg font-bold text-center border-b-2 border-blue-500 outline-none w-full max-w-[200px] px-2"
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />
              ) : (
                <h2 className="text-lg font-bold">{username}</h2>
              )}
            </div>
          </div>
            
          {!isCloud && (
            <div className="mt-6 space-y-4">
              <h4 className="text-[14px] font-bold border-b pb-2">Thông tin cá nhân</h4>
              
              {/* Giới tính */}
              <div className="flex items-center text-[14px]">
                <span className="w-24 text-gray-500">Giới tính</span>
                {isEditing ? (
                  <div className="flex gap-4">
                    {['Nam', 'Nữ'].map(g => (
                      <label key={g} className="flex items-center gap-1 cursor-pointer">
                        <input  
                          type="radio" 
                          name="gender" 
                          checked={gender === g} 
                          onChange={() => setGender(g)} 
                        /> {g}
                      </label>
                    ))}
                  </div>
                ) : (
                  <span>{gender || 'Chưa cập nhật'}</span>
                )}
              </div>

              {/* Ngày sinh với React-Select */}
              <div className="flex items-center text-[14px]">
                <span className="w-24 text-gray-500">Ngày sinh</span>
                {isEditing ? (
                  <div className="flex gap-1 flex-1">
                    <Select
                      styles={selectDateStyles}
                      options={days.map(d => ({ value: d, label: d }))}
                      placeholder="Ngày"
                      value={birthDate.day ? { value: birthDate.day, label: birthDate.day } : null}
                      onChange={(opt) => handleDateSelection('day', opt.value)}
                      className="flex-1"
                    />
                    <Select
                      styles={selectDateStyles}
                      options={months.map(m => ({ value: m, label: `Th. ${m}` }))}
                      placeholder="Tháng"
                      value={birthDate.month ? { value: birthDate.month, label: `Th. ${birthDate.month}` } : null}
                      onChange={(opt) => handleDateSelection('month', opt.value)}
                      className="flex-1"
                    />
                    <Select
                      styles={selectDateStyles}
                      options={years.map(y => ({ value: y, label: y }))}
                      placeholder="Năm"
                      value={birthDate.year ? { value: birthDate.year, label: birthDate.year } : null}
                      onChange={(opt) => handleDateSelection('year', opt.value)}
                      className="flex-[1.2]"
                    />
                  </div>
                ) : (
                  <span>{birthday ? new Date(birthday).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
                )}
              </div>

              {/* Điện thoại */}
              <div className="flex items-center text-[14px] border-b pb-4">
                <span className="w-24 text-gray-500">Điện thoại</span>
                {isEditing ? (
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      className="w-full border rounded px-2 py-1 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                      value={phone} 
                      readOnly 
                    />
                    <span className="absolute right-2 top-1.5 text-[10px] text-gray-400 italic">Cố định</span>
                  </div>
                ) : ( 
                  <span className="text-gray-800 font-medium">
                    {isMe ? formatToVNPhone(phone) : "+84 *********"}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Nút hành động */}
          {isMe ? (
            <div className="mt-6">
              {isEditing || image ? (
                <div className="flex gap-2">
                  <button onClick={resetData} className="flex-1 py-2 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">Hủy</button>
                  <button onClick={handleUpdate} disabled={loading} className="flex-[2] py-2 text-sm font-bold text-white bg-[#0068ff] rounded-full disabled:bg-blue-300 shadow-md">
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <Pencil size={14} /> Cập nhật
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mt-5">
              <button className="flex items-center justify-center gap-2 bg-[#f1f2f4] py-2 rounded-md hover:bg-gray-200 text-[14px] font-medium"><Phone size={18} /> Gọi điện</button>
              <button className="flex items-center justify-center gap-2 bg-[#0068ff] text-white py-2 rounded-md hover:bg-[#005ae0] text-[14px] font-medium"><MessageSquare size={18} /> Nhắn tin</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;