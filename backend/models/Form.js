import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  id: String,
  type: String, // 'text', 'longtext', 'number', 'email', 'radio', 'checkbox', 'rating'
  label: String,
  placeholder: String,
  required: Boolean,
  options: [String], // For radio/checkbox
});

const formSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, default: 'feedback' },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fields: { type: [Object], default: [] },
  publicId: { type: String, unique: true, required: true },
  status: { type: String, default: 'published' }, // 'draft', 'published', 'closed'
  theme: { type: Object, default: {} },
  responseCount: { type: Number, default: 0 }
}, { timestamps: true, strict: false });

export default mongoose.model('Form', formSchema);