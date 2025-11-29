// utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// 1. Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// 2. Config Multer Storage cho Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "UTE_Shop", // Tự đổi tên folder theo ý bạn
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    public_id: (req, file) => 'computed-filename-using-request',
  },
});

// 3. Tạo middleware upload dùng Multer
const upload = multer({ storage });

export default upload;
