import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Clock, Download, RefreshCw } from 'lucide-react';

export default function PublicForm() {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const startTimeRef = useRef();
  const fieldRefs = useRef({});
  
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };
  
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [timerIntervalId, setTimerIntervalId] = useState(null);
  const [attemptId, setAttemptId] = useState(null);

  useEffect(() => {
    const savedDraft = localStorage.getItem(`form_draft_${publicId}`);
    if (savedDraft) {
      try { setAnswers(JSON.parse(savedDraft)); } catch (e) {}
    }

    if (publicId === 'preview') {
      const previewData = sessionStorage.getItem('formPreview');
      if (previewData) {
        try {
          const formData = JSON.parse(previewData);
          setForm(formData);
          startTimeRef.current = Date.now();
          setLoading(false);
          if (formData.theme?.layout === 'multistep') {
            const newPages = []; let current = [];
            (formData.fields || []).forEach(f => {
              if (f.type === 'section') { if (current.length) newPages.push(current); current = [f]; } 
              else { current.push(f); }
            });
            if (current.length) newPages.push(current);
            setPages(newPages.length ? newPages : [[]]);
          } else {
            setPages([formData.fields || []]);
          }
          return;
        } catch (e) {
          setErrorMsg('Error loading preview');
          setLoading(false);
          return;
        }
      } else {
        setErrorMsg('No preview data found');
        setLoading(false);
        return;
      }
    }

    api.get(`/forms/public/${publicId}`)
      .then(res => {
        let formData = res.data;
        if (formData.type === 'quiz') {
            if (formData.settings?.shuffleQuestions) {
                const qFields = formData.fields.filter(f => !['section', 'image', 'video'].includes(f.type));
                const otherFields = formData.fields.filter(f => ['section', 'image', 'video'].includes(f.type));
                for (let i = qFields.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [qFields[i], qFields[j]] = [qFields[j], qFields[i]];
                }
                formData.fields = [...otherFields, ...qFields];
            }
            if (formData.settings?.shuffleOptions) {
                formData.fields.forEach(f => {
                    if (f.options && f.options.length > 0) {
                        for (let i = f.options.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [f.options[i], f.options[j]] = [f.options[j], f.options[i]];
                        }
                    }
                });
            }
        }
        setForm(formData);
        
        const layout = res.data.theme?.layout || 'single';
        if (layout === 'multistep') {
          const newPages = []; let currentPageFields = [];
          res.data.fields.forEach(field => {
            if (field.type === 'section') {
              if (currentPageFields.length > 0) newPages.push(currentPageFields);
              currentPageFields = [field];
            } else {
              currentPageFields.push(field);
            }
          });
          if (currentPageFields.length > 0) newPages.push(currentPageFields);
          setPages(newPages.length > 0 ? newPages : [[]]);
        } else {
          setPages([res.data.fields || []]);
        }
        
        startTimeRef.current = Date.now();
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg(err.response?.data?.message || 'Form not found or unavailable');
        setLoading(false);
      });
  }, [publicId]);

  useEffect(() => {
    if (Object.keys(answers).length > 0 && !successData && !quizResult) {
      localStorage.setItem(`form_draft_${publicId}`, JSON.stringify(answers));
    }
  }, [answers, publicId, successData, quizResult]);

  const handleChange = (fieldId, value) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[fieldId];
        return newErrs;
      });
    }
  };

  const scrollToFirstError = (errs) => {
    const firstErrorFieldId = Object.keys(errs)[0];
    if (firstErrorFieldId && fieldRefs.current[firstErrorFieldId]) {
      const el = fieldRefs.current[firstErrorFieldId];
      if (typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof el.focus === 'function') el.focus({ preventScroll: true });
    }
  };

  const validatePage = (pageFields) => {
    let newErrors = {};
    let isValid = true;
    
    pageFields.forEach(f => {
      if (['section', 'image', 'video'].includes(f.type)) return;
      
      const val = answers[f.id];
      const isMissing = val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);
      
      if (f.required && isMissing) {
        newErrors[f.id] = 'This field is required.';
        isValid = false;
      }
      
      if (!isMissing && f.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          newErrors[f.id] = 'Please enter a valid email address.';
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    if (!isValid) scrollToFirstError(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validatePage(pages[currentPage])) {
      setCurrentPage(prev => Math.min(prev + 1, pages.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitForm = async () => {
    if (publicId === 'preview') {
      showToast("This is a preview. Form submission is disabled.");
      return;
    }
    if (isSubmitting) return;

    if (!validatePage(pages[currentPage])) return;

    setIsSubmitting(true);

    const payloadAnswers = Object.keys(answers).map(fieldId => {
      return { fieldId, value: answers[fieldId] }; // Keep raw values, DO NOT convert arrays to strings
    });

    try {
      let timeTaken = 0;
      if (startTimeRef.current) {
         timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
      }
      const payload = { answers: payloadAnswers, timeTaken };
      if (form.type === 'quiz') {
         payload.attemptId = attemptId;
      }
      const res = await api.post(`/responses/submit/${publicId}`, payload);
      localStorage.removeItem(`form_draft_${publicId}`);
      
      if (form.type === 'quiz' && res.data.quizResult) {
          setQuizResult(res.data.quizResult);
      } else {
          setSuccessData({ receiptId: res.data.receiptId });
      }
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.errors) {
        // Backend Validation Error mapping
        const backendErrs = {};
        err.response.data.errors.forEach(e => {
          backendErrs[e.fieldId] = e.message;
        });
        setErrors(backendErrs);
        scrollToFirstError(backendErrs);
        showToast('Please fix the errors before submitting.');
      } else {
        showToast(err.response?.data?.message || 'Error submitting form');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const startQuiz = async () => {
    if (publicId === 'preview') {
      setQuizStarted(true);
      if (form.settings?.timeLimit) {
        setTimeRemaining(form.settings.timeLimit * 60);
      }
      return;
    }
    
    try {
      setLoading(true);
      const res = await api.post(`/responses/quiz/start/${publicId}`);
      setAttemptId(res.data.attemptId);
      setQuizStarted(true);
      
      if (res.data.expiresAt) {
        const expires = new Date(res.data.expiresAt).getTime();
        const remaining = Math.floor((expires - Date.now()) / 1000);
        setTimeRemaining(Math.max(remaining, 0));
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || 'Failed to start quiz');
    }
  };

  useEffect(() => {
    if (quizStarted && timeRemaining !== null && !quizResult) {
      if (timeRemaining <= 0) {
        submitForm();
        return;
      }
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
             clearInterval(interval);
             submitForm();
             return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerIntervalId(interval);
      return () => clearInterval(interval);
    }
  }, [quizStarted, timeRemaining, quizResult]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  
  if (errorMsg) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Unavailable</h1>
        <p className="text-gray-600">{errorMsg}</p>
      </div>
    </div>
  );

  const hexToRgba = (hex, alpha) => {
    if(!hex || !hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16); const g = parseInt(hex.slice(3, 5), 16); const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const t = form.theme || {};
  const containerStyle = {
    fontFamily: t.fontFamily || 'Inter, sans-serif', 
    backgroundColor: t.backgroundType === 'color' ? t.backgroundColor : '#f3f4f6',
    backgroundImage: t.backgroundType === 'gradient' ? t.backgroundGradient : (t.backgroundType === 'image' && t.backgroundImage ? `url(${t.backgroundImage})` : 'none'),
    backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
    color: t.textColor || '#374151'
  };
  
  const cardStyle = { 
    backgroundColor: hexToRgba(t.cardColor || '#ffffff', t.cardTransparency ?? 1), 
    borderRadius: t.cardRadius || '12px', 
    boxShadow: t.cardShadow || '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 
    backdropFilter: (t.cardTransparency ?? 1) < 1 ? 'blur(16px)' : 'none'
  };

  const isMultiStep = (t.layout === 'multistep') && pages.length > 1;
  const currentFields = pages[currentPage] || [];
  const progressPercent = pages.length > 1 ? Math.round(((currentPage) / (pages.length - 1)) * 100) : 100;

  // --- Success Screen ---
  if (successData) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center" style={containerStyle}>
        <div className="p-10 max-w-lg w-full text-center border-t-8" style={{...cardStyle, borderTopColor: t.buttonBgColor || '#4f46e5'}}>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: t.headingColor || '#111827' }}>Response Submitted</h1>
          <p className="text-lg mb-8" style={{ color: t.textColor }}>Thank you for your feedback.</p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-8">
            <p className="text-sm text-gray-500 mb-1">Submission ID:</p>
            <p className="font-mono font-bold text-gray-900">{successData.receiptId}</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => window.open(`/receipt/${successData.receiptId}`, '_blank')}
              className="w-full py-3 px-4 flex items-center justify-center gap-2 rounded-lg font-bold transition-transform hover:scale-105"
              style={{ backgroundColor: t.buttonBgColor || '#4f46e5', color: t.buttonTextColor || '#ffffff' }}
            >
              <Download size={20} /> Download Receipt
            </button>
            <button 
              onClick={() => { setAnswers({}); setSuccessData(null); setCurrentPage(0); }}
              className="w-full py-3 px-4 flex items-center justify-center gap-2 rounded-lg font-bold transition-colors hover:bg-gray-100"
              style={{ backgroundColor: 'transparent', color: t.buttonBgColor || '#4f46e5', border: `2px solid ${t.buttonBgColor || '#4f46e5'}` }}
            >
              <RefreshCw size={20} /> Submit Another Response
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Quiz Not Started ---
  if (form.type === 'quiz' && !quizStarted && !quizResult) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center" style={containerStyle}>
        <div className="p-10 text-center max-w-lg w-full border-t-8" style={{...cardStyle, borderTopColor: t.buttonBgColor || '#4f46e5'}}>
           {form.logoUrl && (
            <div className="mb-6 flex justify-center">
              <img src={form.logoUrl} alt="Logo" className="max-h-24 object-contain" />
            </div>
           )}
           <h1 className="text-3xl font-bold mb-4" style={{ color: t.headingColor }}>{form.title}</h1>
           {form.description && <p className="text-lg whitespace-pre-wrap mb-8" style={{ color: t.textColor }}>{form.description}</p>}
           
           <div className="bg-gray-50/50 rounded-xl p-4 mb-8 inline-flex flex-col gap-2 items-center text-sm">
              {form.settings?.timeLimit ? (
                <div className="flex items-center gap-2 font-medium"><Clock size={18} className="text-indigo-600"/> Time Limit: {form.settings.timeLimit} minutes</div>
              ) : (
                <div className="flex items-center gap-2 font-medium"><Clock size={18} className="text-indigo-600"/> No time limit</div>
              )}
           </div>
           
           <button 
             onClick={startQuiz}
             className="w-full py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg"
             style={{ backgroundColor: t.buttonBgColor || '#4f46e5', color: t.buttonTextColor || '#fff' }}
           >
             Start Quiz
           </button>
        </div>
      </div>
    );
  }

  const renderField = (field) => {
    const hasError = !!errors[field.id];
    const borderCol = hasError ? '#ef4444' : (t.inputBorderColor || '#e5e7eb');
    const bgCol = t.inputBgColor || '#ffffff';
    
    // Shared styling for inputs
    const inputClasses = `w-full p-3 border rounded-md outline-none transition-shadow focus:ring-2 ${hasError ? 'ring-red-100' : ''}`;
    const inputStyles = { backgroundColor: bgCol, borderColor: borderCol, color: t.inputTextColor || '#111827' };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
      case 'date':
      case 'time':
        let inputType = field.type;
        if (inputType === 'phone') inputType = 'tel';
        return (
          <input 
            type={inputType}
            placeholder={field.placeholder || 'Your answer'} 
            value={answers[field.id] || ''}
            onChange={e => handleChange(field.id, e.target.value)}
            className={inputClasses} 
            style={inputStyles}
            ref={el => fieldRefs.current[field.id] = el}
          />
        );
      case 'longtext':
        return (
          <textarea 
            placeholder={field.placeholder || 'Your answer'} 
            value={answers[field.id] || ''}
            onChange={e => handleChange(field.id, e.target.value)}
            className={`${inputClasses} min-h-[100px] resize-y`} 
            style={inputStyles}
            ref={el => fieldRefs.current[field.id] = el}
          />
        );
      case 'radio':
      case 'checkbox':
        return (
          <div className="space-y-3" ref={el => fieldRefs.current[field.id] = el}>
            {field.options.map((opt, i) => {
              const isChecked = field.type === 'radio' 
                ? answers[field.id] === opt 
                : (answers[field.id] || []).includes(opt);
              
              const activeColor = t.buttonBgColor || '#4f46e5';
              return (
                <label key={i} className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50/50" style={{ backgroundColor: bgCol, borderColor: isChecked ? activeColor : borderCol }}>
                  <div className={`w-5 h-5 flex items-center justify-center border-2 ${field.type === 'radio' ? 'rounded-full' : 'rounded'}`} style={{ borderColor: isChecked ? activeColor : borderCol, backgroundColor: isChecked ? activeColor : 'transparent' }}>
                    {isChecked && field.type === 'checkbox' && <CheckCircle2 size={14} color="#fff" />}
                    {isChecked && field.type === 'radio' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                  </div>
                  <span style={{ color: t.inputTextColor || '#111827' }} className="text-base">{opt}</span>
                  <input 
                    type={field.type} className="hidden"
                    checked={isChecked}
                    onChange={(e) => {
                      if (field.type === 'radio') {
                        handleChange(field.id, opt);
                      } else {
                        const curr = answers[field.id] || [];
                        if (e.target.checked) handleChange(field.id, [...curr, opt]);
                        else handleChange(field.id, curr.filter(item => item !== opt));
                      }
                    }}
                  />
                </label>
              );
            })}
          </div>
        );
      case 'dropdown':
        return (
          <select 
            value={answers[field.id] || ''}
            onChange={e => handleChange(field.id, e.target.value)}
            className={inputClasses} 
            style={inputStyles}
            ref={el => fieldRefs.current[field.id] = el}
          >
            <option value="" disabled>Select an option...</option>
            {field.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>
        );
      case 'rating': {
        const minVal = field.min !== undefined && field.min !== '' && !isNaN(Number(field.min)) ? Number(field.min) : 1;
        const maxVal = field.max !== undefined && field.max !== '' && !isNaN(Number(field.max)) ? Number(field.max) : 5;
        const levels = [];
        for (let i = minVal; i <= maxVal; i++) levels.push(i);
        return (
          <div className="flex gap-2 flex-wrap" ref={el => fieldRefs.current[field.id] = el}>
            {levels.map(star => (
              <button 
                key={star} onClick={() => handleChange(field.id, star)}
                className="text-4xl hover:scale-110 transition-transform focus:outline-none"
                style={{ color: (answers[field.id] || 0) >= star ? '#fbbf24' : '#e5e7eb' }}
                type="button"
              >
                ★
              </button>
            ))}
          </div>
        );
      }
      case 'emoji': {
        const minVal = field.min !== undefined && field.min !== '' && !isNaN(Number(field.min)) ? Number(field.min) : 1;
        const maxVal = field.max !== undefined && field.max !== '' && !isNaN(Number(field.max)) ? Number(field.max) : 5;
        const levels = [];
        for (let i = minVal; i <= maxVal; i++) levels.push(i);
        
        // Emojis progression (fallback if max > 5)
        const emojiSet = ['😠', '🙁', '😐', '🙂', '🤩', '🔥', '🚀', '🌟', '💖', '💯'];
        
        return (
          <div className="flex gap-4 flex-wrap" ref={el => fieldRefs.current[field.id] = el}>
            {levels.map((level, index) => {
               const displayEmoji = emojiSet[index % emojiSet.length];
               return (
                <button 
                  key={level} onClick={() => handleChange(field.id, level)}
                  className={`text-4xl transition-all focus:outline-none ${answers[field.id] === level ? 'scale-125 drop-shadow-md grayscale-0' : 'opacity-50 grayscale hover:grayscale-0 hover:scale-110'}`}
                  type="button"
                >
                  {displayEmoji}
                </button>
               );
            })}
          </div>
        );
      }
      case 'slider': {
        const minVal = field.min !== undefined && field.min !== '' && !isNaN(Number(field.min)) ? Number(field.min) : 0;
        const maxVal = field.max !== undefined && field.max !== '' && !isNaN(Number(field.max)) ? Number(field.max) : 100;
        const stepVal = field.step !== undefined && field.step !== '' && !isNaN(Number(field.step)) ? Number(field.step) : 1;
        const currentVal = answers[field.id] !== undefined ? answers[field.id] : minVal;
        return (
           <div className="w-full flex items-center gap-4" ref={el => fieldRefs.current[field.id] = el}>
             <span className="font-medium">{minVal}</span>
             <input type="range" min={minVal} max={maxVal} step={stepVal}
                value={currentVal}
                onChange={e => handleChange(field.id, Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
             />
             <span className="font-medium">{maxVal}</span>
             <span className="ml-4 font-bold text-lg" style={{color: t.buttonBgColor}}>{currentVal}</span>
           </div>
        );
      }
      case 'yesno':
        return (
           <div className="flex gap-4" ref={el => fieldRefs.current[field.id] = el}>
              {['Yes', 'No'].map(opt => {
                 const isChecked = String(answers[field.id]).toLowerCase() === opt.toLowerCase();
                 return (
                    <label key={opt} className="flex-1 text-center py-3 border rounded-lg cursor-pointer transition-all font-semibold" style={{ backgroundColor: isChecked ? (t.buttonBgColor || '#4f46e5') : bgCol, color: isChecked ? (t.buttonTextColor || '#fff') : (t.inputTextColor || '#111827'), borderColor: isChecked ? (t.buttonBgColor || '#4f46e5') : borderCol }}>
                       {opt}
                       <input type="radio" className="hidden" checked={isChecked} onChange={() => handleChange(field.id, opt)} />
                    </label>
                 );
              })}
           </div>
        );
      case 'image':
      case 'video':
        if (!field.url) return null;
        return (
          <div style={{ textAlign: field.align || 'center' }} className="w-full bg-black/5 rounded-xl p-2 overflow-hidden">
            {field.type === 'image' ? (
              <img src={field.url} alt="media" style={{ borderRadius: field.borderRadius || '8px' }} className="max-w-full inline-block shadow-sm h-auto" />
            ) : (
              <video src={field.url} controls style={{ borderRadius: field.borderRadius || '8px' }} className="max-w-full inline-block shadow-sm h-auto" />
            )}
            {field.caption && <p className="text-sm mt-3 font-medium text-gray-500">{field.caption}</p>}
          </div>
        );
      default:
        return <div ref={el => fieldRefs.current[field.id] = el} className="text-gray-500 italic">Unsupported field type: {field.type}</div>;
    }
  };

  const renderSubmitButton = () => {
    const isFinalStep = currentPage === pages.length - 1;
    if (form.type !== 'quiz' && !isFinalStep) return null; // Don't show submit if it's not the final page of a multistep
    
    return (
      <button 
        onClick={submitForm}
        disabled={isSubmitting}
        className="px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-md disabled:opacity-70 disabled:hover:scale-100"
        style={{ backgroundColor: t.buttonBgColor || '#4f46e5', color: t.buttonTextColor || '#ffffff' }}
      >
        {isSubmitting ? 'Submitting...' : (form.type === 'quiz' ? 'Submit Quiz' : 'Submit Response')}
        {!isSubmitting && <CheckCircle2 size={18} />}
      </button>
    );
  };

  return (
    <div className="min-h-screen py-10 px-4 flex flex-col items-center" style={containerStyle}>
      <div className="w-full max-w-2xl flex flex-col gap-6">
        
        {/* Form Header */}
        <div className="overflow-hidden border-t-8" style={{...cardStyle, borderTopColor: t.buttonBgColor || '#4f46e5'}}>
          {form.logoUrl && (
            <div className="p-8 pb-0 flex justify-center">
              <img src={form.logoUrl} alt="Logo" className="max-h-24 object-contain" />
            </div>
          )}
          
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4 leading-tight" style={{ color: t.headingColor || '#111827' }}>{form.title}</h1>
            {form.description && <p className="text-base whitespace-pre-wrap leading-relaxed" style={{ color: t.textColor }}>{form.description}</p>}
            
            {/* Top Submit Action (Only if single page or last page) */}
            {(!isMultiStep || currentPage === pages.length - 1) && (
              <div className="mt-8 flex justify-end">
                {renderSubmitButton()}
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          {isMultiStep && (
            <div className="bg-black/5 h-1.5 w-full relative">
              <div className="absolute top-0 left-0 h-full transition-all duration-300" style={{ width: `${progressPercent}%`, backgroundColor: t.buttonBgColor || '#4f46e5' }}></div>
            </div>
          )}
        </div>

        {/* Form Body - Fields */}
        <div className="space-y-6">
          {currentFields.map((field) => {
             if (field.type === 'section') {
               return (
                 <div key={field.id} className="p-8 border-l-4" style={{...cardStyle, borderLeftColor: t.buttonBgColor || '#4f46e5'}}>
                   <h3 className="text-2xl font-bold" style={{ color: t.headingColor || '#111827' }}>{field.label}</h3>
                   {field.description && <p className="text-base mt-2" style={{ color: t.textColor }}>{field.description}</p>}
                 </div>
               );
             }

             return (
                <div key={field.id} style={cardStyle} className={`p-8 transition-all ${errors[field.id] ? 'border-2 border-red-500 shadow-sm' : 'border border-transparent'}`}>
                  {field.type !== 'image' && field.type !== 'video' && (
                    <label className="font-semibold text-lg mb-2 block leading-snug" style={{ color: t.labelColor || t.headingColor || '#111827' }}>
                      {field.label} {field.required && <span className="text-red-500 ml-1" title="Required">*</span>}
                    </label>
                  )}
                  
                  {field.description && <p className="text-sm mb-5 opacity-80" style={{ color: t.textColor }}>{field.description}</p>}

                  {renderField(field)}
                  
                  {errors[field.id] && (
                    <div className="mt-3 flex items-center gap-2 text-red-500 text-sm font-medium bg-red-50 p-2 rounded-md">
                       <AlertCircle size={16} /> {errors[field.id]}
                    </div>
                  )}
                </div>
             );
          })}
        </div>

        {/* Navigation & Bottom Submit */}
        <div className="flex justify-between items-center mt-4">
          {isMultiStep && currentPage > 0 ? (
            <button 
              onClick={handlePrev}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors hover:bg-black/5"
              style={{ color: t.buttonBgColor || '#4f46e5' }}
            >
              <ArrowLeft size={18} /> Back
            </button>
          ) : <div></div>}

          {isMultiStep && currentPage < pages.length - 1 ? (
            <button 
              onClick={handleNext}
              className="px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-md"
              style={{ backgroundColor: t.buttonBgColor || '#4f46e5', color: t.buttonTextColor || '#ffffff' }}
            >
              Next <ArrowRight size={18} />
            </button>
          ) : (
            renderSubmitButton()
          )}
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-in slide-in-from-bottom-5 font-medium flex items-center gap-3">
          <AlertCircle size={20} className="text-yellow-400" />
          {toastMsg}
        </div>
      )}
    </div>
  );
}
