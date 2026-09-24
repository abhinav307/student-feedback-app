import express from 'express';
import Response from '../models/Response.js';
import Form from '../models/Form.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

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

    const { answers } = req.body;
    let studentName = 'Anonymous';
    let email = '';
    let course = '';
    let branch = '';
    
    const processedAnswers = answers.map(ans => {
      const field = form.fields.find(f => f.id === ans.fieldId);
      if (field) {
        if (field.type === 'text' && field.label.toLowerCase().includes('name')) studentName = ans.value;
        if (field.type === 'email') email = ans.value;
        if (field.type === 'text' && field.label.toLowerCase().includes('course')) course = ans.value;
        if (field.type === 'text' && field.label.toLowerCase().includes('branch')) branch = ans.value;
        return { fieldId: field.id, fieldLabel: field.label, fieldType: field.type, value: ans.value };
      }
      return ans;
    });

    const receiptId = 'FMT-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const response = new Response({
      formId: form._id,
      receiptId,
      studentName,
      email,
      course,
      branch,
      answers: processedAnswers
    });

    await response.save();
    
    form.responseCount = (form.responseCount || 0) + 1;
    await form.save();

    res.status(201).json({ message: 'Response submitted successfully', receiptId });
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
      valid: true
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get receipt
router.get('/receipt/:receiptId', async (req, res) => {
  try {
    const response = await Response.findOne({ receiptId: req.params.receiptId }).populate('formId', 'title theme publicId');
    if (!response) return res.status(404).json({ message: 'Receipt not found' });
    res.json(response);
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
