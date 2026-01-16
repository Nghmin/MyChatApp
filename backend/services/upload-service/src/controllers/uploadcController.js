import { upload } from '../config/cloudinary.js';
export const postUpload = async (req, res) => {
    console.log("--> Controller: Xử lý kết quả sau khi upload...");
    if (!req.file) {
        return res.status(400).json({ error: "Không nhận được file." });
    }

    try {
        const url = req.file.path || req.file.secure_url;
        const publicId = req.file.filename || req.file.public_id;

        console.log("✅ Thành công! URL:", url);
        return res.json({ url, publicId });
    } catch (error) {
        console.error("❌ Lỗi xử lý:", error);
        return res.status(500).json({ error: "Lỗi Server" });
    }
};