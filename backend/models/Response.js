import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  fieldId: { type: String, required: true },
  fieldLabel: { type: String, required: true },
  fieldType: { type: String, required: true },
  value: mongoose.Schema.Types.Mixed
});

const responseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  submissionId: { type: String, unique: true, required: true },
  
  // Dynamically mapped fields based on form content heuristics
  studentName: { type: String, default: 'Anonymous' },
  email: { type: String, default: 'N/A' },
  course: { type: String, default: 'N/A' },
  branch: { type: String, default: 'N/A' },
  semester: { type: String, default: 'N/A' },
  
  answers: [answerSchema],
  
  quizScore: { type: Number, default: 0 },
  completionTime: { type: Number, default: 0 },
  
  metadata: { type: Object, default: {} }
}, { timestamps: true }); // timestamps adds createdAt (submittedAt)

export default mongoose.model('Response', responseSchema);
