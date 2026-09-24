import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: false },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // 'image', 'gif', 'video'
  url: { type: String, required: true },
  filename: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Media', mediaSchema);