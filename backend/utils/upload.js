const multer = require('multer');
const path = require('path');

// Memory storage for direct buffer processing or cloud upload streaming
const storage = multer.memoryStorage();

// File filter (images, PDFs, documents)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif|svg|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image (JPEG, PNG, WebP, GIF, SVG) and PDF files are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

module.exports = upload;
