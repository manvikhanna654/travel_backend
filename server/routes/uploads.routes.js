const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();
const receiptsDir = path.join(__dirname, '..', 'uploads', 'receipts');
fs.mkdirSync(receiptsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: receiptsDir,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) return callback(new Error('Only JPG, PNG, WEBP, or PDF receipts are allowed.'));
    callback(null, true);
  }
});

router.use(requireAuth);

router.post('/receipts', upload.single('receipt'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Choose a receipt file first.' });
  res.status(201).json({
    success: true,
    receiptUrl: `${req.protocol}://${req.get('host')}/api/uploads/receipts/${req.file.filename}`,
    originalName: req.file.originalname
  });
});

router.get('/receipts/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(receiptsDir, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'Receipt not found.' });
  res.sendFile(filePath);
});

module.exports = router;
