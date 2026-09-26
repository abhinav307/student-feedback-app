import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Media from '../models/Media.js';
import MediaService from '../services/MediaService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Ensure Cloudinary is configured (will pick up CLOUDINARY_URL from env)
// But to be safe if CLOUDINARY_URL fails, we can configure manually if needed
// Cloudinary automatically uses process.env.CLOUDINARY_URL if it exists.

// Configure multer-storage-cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine resource_type based on mimetype
    let resource_type = 'image';
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
      resource_type = 'video'; // Cloudinary uses 'video' for both video and audio
    }

    return {
      folder: 'formify',
      resource_type: resource_type,
      allowed_formats: ['jpg', 'png', 'webp', 'gif', 'mp4', 'mp3', 'wav', 'ogg']
    };
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
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
    if (req.file.mimetype.startsWith('audio/')) type = 'audio';

    // The file is already uploaded to Cloudinary by multer
    // req.file.path contains the secure cloudinary URL
    // req.file.filename contains the public_id
    const mediaData = {
      url: req.file.path,
      filename: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size
    };

    // Save metadata to DB
    const media = await Media.create({
      managerId: req.user._id,
      formId: formId || null,
      type,
      ...mediaData
    });

    res.status(201).json({
      _id: media._id,
      url: media.url, // Directly return the Cloudinary URL
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

    // Delete from Cloudinary
    await MediaService.delete(media.filename, media.type);
    
    // Delete from DB
    await media.deleteOne();

    res.json({ message: 'Media deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;