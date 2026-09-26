import express from 'express';
import Form from '../models/Form.js';
import Response from '../models/Response.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/analytics/dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const forms = await Form.find({ managerId: req.user.id });
    const formIds = forms.map(f => f._id);
    
    const responses = await Response.find({ formId: { $in: formIds } }).sort({ createdAt: 1 });
    
    const totalResponses = responses.length;
    const totalForms = forms.length;
    
    const days = parseInt(req.query.days) || 30;
    const trendMap = {};
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      trendMap[d.toISOString().split('T')[0]] = 0;
    }
    
    let totalRating = 0;
    let ratingCount = 0;
    
    responses.forEach(r => {
      const dateStr = r.createdAt.toISOString().split('T')[0];
      if (trendMap[dateStr] !== undefined) {
        trendMap[dateStr]++;
      }
      if (r.answers) {
        r.answers.forEach(ans => {
          if (ans.fieldType === 'rating' && ans.value) {
            totalRating += Number(ans.value);
            ratingCount++;
          }
        });
      }
    });
    
    const trend = Object.keys(trendMap).map(date => ({ date, responses: trendMap[date] }));
    const topForms = [...forms].sort((a, b) => (b.responseCount || 0) - (a.responseCount || 0)).slice(0, 5);
    
    res.json({
      totalForms,
      totalResponses,
      averageRating: ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0,
      trend,
      topForms: topForms.map(f => ({ id: f._id, title: f.title, count: f.responseCount || 0 }))
    });
    
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/analytics/form/:formId
router.get('/form/:formId', protect, async (req, res) => {
  try {
    const form = await Form.findOne({ _id: req.params.formId, managerId: req.user.id });
    if (!form) return res.status(404).json({ message: 'Form not found' });
    
    const { days } = req.query;
    const query = { formId: form._id };
    if (days && days !== 'all') {
      const d = new Date();
      d.setDate(d.getDate() - parseInt(days));
      query.createdAt = { $gte: d };
    }
    
    const responses = await Response.find(query).sort({ createdAt: 1 });
    
    const stats = {
      totalResponses: responses.length,
      latestResponse: responses.length > 0 ? responses[responses.length - 1].createdAt : null,
      trend: [],
      fields: {}
    };
    
    if (responses.length === 0) return res.json(stats);
    
    const trendMap = {};
    responses.forEach(r => {
      const dateStr = r.createdAt.toISOString().split('T')[0];
      trendMap[dateStr] = (trendMap[dateStr] || 0) + 1;
    });
    stats.trend = Object.keys(trendMap).map(date => ({ date, count: trendMap[date] }));
    
    form.fields.forEach(f => {
      if (f.type === 'section' || f.type === 'image' || f.type === 'video') return;
      stats.fields[f.id] = { label: f.label, type: f.type, answered: 0, skipped: 0, data: {} };
      if (['radio', 'dropdown', 'checkbox', 'yesno'].includes(f.type)) {
        if(f.options) f.options.forEach(opt => stats.fields[f.id].data[opt] = 0);
        if(f.type === 'yesno') { stats.fields[f.id].data['Yes']=0; stats.fields[f.id].data['No']=0; }
      }
      if (f.type === 'rating') [1,2,3,4,5].forEach(star => stats.fields[f.id].data[star] = 0);
      if (['text', 'longtext'].includes(f.type)) stats.fields[f.id].recent = [];
      if (['number', 'slider'].includes(f.type)) {
        stats.fields[f.id].sum = 0; stats.fields[f.id].count = 0;
        stats.fields[f.id].min = null; stats.fields[f.id].max = null;
      }
    });
    
    let totalRating = 0;
    let ratingCount = 0;
    
    responses.forEach(r => {
      const answeredFields = new Set();
      if (!r.answers) return;
      
      r.answers.forEach(ans => {
        const fieldStat = stats.fields[ans.fieldId];
        if (!fieldStat) return;
        
        let val = ans.value;
        if (val === undefined || val === null || val === '') return;
        
        answeredFields.add(ans.fieldId);
        fieldStat.answered++;
        
        if (['radio', 'dropdown', 'yesno'].includes(fieldStat.type)) {
          fieldStat.data[val] = (fieldStat.data[val] || 0) + 1;
        } else if (fieldStat.type === 'checkbox') {
          if (Array.isArray(val)) {
             val.forEach(opt => fieldStat.data[opt] = (fieldStat.data[opt] || 0) + 1);
          } else if (typeof val === 'string') {
             val.split(',').map(s => s.trim()).forEach(opt => {
               fieldStat.data[opt] = (fieldStat.data[opt] || 0) + 1;
             });
          }
        } else if (['rating', 'emoji'].includes(fieldStat.type)) {
          fieldStat.data[val] = (fieldStat.data[val] || 0) + 1;
          totalRating += Number(val); ratingCount++;
        } else if (['text', 'longtext'].includes(fieldStat.type)) {
          if (fieldStat.recent.length < 10) fieldStat.recent.push({ text: val, date: r.createdAt });
        } else if (['number', 'slider'].includes(fieldStat.type)) {
          const num = Number(val);
          if (!isNaN(num)) {
            fieldStat.sum += num; fieldStat.count++;
            if (fieldStat.min === null || num < fieldStat.min) fieldStat.min = num;
            if (fieldStat.max === null || num > fieldStat.max) fieldStat.max = num;
          }
        }
      });
      
      Object.keys(stats.fields).forEach(fid => {
        if (!answeredFields.has(fid)) stats.fields[fid].skipped++;
      });
      
      // Collect Quiz Metrics
      if (form.type === 'quiz' && r.quizResult) {
        stats.quizStats = stats.quizStats || {
          totalAttempts: 0,
          passCount: 0,
          failCount: 0,
          totalScoreSum: 0,
          totalScoreCount: 0,
          highestScore: 0,
          lowestScore: null,
          distribution: { '0-20%': 0, '21-40%': 0, '41-60%': 0, '61-80%': 0, '81-100%': 0 }
        };
        
        stats.quizStats.totalAttempts++;
        if (r.quizResult.passed) stats.quizStats.passCount++;
        else stats.quizStats.failCount++;
        
        stats.quizStats.totalScoreSum += r.quizResult.percentage;
        stats.quizStats.totalScoreCount++;
        
        if (r.quizResult.percentage > stats.quizStats.highestScore) stats.quizStats.highestScore = r.quizResult.percentage;
        if (stats.quizStats.lowestScore === null || r.quizResult.percentage < stats.quizStats.lowestScore) stats.quizStats.lowestScore = r.quizResult.percentage;
        
        const pct = r.quizResult.percentage;
        if (pct <= 20) stats.quizStats.distribution['0-20%']++;
        else if (pct <= 40) stats.quizStats.distribution['21-40%']++;
        else if (pct <= 60) stats.quizStats.distribution['41-60%']++;
        else if (pct <= 80) stats.quizStats.distribution['61-80%']++;
        else stats.quizStats.distribution['81-100%']++;
        
        // Question Accuracy
        if (r.quizResult.questionResults) {
          r.quizResult.questionResults.forEach(qr => {
            const fStat = stats.fields[qr.fieldId];
            if (fStat) {
              fStat.quizAttempts = (fStat.quizAttempts || 0) + 1;
              fStat.quizCorrect = (fStat.quizCorrect || 0) + (qr.isCorrect ? 1 : 0);
            }
          });
        }
      }
    });
    
    if (stats.quizStats && stats.quizStats.totalAttempts > 0) {
      stats.quizStats.averagePercentage = (stats.quizStats.totalScoreSum / stats.quizStats.totalAttempts).toFixed(1);
      stats.quizStats.passPercentage = ((stats.quizStats.passCount / stats.quizStats.totalAttempts) * 100).toFixed(1);
    }
    
    stats.averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : null;
    Object.values(stats.fields).forEach(fs => {
      if (['number', 'slider'].includes(fs.type) && fs.count > 0) {
        fs.average = (fs.sum / fs.count).toFixed(2);
      }
      if (['quiz-mcq', 'quiz-boolean', 'quiz-multiselect'].includes(fs.type) && fs.quizAttempts > 0) {
        fs.accuracy = ((fs.quizCorrect / fs.quizAttempts) * 100).toFixed(1);
      }
    });
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
