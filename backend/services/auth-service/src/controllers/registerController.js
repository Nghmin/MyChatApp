import bcrypt from 'bcrypt';
import User from '../models/User.js';

export const postRegister = async (req, res) => {
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
            password: hashedPassword ,
            avatar: process.env.AVATAR_DEFAULT_URL,
            avatarPublicId: process.env.AVATAR_DEFAULT_PUBLIC_ID
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
}