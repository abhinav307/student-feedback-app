import express from 'express';
import crypto from 'crypto';
import Form from '../models/Form.js';
import Response from '../models/Response.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get public form by ID
router.get('/public/:publicId', async (req, res) => {
  try {
    const form = await Form.findOne({ publicId: req.params.publicId });
    if (!form) return res.status(404).json({ message: 'Form not found' });
    if (form.status !== 'published') return res.status(403).json({ message: 'Form is not active' });
    res.json(form);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new form
router.post('/', protect, async (req, res) => {
  try {
    const publicId = crypto.randomBytes(4).toString('hex');
    const form = new Form({
      ...req.body,
      managerId: req.user._id,
      publicId
    });
    const createdForm = await form.save();
    res.status(201).json(createdForm);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all forms for logged in manager
router.get('/', protect, async (req, res) => {
  try {
    const forms = await Form.find({ managerId: req.user._id }).sort({ createdAt: -1 });
    // Append response count
    const formsWithCounts = await Promise.all(forms.map(async (form) => {
      const count = await Response.countDocuments({ formId: form._id });
      return { ...form.toObject(), responseCount: count };
    }));
    res.json(formsWithCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single form
router.get('/:id', protect, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form || form.managerId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json(form);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update form
router.put('/:id', protect, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form || form.managerId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Form not found' });
    }
    Object.assign(form, req.body);
    const updatedForm = await form.save();
    res.json(updatedForm);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete form
router.delete('/:id', protect, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form || form.managerId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Form not found' });
    }
    await Response.deleteMany({ formId: form._id });
    await form.deleteOne();
    res.json({ message: 'Form removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;