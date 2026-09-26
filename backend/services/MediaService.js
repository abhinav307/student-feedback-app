import { v2 as cloudinary } from 'cloudinary';

class MediaService {
  /**
   * Delete media from Cloudinary
   * @param {string} publicId - The Cloudinary public_id (stored as filename in DB)
   * @param {string} type - The media type ('image', 'video', 'audio', 'gif')
   */
  async delete(publicId, type = 'image') {
    try {
      if (!publicId) return false;
      
      let resourceType = 'image';
      if (type === 'video' || type === 'audio') {
        resourceType = 'video';
      }

      const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      return result.result === 'ok';
    } catch (err) {
      console.error('Error deleting file from Cloudinary:', err);
      return false;
    }
  }
}

export default new MediaService();