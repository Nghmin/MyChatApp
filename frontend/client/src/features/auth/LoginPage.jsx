import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, MessageCircle, ShieldCheck, Zap, Globe } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:5000/auth/login', {
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* --- PHẦN BÊN TRÁI: GIỚI THIỆU (Ẩn trên mobile) --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative items-center justify-center p-12 overflow-hidden">
        {/* Hiệu ứng vòng tròn trang trí background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-white rounded-full blur-[100px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 15, repeat: Infinity, delay: 2 }}
            className="absolute -bottom-40 -right-20 w-[600px] h-[600px] bg-blue-400 rounded-full blur-[120px]" 
          />
        </div>

        <div className="relative z-10 max-w-lg text-white">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-lg rounded-2xl mb-8 border border-white/20">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight">
              Kết nối <br />
              <span className="text-blue-300">mọi lúc, mọi nơi.</span>
            </h1>
            
            <p className="text-xl text-blue-100/80 mb-12 leading-relaxed">
              Trải nghiệm ứng dụng nhắn tin thế hệ mới với tốc độ vượt trội và bảo mật tối đa.
            </p>

            {/* Các tính năng nổi bật */}
            <div className="grid grid-cols-1 gap-6">
              {[
                { icon: <ShieldCheck className="w-6 h-6" />, title: "Bảo mật tuyệt đối", desc: "Mã hóa đầu cuối dữ liệu cá nhân." },
                { icon: <Zap className="w-6 h-6" />, title: "Tốc độ cực nhanh", desc: "Tin nhắn gửi đi chỉ trong tích tắc." },
                { icon: <Globe className="w-6 h-6" />, title: "Đa nền tảng", desc: "Sử dụng mượt mà trên mọi thiết bị." }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                >
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-300">{item.icon}</div>
                  <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-sm text-blue-100/60">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- PHẦN BÊN PHẢI: FORM ĐĂNG NHẬP --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px]"
        >
          {/* Logo cho Mobile (Hiện lên khi màn hình nhỏ) */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Đăng nhập tài khoản</h2>
          </div>

          <div className="bg-white p-10 rounded-[32px] shadow-xl shadow-blue-900/5 border border-gray-100 relative overflow-hidden">
            {/* Thanh màu phía trên cùng của card */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng bạn!</h2>
              <p className="text-gray-500">Vui lòng nhập thông tin để tiếp tục.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Email</label>
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="name@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 pl-11 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none bg-gray-50/50 group-hover:bg-white"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
              </div>

              {/* Mật khẩu */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-gray-700">Mật khẩu</label>
                  <Link to="/forgot-password" size="sm" className="text-sm text-blue-600 font-medium hover:underline">Quên mật khẩu?</Link>
                </div>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pl-11 pr-11 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none bg-gray-50/50 group-hover:bg-white"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <><LogIn className="w-5 h-5" /> Đăng nhập</>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative flex items-center my-8">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">Hoặc đăng nhập với</span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-4">
                <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  </svg>
                  Google
                </button>
                <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700">
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </button>
              </div>
            </form>

            <div className="mt-10 text-center">
              <p className="text-gray-600">
                Bạn mới sử dụng ứng dụng?{' '}
                <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                  Tạo tài khoản
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8 leading-relaxed">
            © 2026 Chat App. Bảo lưu mọi quyền. <br />
            Chính sách bảo mật • Điều khoản sử dụng
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;