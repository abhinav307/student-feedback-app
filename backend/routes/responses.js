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
    if (!form || form.status !== 'published') {
      return res.status(400).json({ message: 'Invalid or inactive form' });
    }

    const receiptId = 'REC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // Extract basic info if present
    const answers = req.body.answers || [];
    let studentName = 'Anonymous';
    let course = 'N/A';
    
    // Try to find name/course from answers based on label mapping (heuristic for demo)
    answers.forEach(ans => {
      const field = form.fields.find(f => f.id === ans.fieldId);
      if (field) {
        if (field.label.toLowerCase().includes('name')) studentName = ans.value;
        if (field.label.toLowerCase().includes('course')) course = ans.value;
      }
    });

    const response = await Response.create({
      formId: form._id,
      answers,
      studentName,
      course,
      receiptId
    });

    res.status(201).json({ receiptId: response.receiptId, message: 'Submission successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get receipt by ID (Public)
router.get('/receipt/:receiptId', async (req, res) => {
  try {
    const response = await Response.findOne({ receiptId: req.params.receiptId }).populate('formId', 'title description type theme');
    if (!response) return res.status(404).json({ message: 'Receipt not found' });
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all responses for a form (Manager)
router.get('/form/:formId', protect, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form || form.managerId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Form not found' });
    }
    const responses = await Response.find({ formId: req.params.formId }).sort({ createdAt: -1 });
    res.json(responses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get analytics for a form (Manager)
router.get('/analytics/:formId', protect, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form || form.managerId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Form not found' });
    }
    const responses = await Response.find({ formId: req.params.formId });
    
    const totalResponses = responses.length;
    let sumRating = 0;
    let ratingCount = 0;
    
    // Calculate average rating if there's a rating field
    const ratingField = form.fields.find(f => f.type === 'rating');
    if (ratingField) {
      responses.forEach(r => {
        const ans = r.answers.find(a => a.fieldId === ratingField.id);
        if (ans && ans.value) {
          sumRating += Number(ans.value);
          ratingCount++;
        }
      });
    }
    
    const averageRating = ratingCount > 0 ? (sumRating / ratingCount).toFixed(1) : 0;

    res.json({
      totalResponses,
      averageRating,
      // We can add more aggregations here
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;