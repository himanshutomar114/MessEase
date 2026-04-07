import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Set storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

// File filter function to restrict file types
const fileFilter = (req, file, cb) => {
  // Accept only jpeg, jpg, and png files
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/webp" ||
    file.mimetype === "image/gif"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, JPG, and PNG files are allowed."
      ),
      false
    );
  }
};

// Setup multer with configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB in bytes
  },
});

export default upload;
