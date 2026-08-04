import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const verifyToken = (req, res, next) => {
    
    // const authHeader = req.headers['authorization'];
    // const token = authHeader && authHeader.split(' ')[1];
    const token = req.cookies ? req.cookies.token : null;

    if (!token) return res.status(401).json({ message: "Vui lòng đăng nhập!" });
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; 
        next();
    } catch (err) {
        console.log("Lỗi Verify Token:", err.message);
        return res.status(403).json({ message: "Token không hợp lệ hoặc hết hạn!" });
        
    }
};