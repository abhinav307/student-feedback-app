import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  fieldId: String,
  value: mongoose.Schema.Types.Mixed
});

const responseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  answers: [answerSchema],
  studentName: { type: String, required: true }, // extracted for easy display
  course: { type: String }, // optional, depending on form
  receiptId: { type: String, unique: true, required: true }
}, { timestamps: true });

export default mongoose.model('Response', responseSchema);