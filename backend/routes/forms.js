import express from 'express';
import crypto from 'crypto';
import Form from '../models/Form.js';
import Response from '../models/Response.js';
import { protect } from '../middleware/auth.js';
import { normalizeFormFields } from '../utils/fieldNormalizer.js';

const router = express.Router();

// Get public form by ID
router.get('/public/:publicId', async (req, res) => {
  try {
    const form = await Form.findOne({ publicId: req.params.publicId });
    if (!form) return res.status(404).json({ message: 'Form not found' });
    
    // Status check
    if (form.status === 'draft') return res.status(403).json({ message: 'This form is still a draft and is not yet available.' });
    if (form.status === 'closed') return res.status(403).json({ message: 'This form is closed and no longer accepting responses.' });
    if (form.status === 'archived') return res.status(403).json({ message: 'This form has been archived.' });
    
    // Settings check
    const settings = form.settings || {};
    const now = new Date();
    
    if (settings.startDate && new Date(settings.startDate) > now) {
      return res.status(403).json({ message: 'This form is not open yet.' });
    }
    if (settings.endDate && new Date(settings.endDate) < now) {
      return res.status(403).json({ message: 'This form has expired.' });
    }
    if (settings.maxResponses && (form.responseCount || 0) >= settings.maxResponses) {
      return res.status(403).json({ message: 'Maximum responses reached. This form is now closed.' });
    }

    const formObj = form.toObject();
    
    // SECURITY: Strip correct answers, marks, and explanations from the public payload
    if (formObj.type === 'quiz' && formObj.fields) {
      formObj.fields = formObj.fields.map(field => {
        const { correctAnswer, marks, negativeMarks, explanation, ...safeField } = field;
        return safeField;
      });
    }

    res.json(formObj);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new form
router.post('/', protect, async (req, res) => {
  try {
    const publicId = crypto.randomBytes(4).toString('hex');
    const normalizedBody = normalizeFormFields(req.body);
    const newForm = new Form({
      ...normalizedBody,
      managerId: req.user._id,
      publicId
    });
    const savedForm = await newForm.save();
    res.status(201).json(savedForm);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get manager forms
router.get('/', protect, async (req, res) => {
  try {
    const forms = await Form.find({ managerId: req.user._id }).sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get specific form
router.get('/:id', protect, async (req, res) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, managerId: req.user._id });
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.json(form);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update form
router.put('/:id', protect, async (req, res) => {
  try {
    const updatedForm = await Form.findOneAndUpdate(
      { _id: req.params.id, managerId: req.user._id },
      { $set: normalizeFormFields(req.body) },
      { new: true }
    );
    if (!updatedForm) return res.status(404).json({ message: 'Form not found' });
    res.json(updatedForm);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete form
router.delete('/:id', protect, async (req, res) => {
  try {
    const form = await Form.findOneAndDelete({ _id: req.params.id, managerId: req.user._id });
    if (!form) return res.status(404).json({ message: 'Form not found' });
    // Also delete all responses
    await Response.deleteMany({ formId: form._id });
    res.json({ message: 'Form deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
