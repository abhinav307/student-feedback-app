import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  attemptId: { type: String, required: true, unique: true },
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  publicId: { type: String, required: true },
  startedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }, // null if no time limit
  submittedAt: { type: Date },
  status: { type: String, default: 'started' }, // 'started', 'submitted', 'expired'
  studentIdentifier: { type: String } 
}, { timestamps: true });

export default mongoose.model('QuizAttempt', quizAttemptSchema);
