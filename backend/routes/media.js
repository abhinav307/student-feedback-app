import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import Media from '../models/Media.js';
import MediaService from '../services/MediaService.js';
import { protect } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

const router = express.Router();

// Multer config for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Validation
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, GIF, and MP4 are allowed.'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for videos
});

// Upload endpoint
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { formId } = req.body;
    let type = 'image';
    if (req.file.mimetype === 'image/gif') type = 'gif';
    if (req.file.mimetype.startsWith('video/')) type = 'video';

    // Process via abstract service
    const mediaData = await MediaService.upload(req.file);

    // Save metadata to DB
    const media = await Media.create({
      managerId: req.user._id,
      formId: formId || null,
      type,
      ...mediaData
    });

    // Send back the full URL (handling local dev vs production)
    // For local, we prepend the backend URL if we want, or just let frontend handle relative
    res.status(201).json({
      _id: media._id,
      url: `http://localhost:5000${media.url}`,
      type: media.type,
      filename: media.filename
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media || media.managerId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Media not found' });
    }

    await MediaService.delete(media.filename);
    await media.deleteOne();

    res.json({ message: 'Media deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;