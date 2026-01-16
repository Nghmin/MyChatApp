import User from '../models/User.js';

export const putUpdateProfile = async (req, res) => {
    console.log("Body nhận được:", req.body);
    try {
        const userIdFromToken = req.headers['x-user-id'];
        const { userId, username, avatar, avatarPublicId , gender , birthday } = req.body;
        const targetId = userIdFromToken || req.body.userId;
        if (!targetId) {
            return res.status(400).json({ message: "Thiếu ID người dùng" });
        }

        console.log("=> Đang cập nhật DB cho ID:", userId);
        
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
}