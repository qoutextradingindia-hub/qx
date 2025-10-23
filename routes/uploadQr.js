const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

const router = express.Router();

// Cloudinary config (env से)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/admin/upload-qr
router.post('/api/admin/upload-qr', upload.single('qr'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  try {
    const stream = Readable.from(req.file.buffer);
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'startraders/qr' },
      (error, result) => {
        if (error) {
          return res.status(500).json({ success: false, message: 'Cloudinary upload failed', error: error.message || error });
        }
        res.json({ success: true, url: result.secure_url });
      }
    );
    stream.pipe(uploadStream);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to upload to Cloudinary', error: err.message || err });
  }
});

module.exports = router;
