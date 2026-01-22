import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  // Thêm phone và confirmPassword vào state
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    phone: '', 
    password: '', 
    confirmPassword: '' 
  });

  // State để ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Đã nhấn nút đăng ký!", formData);

    try {
      const response = await fetch('http://127.0.0.1:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Đăng ký thành công!");
        navigate('/login'); 
      } else {
        alert(data.message); 
      }
    } catch (err) {
      console.error("Lỗi:", err);
      alert("Không thể kết nối đến Server!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl mb-6 font-bold text-center text-gray-800">Đăng ký tài khoản</h2>
        
        {/* Username */}
        <input 
          type="text" placeholder="Tên hiển thị" required
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) => setFormData({...formData, username: e.target.value})}
        />

        {/* Email */}
        <input 
          type="email" placeholder="Email" required
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />

        {/* Số điện thoại */}
        <input 
          type="tel" placeholder="Số điện thoại" required
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />

        {/* Mật khẩu có nút Ẩn/Hiện */}
        <div className="relative mb-4">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Mật khẩu" required
            className="w-full p-2 border rounded"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button 
            type="button"
            className="absolute right-3 top-2 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Xác nhận mật khẩu có nút Ẩn/Hiện */}
        <div className="relative mb-6">
          <input 
            type={showConfirmPassword ? "text" : "password"} 
            placeholder="Xác nhận mật khẩu" required
            className="w-full p-2 border rounded"
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          />
          <button 
            type="button"
            className="absolute right-3 top-2 text-gray-500"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition">
          Đăng ký
        </button>

        <p className="mt-4 text-sm text-center">
            Đã có tài khoản? <Link to="/login" className="text-blue-500 hover:underline">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;