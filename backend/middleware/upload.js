const multer = require('multer');

// Store files in memory so we can upload them directly to cloudinary or other services
// Actually, since we want something simple and working without external services if not provided,
// let's use disk storage temporarily or memory storage. Memory storage is fine for Cloudinary.

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
