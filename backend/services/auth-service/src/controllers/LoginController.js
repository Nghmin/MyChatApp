import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
export const postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Email không tồn tại!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu!" });

        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );
        console.log(token);

        res.status(200).json({ 
            token,
            userId: user._id, 
            username: user.username,
            avatar: user.avatar || '',
            avatarPublicId: user.avatarPublicId ||'',
            phone: user.phone ||'',
            gender: user.gender ||'',
            birthday: user.birthday ||'',
            message: "Đăng nhập thành công!" 
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server khi đăng nhập" });
        console.log(error);
    }
}