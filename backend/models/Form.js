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
  type: { type: String, default: 'feedback' }, // 'feedback', 'quiz', 'survey'
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fields: [fieldSchema],
  publicId: { type: String, unique: true, required: true },
  status: { type: String, default: 'published' }, // 'draft', 'published', 'closed'
  theme: {
    primaryColor: { type: String, default: '#4f46e5' },
    backgroundColor: { type: String, default: '#f9fafb' },
    fontFamily: { type: String, default: 'Inter, sans-serif' }
  }
}, { timestamps: true });

export default mongoose.model('Form', formSchema);