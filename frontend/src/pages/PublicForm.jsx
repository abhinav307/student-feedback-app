import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function PublicForm() {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  
  // Pagination
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    // Try to load saved draft first
    const savedDraft = localStorage.getItem(`form_draft_${publicId}`);
    if (savedDraft) {
      try {
        setAnswers(JSON.parse(savedDraft));
      } catch (e) {}
    }

    axios.get(`http://localhost:5000/api/forms/public/${publicId}`)
      .then(res => {
        setForm(res.data);
        
        // Split fields into pages if multistep
        const layout = res.data.theme?.layout || 'single';
        if (layout === 'multistep') {
          const newPages = [];
          let currentPageFields = [];
          
          res.data.fields.forEach(field => {
            if (field.type === 'section') {
              if (currentPageFields.length > 0) newPages.push(currentPageFields);
              currentPageFields = [field]; // Section header starts the new page
            } else {
              currentPageFields.push(field);
            }
          });
          if (currentPageFields.length > 0) newPages.push(currentPageFields);
          
          // Ensure at least one page
          setPages(newPages.length > 0 ? newPages : [[]]);
        } else {
          setPages([res.data.fields]);
        }
        
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg(err.response?.data?.message || 'Form not found or unavailable');
        setLoading(false);
      });
  }, [publicId]);

  // Autosave
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(`form_draft_${publicId}`, JSON.stringify(answers));
    }
  }, [answers, publicId]);

  const handleChange = (fieldId, value) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
    
    // Clear error on change
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[fieldId];
        return newErrs;
      });
    }
  };

  const validatePage = (pageFields) => {
    let newErrors = {};
    let isValid = true;
    
    pageFields.forEach(f => {
      if (f.required) {
        const val = answers[f.id];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          newErrors[f.id] = 'This field is required';
          isValid = false;
        }
      }
      
      // Email validation
      if (f.type === 'email' && answers[f.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(answers[f.id])) {
          newErrors[f.id] = 'Please enter a valid email';
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
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
    if (!validatePage(pages[currentPage])) return;

    // Build payload array
    const payloadAnswers = Object.keys(answers).map(fieldId => {
      let value = answers[fieldId];
      if (Array.isArray(value)) value = value.join(', ');
      return { fieldId, value };
    });

    try {
      const res = await axios.post(`http://localhost:5000/api/responses/submit/${publicId}`, { answers: payloadAnswers });
      localStorage.removeItem(`form_draft_${publicId}`); // Clear draft
      navigate(`/receipt/${res.data.receiptId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting form');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  
  if (errorMsg) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex flex-col items-center pt-20 px-4">
      <div className="bg-white dark:bg-[#111113] p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Form Unavailable</h1>
        <p className="text-gray-500 mb-8">{errorMsg}</p>
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
    backgroundColor: t.backgroundType === 'color' ? t.backgroundColor : undefined,
    backgroundImage: t.backgroundType === 'gradient' ? t.backgroundGradient : (t.backgroundType === 'image' && t.backgroundImage ? `url(${t.backgroundImage})` : 'none'),
    backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'
  };
  const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: t.backgroundOverlay || 'rgba(0,0,0,0)', backdropFilter: `blur(${t.backgroundBlur || '0px'})`, pointerEvents: 'none', zIndex: 0 };
  const cardStyle = { 
    backgroundColor: hexToRgba(t.cardColor || '#fff', t.cardTransparency ?? 1), 
    borderRadius: t.cardRadius || '16px', boxShadow: t.cardShadow || '0 10px 25px rgba(0,0,0,0.1)', 
    width: '100%', maxWidth: t.formWidth || '800px', margin: '0 auto', position: 'relative', zIndex: 10,
    backdropFilter: (t.cardTransparency ?? 1) < 1 ? 'blur(16px)' : 'none'
  };

  const isMultiStep = (t.layout === 'multistep') && pages.length > 1;
  const currentFields = pages[currentPage];
  const progressPercent = Math.round(((currentPage) / (pages.length - 1)) * 100);

  return (
    <div className="min-h-screen py-12 px-4 relative" style={containerStyle}>
      <div style={overlayStyle}></div>
      
      <div style={cardStyle} className="overflow-hidden mb-12">
        {/* Header */}
        {t.logoUrl && (
          <div className="p-8 pb-0" style={{ textAlign: t.logoAlign || 'center' }}>
            <img src={t.logoUrl} alt="Logo" className="max-h-20 object-contain inline-block" />
          </div>
        )}
        
        {currentPage === 0 && (
          <div className="p-8 border-b" style={{ borderColor: hexToRgba(t.inputBorderColor, 0.3) }}>
            <h1 className="text-3xl font-bold mb-3 leading-tight" style={{ color: t.headingColor }}>{form.title}</h1>
            {form.description && <p className="text-lg whitespace-pre-wrap" style={{ color: t.textColor }}>{form.description}</p>}
          </div>
        )}

        {/* Progress Bar */}
        {isMultiStep && (
          <div className="bg-black/5 dark:bg-white/5 h-2 w-full relative">
            <div className="absolute top-0 left-0 h-full transition-all duration-300" style={{ width: `${progressPercent}%`, backgroundColor: t.buttonBgColor }}></div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {isMultiStep && <div className="text-sm font-semibold opacity-50 mb-4" style={{ color: t.textColor }}>Step {currentPage + 1} of {pages.length}</div>}

          {currentFields.map((field) => (
            <div key={field.id} className="relative">
              {field.type === 'section' ? (
                <div className="border-b-2 pb-4 mt-6" style={{ borderColor: hexToRgba(t.inputBorderColor, 0.5) }}>
                  <h3 className="text-xl font-bold" style={{ color: t.headingColor }}>{field.label}</h3>
                  {field.description && <p className="text-sm mt-1" style={{ color: t.textColor }}>{field.description}</p>}
                </div>
              ) : (
                <>
                  {field.type !== 'image' && field.type !== 'video' && (
                    <label className="font-semibold text-lg mb-2 block" style={{ color: t.labelColor }}>
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                  )}
                  {field.description && <p className="text-sm mb-4" style={{ color: t.textColor }}>{field.description}</p>}

                  {/* Text Inputs */}
                  {(field.type === 'text' || field.type === 'email' || field.type === 'phone' || field.type === 'number') && (
                    <input 
                      type={field.type} 
                      placeholder={field.placeholder} 
                      value={answers[field.id] || ''}
                      onChange={e => handleChange(field.id, e.target.value)}
                      className={`w-full p-3 border outline-none transition-shadow focus:ring-2 ${errors[field.id] ? 'border-red-500 ring-red-100' : ''}`} 
                      style={{ backgroundColor: t.inputBgColor, borderColor: errors[field.id] ? undefined : t.inputBorderColor, color: t.inputTextColor, borderRadius: t.inputRadius, outlineColor: t.buttonBgColor }} 
                    />
                  )}

                  {/* Long Text */}
                  {field.type === 'longtext' && (
                    <textarea 
                      placeholder={field.placeholder} 
                      value={answers[field.id] || ''}
                      onChange={e => handleChange(field.id, e.target.value)}
                      className={`w-full p-3 border outline-none min-h-[100px] transition-shadow focus:ring-2 ${errors[field.id] ? 'border-red-500 ring-red-100' : ''}`} 
                      style={{ backgroundColor: t.inputBgColor, borderColor: errors[field.id] ? undefined : t.inputBorderColor, color: t.inputTextColor, borderRadius: t.inputRadius, outlineColor: t.buttonBgColor }} 
                    />
                  )}

                  {/* Radio & Checkbox */}
                  {(field.type === 'radio' || field.type === 'checkbox') && (
                    <div className="space-y-3">
                      {field.options.map((opt, i) => {
                        const isChecked = field.type === 'radio' 
                          ? answers[field.id] === opt 
                          : (answers[field.id] || []).includes(opt);
                        
                        return (
                          <label key={i} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:opacity-80 transition-opacity" style={{ backgroundColor: t.inputBgColor, borderColor: isChecked ? t.buttonBgColor : t.inputBorderColor, borderRadius: t.inputRadius }}>
                            <div className={`w-5 h-5 flex items-center justify-center border-2 ${field.type === 'radio' ? 'rounded-full' : 'rounded'}`} style={{ borderColor: isChecked ? t.buttonBgColor : t.inputBorderColor, backgroundColor: isChecked ? t.buttonBgColor : 'transparent' }}>
                              {isChecked && field.type === 'checkbox' && <CheckCircle2 size={14} color="#fff" />}
                              {isChecked && field.type === 'radio' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                            </div>
                            <span style={{ color: t.textColor }}>{opt}</span>
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
                  )}

                  {/* Dropdown */}
                  {field.type === 'dropdown' && (
                    <select 
                      value={answers[field.id] || ''}
                      onChange={e => handleChange(field.id, e.target.value)}
                      className={`w-full p-3 border outline-none ${errors[field.id] ? 'border-red-500' : ''}`} 
                      style={{ backgroundColor: t.inputBgColor, borderColor: errors[field.id] ? undefined : t.inputBorderColor, color: t.inputTextColor, borderRadius: t.inputRadius }}
                    >
                      <option value="" disabled>Select an option...</option>
                      {field.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  )}

                  {/* Rating */}
                  {field.type === 'rating' && (
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(star => (
                        <button 
                          key={star} onClick={() => handleChange(field.id, star)}
                          className="text-4xl hover:scale-110 transition-transform focus:outline-none"
                          style={{ color: (answers[field.id] || 0) >= star ? '#fbbf24' : hexToRgba(t.textColor, 0.2) }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Emoji Rating */}
                  {field.type === 'emoji' && (
                    <div className="flex gap-4">
                      {['😠', '🙁', '😐', '🙂', '🤩'].map((emoji, index) => (
                        <button 
                          key={index} onClick={() => handleChange(field.id, index + 1)}
                          className={`text-4xl transition-all focus:outline-none ${answers[field.id] === (index + 1) ? 'scale-125 drop-shadow-md grayscale-0' : 'opacity-50 grayscale hover:grayscale-0 hover:scale-110'}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Media */}
                  {(field.type === 'image' || field.type === 'video') && field.url && (
                    <div style={{ textAlign: field.align }}>
                      {field.type === 'image' ? (
                        <img src={field.url} alt="media" style={{ width: field.width, borderRadius: field.borderRadius }} className="inline-block shadow-sm" />
                      ) : (
                        <video src={field.url} controls style={{ width: field.width, borderRadius: field.borderRadius }} className="inline-block shadow-sm" />
                      )}
                      {field.caption && <p className="text-sm mt-2" style={{ color: t.textColor }}>{field.caption}</p>}
                    </div>
                  )}

                  {errors[field.id] && <p className="text-red-500 text-sm mt-2 font-medium">{errors[field.id]}</p>}
                </>
              )}
            </div>
          ))}

          {/* Navigation / Submit */}
          <div className="pt-8 border-t flex justify-between items-center" style={{ borderColor: hexToRgba(t.inputBorderColor, 0.3) }}>
            {isMultiStep && currentPage > 0 ? (
              <button 
                onClick={handlePrev}
                className="px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:opacity-80 transition"
                style={{ backgroundColor: 'transparent', color: t.textColor, border: `1px solid ${t.inputBorderColor}` }}
              >
                <ArrowLeft size={18} /> Previous
              </button>
            ) : <div></div>}

            {isMultiStep && currentPage < pages.length - 1 ? (
              <button 
                onClick={handleNext}
                className="px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                style={{ backgroundColor: t.buttonBgColor, color: t.buttonTextColor, borderRadius: t.buttonRadius }}
              >
                Next <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                onClick={submitForm}
                className="px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                style={{ backgroundColor: t.buttonBgColor, color: t.buttonTextColor, borderRadius: t.buttonRadius }}
              >
                Submit <CheckCircle2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
