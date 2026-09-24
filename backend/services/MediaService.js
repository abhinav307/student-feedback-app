import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

class MediaService {
  /**
   * Abstracted upload method. Currently uses local storage, 
   * but can be swapped out for S3/Cloudinary in production.
   */
  async upload(file) {
    // With multer, the file is already saved to disk. We just return the URL structure.
    const url = `/uploads/${file.filename}`;
    return {
      url,
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size
    };
  }

  async delete(filename) {
    try {
      const filePath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting file:', err);
      return false;
    }
  }

  getUrl(filename) {
    return `/uploads/${filename}`;
  }
}

export default new MediaService();