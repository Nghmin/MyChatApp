import express from 'express';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import pkg from 'multer-storage-cloudinary';

const CloudinaryStorage = pkg.CloudinaryStorage || pkg.default?.CloudinaryStorage || pkg;

dotenv.config();
const app = express();
app.use(cors());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: {
    v2: cloudinary
  },
  params: {
    folder: 'chat_app_uploads',
    resource_type: 'auto',
  },
});

const upload = multer({ storage });

app.post('/upload', (req, res) => {
  console.log("--> Nhận yêu cầu upload mới...");
  
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error("❌ Lỗi Multer:", err);
      return res.status(500).json({ error: err.message });
    }
    if (!req.file) return res.status(400).json({ error: "Không nhận được file." });

    try {
      // Lưu ý: Tùy version mà kết quả trả về là path hoặc secure_url
      const url = req.file.path || req.file.secure_url;
      const publicId = req.file.filename || req.file.public_id;

      res.json({ url, publicId });
      console.log("✅ Thành công! URL:", url);
    } catch (error) {
      console.error("❌ Lỗi xử lý:", error);
      res.status(500).json({ error: "Lỗi Server" });
    }
  });
});

const PORT = process.env.PORT ;
app.listen(PORT, () => console.log(`🚀 Service chạy tại cổng ${PORT}`));



// import express from 'express';
// import cors from 'cors';
// import { v2 as cloudinary } from 'cloudinary';
// import multer from 'multer';
// import dotenv from 'dotenv';
// import pkg from 'multer-storage-cloudinary';

// dotenv.config();
// const app = express();
// app.use(cors());

// const CloudinaryStorage = pkg.CloudinaryStorage || pkg;

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// const storage = new CloudinaryStorage({
//   cloudinary: {
//     v2: cloudinary
//   },
//   params: {
//     folder: 'chat_app_images',
//     resource_type: 'auto',
//     allowed_formats: ['jpg', 'png', 'jpeg'],
//   },
// });


// const upload = multer({ storage });

// app.post('/upload', (req, res) => {
//   console.log("--> Nhận yêu cầu upload mới...");

//   upload.single('file')(req, res, async (err) => {
//     // Kiểm tra lỗi từ Multer
//     if (err) {
//       console.error("❌ Lỗi Multer:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     // DEBUG: Kiểm tra xem req.file và req.body có gì
//     console.log("Dữ liệu Body (Text):", req.body);
//     console.log("Dữ liệu File (Object):", req.file);

//     if (!req.file) {
//       return res.status(400).json({ 
//         error: "Multer không nhận được file. Hãy kiểm tra tên field trong FormData (phải là 'file')" 
//       });
//     }

//     try {
//       // Khi dùng multer-storage-cloudinary:
//       // Link ảnh thường nằm ở path hoặc secure_url
//       const url = req.file.path || req.file.secure_url;
//       const publicId = req.file.filename || req.file.public_id;

//       console.log("✅ Thành công! URL:", url);

//       // Xóa ảnh cũ
//       if (req.body.oldPublicId) {
//         await cloudinary.uploader.destroy(req.body.oldPublicId);
//       }

//       res.json({ url, publicId });
//     } catch (error) {
//       console.error("❌ Lỗi xử lý:", error);
//       res.status(500).json({ error: "Lỗi Cloudinary" });
//     }
//   });
// });

// const PORT = process.env.PORT;
// app.listen(PORT, () => console.log(`🚀 Upload Service chạy tại cổng ${PORT}`));