import express from 'express';
import Response from '../models/Response.js';
import Form from '../models/Form.js';
import Notification from '../models/Notification.js';
import QuizAttempt from '../models/QuizAttempt.js';
import crypto from 'crypto';
import { protect } from '../middleware/auth.js';
import { validateAnswers } from '../services/FormAnswerValidator.js';

const router = express.Router();


// Start quiz attempt
router.post('/quiz/start/:publicId', async (req, res) => {
  try {
    const form = await Form.findOne({ publicId: req.params.publicId });
    if (!form) return res.status(404).json({ message: 'Form not found', code: 'QUIZ_UNAVAILABLE' });
    if (form.type !== 'quiz') return res.status(400).json({ message: 'Not a quiz.' });
    if (form.status !== 'published') return res.status(403).json({ message: 'This quiz is currently unavailable.', code: 'QUIZ_UNAVAILABLE' });
    
    const settings = form.settings || {};
    const now = new Date();
    if (settings.startDate && new Date(settings.startDate) > now) return res.status(403).json({ message: 'This quiz is not open yet.', code: 'QUIZ_UNAVAILABLE' });
    if (settings.endDate && new Date(settings.endDate) < now) return res.status(403).json({ message: 'This quiz has expired.', code: 'QUIZ_UNAVAILABLE' });
    if (settings.maxResponses && (form.responseCount || 0) >= settings.maxResponses) {
      return res.status(403).json({ message: 'Maximum responses reached.', code: 'QUIZ_UNAVAILABLE' });
    }

    const attemptId = 'QA-' + crypto.randomBytes(16).toString('hex');
    const startedAt = now;
    let expiresAt = null;

    if (settings.timeLimit && Number(settings.timeLimit) > 0) {
       // Allow a tiny grace period of 2 seconds for network latency during submission
       expiresAt = new Date(startedAt.getTime() + (Number(settings.timeLimit) * 60000) + 2000);
    }

    await QuizAttempt.create({
      attemptId,
      formId: form._id,
      publicId: form.publicId,
      startedAt,
      expiresAt,
      status: 'started'
    });

    res.json({
      attemptId,
      startedAt,
      expiresAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit response
router.post('/submit/:publicId', async (req, res) => {
  try {
    const form = await Form.findOne({ publicId: req.params.publicId });
    if (!form) return res.status(404).json({ message: 'Form not found' });

    // Status check
    if (form.status !== 'published') return res.status(403).json({ message: `This form is currently ${form.status}.` });
    
    // Settings check
    const settings = form.settings || {};
    const now = new Date();
    if (settings.startDate && new Date(settings.startDate) > now) return res.status(403).json({ message: 'This form is not open yet.' });
    if (settings.endDate && new Date(settings.endDate) < now) return res.status(403).json({ message: 'This form has expired.' });
    if (settings.maxResponses && (form.responseCount || 0) >= settings.maxResponses) {
      form.status = 'closed';
      await form.save();
      return res.status(403).json({ message: 'Maximum responses reached. This form is now closed.' });
    }

    const { answers, attemptId } = req.body; // DO NOT TRUST timeTaken from client
    // Validate answers before anything else
    const validation = validateAnswers(form, answers || []);
    if (!validation.valid) {
       return res.status(400).json({
          message: 'Submission validation failed.',
          code: 'VALIDATION_ERROR',
          errors: validation.errors
       });
    }

    const processedAnswers = validation.answers;

    let studentName = 'Anonymous';
    let email = '';
    let course = '';
    let branch = '';
    
    // Extract metadata safely from validated answers
    processedAnswers.forEach(ans => {
      const label = (ans.fieldLabel || '').toLowerCase();
      if (ans.fieldType === 'text' && label.includes('name') && ans.value) studentName = ans.value;
      if (ans.fieldType === 'email' && ans.value) email = ans.value;
      if (ans.fieldType === 'text' && label.includes('course') && ans.value) course = ans.value;
      if (ans.fieldType === 'text' && label.includes('branch') && ans.value) branch = ans.value;
    });

    // Check attempt limit based on email
    if (form.type === 'quiz' && form.settings?.maxAttempts > 0) {
      if (email && email !== 'N/A') {
        const attempts = await Response.countDocuments({ formId: form._id, email });
        if (attempts >= form.settings.maxAttempts) {
          return res.status(403).json({ message: 'Maximum attempts reached for this email.' });
        }
      }
    }

    const receiptId = 'FMT-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    let quizResult = null;
    if (form.type === 'quiz') {
      if (!attemptId) return res.status(400).json({ message: 'Quiz attempt ID required.', code: 'INVALID_ATTEMPT' });
      
      const attempt = await QuizAttempt.findOne({ attemptId, formId: form._id });
      if (!attempt) return res.status(404).json({ message: 'This quiz attempt is invalid or no longer available.', code: 'INVALID_ATTEMPT' });
      if (attempt.status === 'submitted') return res.status(409).json({ message: 'This quiz attempt has already been submitted.', code: 'ATTEMPT_ALREADY_SUBMITTED' });
      if (attempt.status === 'expired') return res.status(409).json({ message: 'Your quiz time has expired.', code: 'QUIZ_TIME_EXPIRED' });
      
      const now = new Date();
      if (attempt.expiresAt && now > attempt.expiresAt) {
          attempt.status = 'expired';
          await attempt.save();
          return res.status(409).json({ message: 'Your quiz time has expired.', code: 'QUIZ_TIME_EXPIRED' });
      }

      // Atomic update to lock the attempt
      const updatedAttempt = await QuizAttempt.findOneAndUpdate(
          { _id: attempt._id, status: 'started' },
          { $set: { status: 'submitted', submittedAt: now } },
          { new: true }
      );

      if (!updatedAttempt) {
          return res.status(409).json({ message: 'This quiz attempt has already been submitted.', code: 'ATTEMPT_ALREADY_SUBMITTED' });
      }

      // Server calculates time taken!
      const actualTimeTaken = Math.floor((now.getTime() - attempt.startedAt.getTime()) / 1000);

      const QuizGradingService = (await import('../services/QuizGradingService.js')).default;
      quizResult = QuizGradingService.gradeQuiz(form, processedAnswers, actualTimeTaken);
    }

    const response = new Response({
      formId: form._id,
      receiptId,
      studentName,
      email,
      course,
      branch,
      answers: processedAnswers,
      ...(quizResult && { quizResult })
    });

    await response.save();
    await Notification.create({
      userId: form.managerId,
      title: form.type === 'quiz' ? 'New Quiz Submission' : 'New Response Received',
      message: `You have a new response for ${form.title}.`,
      type: 'success',
      relatedFormId: form._id
    });
    
    form.responseCount = (form.responseCount || 0) + 1;
    await form.save();

    res.status(201).json({ 
      message: 'Response submitted successfully', 
      receiptId,
      ...(quizResult && form.settings?.showResult && { quizResult }) 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/responses/verify/:receiptId
router.get('/verify/:receiptId', async (req, res) => {
  try {
    const response = await Response.findOne({ receiptId: req.params.receiptId }).populate('formId', 'title');
    if (!response) return res.status(404).json({ message: 'Receipt not found or invalid.' });
    
    res.json({
      receiptId: response.receiptId,
      date: response.createdAt,
      formTitle: response.formId?.title || 'Unknown Form',
      valid: true,
      ...(response.quizResult && {
        quizScore: `${response.quizResult.obtainedMarks}/${response.quizResult.totalMarks}`,
        percentage: response.quizResult.percentage,
        passed: response.quizResult.passed
      })
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get receipt
router.get('/receipt/:receiptId', async (req, res) => {
  try {
    const response = await Response.findOne({ receiptId: req.params.receiptId }).populate('formId', 'title theme publicId settings');
    if (!response) return res.status(404).json({ message: 'Receipt not found' });
    
    const resObj = response.toObject();
    
    // Security: Only include detailed questionResults if form allows it
    if (resObj.quizResult && resObj.quizResult.questionResults) {
      const showAnswers = response.formId?.settings?.showCorrectAnswers;
      if (!showAnswers) {
        resObj.quizResult.questionResults = resObj.quizResult.questionResults.map(qr => {
          const { correctAnswer, ...safeQr } = qr;
          return safeQr;
        });
      }
    }
    
    res.json(resObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get responses for a form
router.get('/form/:formId', protect, async (req, res) => {
  try {
    const { search, sort = 'newest', page = 1, limit = 50 } = req.query;
    let query = { formId: req.params.formId };
    
    if (search) {
      query = {
        ...query,
        $or: [
          { studentName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { course: { $regex: search, $options: 'i' } },
          { receiptId: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const responses = await Response.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Response.countDocuments(query);

    res.json({
      responses,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete response
router.delete('/:id', protect, async (req, res) => {
  try {
    const response = await Response.findById(req.params.id);
    if (!response) return res.status(404).json({ message: 'Response not found' });

    await Response.findByIdAndDelete(req.params.id);
    
    // Decrement count
    const form = await Form.findById(response.formId);
    if (form && form.responseCount > 0) {
      form.responseCount -= 1;
      await form.save();
    }
    
    res.json({ message: 'Response deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Bulk Delete
router.post('/bulk-delete', protect, async (req, res) => {
  try {
    const { ids, formId } = req.body;
    await Response.deleteMany({ _id: { $in: ids } });
    
    const form = await Form.findById(formId);
    if (form) {
      form.responseCount = Math.max(0, form.responseCount - ids.length);
      await form.save();
    }
    
    res.json({ message: 'Responses deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export responses
router.get('/export/:formId', protect, async (req, res) => {
  try {
    const responses = await Response.find({ formId: req.params.formId }).sort({ createdAt: -1 });
    res.json(responses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
