import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  fieldId: { type: String, required: true },
  fieldLabel: { type: String, required: true },
  fieldType: { type: String, required: true },
  value: mongoose.Schema.Types.Mixed
});

const responseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  receiptId: { type: String, unique: true, required: true },
  
  // Dynamically mapped fields based on form content heuristics
  studentName: { type: String, default: 'Anonymous' },
  email: { type: String, default: 'N/A' },
  course: { type: String, default: 'N/A' },
  branch: { type: String, default: 'N/A' },
  semester: { type: String, default: 'N/A' },
  
  answers: [answerSchema],
  
  quizResult: {
    totalMarks: { type: Number, default: 0 },
    obtainedMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    timeTaken: { type: Number, default: 0 },
    questionResults: { type: [Object], default: [] }
  },
  
  metadata: { type: Object, default: {} }
}, { timestamps: true, strict: false }); // timestamps adds createdAt (submittedAt)

export default mongoose.model('Response', responseSchema);
