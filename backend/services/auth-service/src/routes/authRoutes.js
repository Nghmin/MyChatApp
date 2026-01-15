import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { validateRegister  , validateLogin} from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

// API Đăng ký: POST /register
router.post('/register',validateRegister, async (req, res) => {
    try {
        const { username, email, phone ,password } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) return res.status(400).json({ message: "Email hoặc Số điện thoại đã tồn tại!" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ 
            username, 
            email, 
            phone, 
            password: hashedPassword 
        });
        await newUser.save();

        res.status(201).json({ 
            message: "Đăng ký thành công!", 
            userId: newUser._id, 
        });
    } catch (error) {
        console.error("LỖI TẠI AUTH SERVICE:", error);
        res.status(500).json({ message: "Lỗi Server khi đăng ký" });
        console.log(error);
    }
});

// API Đăng nhập: POST /login
router.post('/login',validateLogin, async (req, res) => {
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
});

// API upload: put /update
router.put('/update-profile', async (req, res) => {
    console.log("Body nhận được:", req.body);
    try {
        const userIdFromToken = req.headers['x-user-id'];
        const { userId, username, avatar, avatarPublicId , gender , birthday } = req.body;
        const targetId = userIdFromToken || req.body.userId;
        if (!targetId) {
            return res.status(400).json({ message: "Thiếu ID người dùng" });
        }

        console.log("=> Đang cập nhật DB cho ID:", userId);
        
        // 
        const updatedUser = await User.findByIdAndUpdate(
            targetId, 
            { 
                username, 
                avatar, 
                avatarPublicId ,
                gender,
                birthday,
            }, 
            { new: true } 
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "Không tìm thấy User" });
        }

        console.log("=> OK: Cập nhật thành công!");
        return res.json({
            userId: updatedUser._id,
            username: updatedUser.username,
            avatar: updatedUser.avatar,
            avatarPublicId: updatedUser.avatarPublicId ,
            gender:updatedUser.gender,
            birthday:updatedUser.birthday,
        });
    } catch (error) {
        console.error("=> LỖI TẠI AUTH SERVICE:", error);
        return res.status(500).json({ error: "Lỗi cập nhật database" });
    }
});
export default router;