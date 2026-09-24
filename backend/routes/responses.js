import express from 'express';
import crypto from 'crypto';
import Response from '../models/Response.js';
import Form from '../models/Form.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Submit a response (Public)
router.post('/submit/:publicId', async (req, res) => {
  try {
    const form = await Form.findOne({ publicId: req.params.publicId });
    if (!form) return res.status(404).json({ message: 'Form not found' });
    if (form.status !== 'published') return res.status(400).json({ message: 'Form is not published' });

    const submissionId = 'SUB-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // Process answers and validate required fields
    const rawAnswers = req.body.answers || [];
    const formattedAnswers = [];
    
    let studentName = 'Anonymous';
    let email = 'N/A';
    let course = 'N/A';
    let branch = 'N/A';
    let semester = 'N/A';

    // Build the formatted answers ensuring we only accept fields that exist in the form
    for (const field of form.fields) {
      if (field.type === 'image' || field.type === 'video') continue; // non-interactive blocks
      
      const submittedAns = rawAnswers.find(a => a.fieldId === field.id);
      
      if (field.required && (!submittedAns || !submittedAns.value)) {
        return res.status(400).json({ message: `Field "${field.label}" is required.` });
      }

      const val = submittedAns ? submittedAns.value : null;

      formattedAnswers.push({
        fieldId: field.id,
        fieldLabel: field.label,
        fieldType: field.type,
        value: val
      });

      // Heuristics to extract metadata for dashboard overview
      if (val) {
        const lbl = field.label.toLowerCase();
        if (lbl.includes('name')) studentName = val;
        if (lbl.includes('email')) email = val;
        if (lbl.includes('course')) course = val;
        if (lbl.includes('branch')) branch = val;
        if (lbl.includes('semester')) semester = val;
      }
    }

    const response = await Response.create({
      formId: form._id,
      submissionId,
      studentName,
      email,
      course,
      branch,
      semester,
      answers: formattedAnswers,
      metadata: req.body.metadata || {}
    });

    // Update response count in Form
    await Form.findByIdAndUpdate(form._id, { $inc: { responseCount: 1 } });

    // Send receipt
    res.status(201).json({ receiptId: response.submissionId, message: 'Submission successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get receipt by ID (Public)
router.get('/receipt/:submissionId', async (req, res) => {
  try {
    const response = await Response.findOne({ submissionId: req.params.submissionId }).populate('formId', 'title description type theme');
    if (!response) return res.status(404).json({ message: 'Receipt not found' });
    res.json({ ...response.toObject(), receiptId: response.submissionId }); // Maintain backwards compat for frontend relying on receiptId mapping
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all responses for a form (Manager) - Secured and Paginated
router.get('/form/:formId', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    if (form.managerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to form responses' });
    }

    const total = await Response.countDocuments({ formId: req.params.formId });
    const responses = await Response.find({ formId: req.params.formId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      responses
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
