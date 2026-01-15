import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                alert("Chào mừng " + data.username + " quay trở lại!");
                navigate('/chat'); 
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Lỗi kết nối Server!");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl mb-6 font-bold text-center">Đăng nhập</h2>
                
                <input 
                    type="email" placeholder="Email" required
                    className="w-full p-2 mb-4 border rounded"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <div className="relative mb-6">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Mật khẩu" required
                        className="w-full p-2 border rounded"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                        type="button" 
                        className="absolute right-3 top-2"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </button>
                </div>

                <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition">
                    Đăng nhập
                </button>

                <p className="mt-4 text-sm text-center">
                    Chưa có tài khoản? <Link to="/register" className="text-blue-500 hover:underline">Đăng ký ngay</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;