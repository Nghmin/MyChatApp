import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, UserPlus, User, Phone, Sparkles, ArrowLeft, MessageCircle, ShieldCheck, Zap } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    phone: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    setIsLoading(true);
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
      alert("Không thể kết nối đến Server!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-800 relative items-center justify-center p-12 overflow-hidden">
        {/* Decor Circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-indigo-400 rounded-full blur-[100px] opacity-30" 
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], rotate: [0, -45, 0] }}
            transition={{ duration: 15, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-pink-500 rounded-full blur-[120px] opacity-20" 
          />
        </div>

        <div className="relative z-10 max-w-md text-white">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link to="/login" className="inline-flex items-center gap-2 text-indigo-100 hover:text-white mb-12 transition-colors group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Trở lại Đăng nhập</span>
            </Link>
            
            <h1 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight">
              Bắt đầu hành trình <br />
              <span className="text-indigo-300">của bạn.</span>
            </h1>
            
            <p className="text-lg text-indigo-100/80 mb-10 leading-relaxed">
              Chỉ mất 30 giây để tạo tài khoản và tham gia cùng hàng ngàn người dùng khác.
            </p>

            <div className="space-y-6">
              {[
                { icon: <UserPlus className="w-6 h-6" />, title: "Miễn phí mãi mãi", desc: "Không phí duy trì, không quảng cáo phiền phức." },
                { icon: <ShieldCheck className="w-6 h-6" />, title: "Riêng tư tối đa", desc: "Chúng tôi coi trọng quyền cá nhân của bạn." },
                { icon: <Zap className="w-6 h-6" />, title: "Thiết lập nhanh", desc: "Đăng ký đơn giản, sử dụng được ngay." }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">{item.icon}</div>
                  <div>
                    <h3 className="font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-indigo-100/60">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- PHẦN BÊN PHẢI: FORM ĐĂNG KÝ --- */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 bg-gray-50/50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[500px] py-10"
        >
          <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-xl shadow-indigo-900/5 border border-gray-100">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản mới</h2>
              <p className="text-gray-500">Cùng chúng tôi tạo nên những cuộc trò chuyện thú vị.</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Username - Full width */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Tên hiển thị</label>
                <div className="relative group">
                  <input
                    type="text" placeholder="Nguyễn Văn A" required
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none bg-gray-50/50"
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Email</label>
                <div className="relative group">
                  <input
                    type="email" placeholder="name@email.com" required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none bg-gray-50/50"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Số điện thoại</label>
                <div className="relative group">
                  <input
                    type="tel" placeholder="0123xxx" required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none bg-gray-50/50"
                  />
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Mật khẩu</label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"} placeholder="••••••••" required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 pl-11 pr-11 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none bg-gray-50/50"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Xác nhận mật khẩu</label>
                <div className="relative group">
                  <input
                    type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 pl-11 pr-11 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none bg-gray-50/50"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit" disabled={isLoading}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="md:col-span-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><UserPlus className="w-5 h-5" /> Đăng ký ngay</>}
              </motion.button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-indigo-600 font-bold hover:underline">Đăng nhập</Link>
              </p>
            </div>
          </div>
          
          <p className="text-center text-xs text-gray-400 mt-8">
            Bằng việc đăng ký, bạn đồng ý với Điều khoản và Chính sách bảo mật của chúng tôi.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;