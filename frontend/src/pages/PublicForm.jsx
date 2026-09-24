import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';

export default function PublicForm() {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Multi-step logic
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/forms/public/${publicId}`)
      .then(res => {
        setForm(res.data);
        
        // Restore from local storage if exists
        const savedDraft = localStorage.getItem(`formify_draft_${publicId}`);
        if (savedDraft) {
          try {
            setAnswers(JSON.parse(savedDraft));
          } catch(e) {}
        } else {
          // Init empty arrays for checkboxes
          const initial = {};
          res.data.fields.forEach(f => {
            if (f.type === 'checkbox') initial[f.id] = [];
          });
          setAnswers(initial);
        }
      })
      .catch(err => setError('Form not found or is closed'));
  }, [publicId]);

  // Autosave to localstorage
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(`formify_draft_${publicId}`, JSON.stringify(answers));
    }
  }, [answers, publicId]);

  const t = form?.theme || {};
  const isMultiStep = t.layout === 'multistep';

  // Group fields into pages based on Sections
  const pages = useMemo(() => {
    if (!form || !isMultiStep) return [form?.fields || []];
    
    const result = [];
    let currentPageFields = [];
    
    form.fields.forEach(field => {
      if (field.type === 'section') {
        if (currentPageFields.length > 0) {
          result.push(currentPageFields);
        }
        currentPageFields = [field]; // start new page with section header
      } else {
        currentPageFields.push(field);
      }
    });
    if (currentPageFields.length > 0) result.push(currentPageFields);
    
    // If no sections were found, just return single page
    return result.length > 0 ? result : [form.fields];
  }, [form, isMultiStep]);

  const validatePage = (pageFields) => {
    const errs = {};
    pageFields.forEach(field => {
      if (field.type === 'section' || field.type === 'image' || field.type === 'video') return;
      
      const val = answers[field.id];
      const isEmpty = val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);
      
      if (field.required && isEmpty) {
        errs[field.id] = 'This field is required.';
      } else if (!isEmpty) {
        if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          errs[field.id] = 'Please enter a valid email address.';
        }
        if (field.type === 'number' && isNaN(val)) {
          errs[field.id] = 'Please enter a valid number.';
        }
      }
    });
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validatePage(pages[currentPage])) {
      setCurrentPage(p => Math.min(pages.length - 1, p + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentPage(p => Math.max(0, p - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    // Final validation
    if (isMultiStep) {
      if (!validatePage(pages[currentPage])) return;
    } else {
      if (!validatePage(form.fields)) return;
    }

    setSubmitting(true);
    try {
      const formattedAnswers = Object.keys(answers).map(fieldId => {
        let value = answers[fieldId];
        if (Array.isArray(value)) value = value.join(', ');
        return { fieldId, value };
      });
      
      const res = await axios.post(`http://localhost:5000/api/responses/submit/${publicId}`, { answers: formattedAnswers });
      localStorage.removeItem(`formify_draft_${publicId}`); // Clear draft
      navigate(`/receipt/${res.data.receiptId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting form');
      setSubmitting(false);
    }
  };

  const handleCheckboxChange = (fieldId, option, checked) => {
    setAnswers(prev => {
      const current = prev[fieldId] || [];
      if (checked) return { ...prev, [fieldId]: [...current, option] };
      return { ...prev, [fieldId]: current.filter(o => o !== option) };
    });
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => ({...prev, [fieldId]: null}));
    }
  };

  const handleChange = (fieldId, val) => {
    setAnswers(prev => ({...prev, [fieldId]: val}));
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => ({...prev, [fieldId]: null}));
    }
  };

  const hexToRgba = (hex, alpha) => {
    if(!hex || !hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <AlertCircle size={48} className="text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Unavailable</h2>
      <p className="text-gray-500">{error}</p>
    </div>
  );

  if (!form) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const containerStyle = {
    fontFamily: t.fontFamily || 'Inter, sans-serif',
    backgroundColor: t.backgroundType === 'color' ? (t.backgroundColor || '#f3f4f6') : undefined,
    backgroundImage: t.backgroundType === 'gradient' ? t.backgroundGradient : (t.backgroundType === 'image' && t.backgroundImage ? `url(${t.backgroundImage})` : 'none'),
    backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
    position: 'relative', minHeight: '100vh',
    WebkitTapHighlightColor: 'transparent'
  };

  const overlayStyle = {
    position: 'absolute', inset: 0,
    backgroundColor: t.backgroundOverlay || 'rgba(0,0,0,0)',
    backdropFilter: `blur(${t.backgroundBlur || '0px'})`,
    pointerEvents: 'none'
  };

  const cardStyle = {
    backgroundColor: hexToRgba(t.cardColor || '#ffffff', t.cardTransparency ?? 1),
    borderRadius: t.cardRadius || '16px',
    boxShadow: t.cardShadow || '0 10px 25px rgba(0,0,0,0.1)',
    width: '100%', maxWidth: t.formWidth || '800px',
    margin: '0 auto', position: 'relative',
    backdropFilter: (t.cardTransparency ?? 1) < 1 ? 'blur(16px)' : 'none'
  };

  const currentFields = pages[currentPage] || [];
  const progressPercent = Math.round(((currentPage + 1) / pages.length) * 100);

  return (
    <div style={containerStyle}>
      <div style={overlayStyle}></div>
      
      <div className="py-6 sm:py-12 px-4 relative z-10 min-h-full max-w-full">
        <div style={cardStyle} className="overflow-hidden mb-8">
          
          {/* Progress Bar (Multi-step only) */}
          {isMultiStep && pages.length > 1 && (
            <div className="w-full bg-gray-200" style={{ height: '4px', backgroundColor: hexToRgba(t.inputBorderColor, 0.3) }}>
              <div className="h-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%`, backgroundColor: t.buttonBgColor }}></div>
            </div>
          )}

          {/* Header */}
          {(currentPage === 0 || !isMultiStep) && (
            <>
              {t.logoUrl && (
                <div className="p-6 sm:p-10 pb-0" style={{ textAlign: t.logoAlign || 'center' }}>
                  <img src={t.logoUrl} alt="Organization Logo" className="max-h-20 object-contain inline-block" />
                </div>
              )}
              <div className="p-6 sm:p-10 border-b" style={{ borderColor: hexToRgba(t.inputBorderColor || '#d1d5db', 0.3) }}>
                <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight" style={{ color: t.headingColor || '#111827' }}>{form.title}</h1>
                <p className="text-base sm:text-lg whitespace-pre-wrap leading-relaxed" style={{ color: t.textColor || '#4b5563' }}>{form.description}</p>
              </div>
            </>
          )}
          
          <div className="p-6 sm:p-10">
            {isMultiStep && pages.length > 1 && (
               <div className="text-sm font-semibold tracking-wider uppercase mb-6" style={{ color: hexToRgba(t.textColor, 0.6) }}>
                 Step {currentPage + 1} of {pages.length}
               </div>
            )}

            <div className="space-y-8 sm:space-y-10">
              {currentFields.map(field => {
                const hasError = !!validationErrors[field.id];
                
                return (
                  <div key={field.id} className={`relative animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                    
                    {field.type === 'section' ? (
                      <div className="border-b-2 pb-4 pt-4" style={{ borderColor: hexToRgba(t.inputBorderColor || '#d1d5db', 0.5) }}>
                        <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: t.headingColor || '#111827' }}>{field.label}</h2>
                        {field.description && <p className="text-base sm:text-lg mt-2" style={{ color: t.textColor || '#4b5563' }}>{field.description}</p>}
                      </div>
                    ) : (
                      <>
                        {field.type !== 'image' && field.type !== 'video' && (
                          <div className="mb-4">
                            <label className="block font-semibold text-lg sm:text-xl" style={{ color: t.labelColor || '#374151' }}>
                              {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {field.description && <p className="text-sm sm:text-base mt-2 leading-relaxed" style={{ color: hexToRgba(t.textColor, 0.8) }}>{field.description}</p>}
                          </div>
                        )}

                        {(field.type === 'text' || field.type === 'email' || field.type === 'phone' || field.type === 'number') && (
                          <input 
                            type={field.type} 
                            placeholder={field.placeholder || ''}
                            className={`w-full border p-4 sm:p-5 text-base sm:text-lg focus:outline-none transition-all duration-200 ${hasError ? 'ring-2 ring-red-500 border-red-500' : 'focus:ring-2'}`}
                            style={{ backgroundColor: t.inputBgColor, borderColor: hasError ? '#ef4444' : t.inputBorderColor, color: t.inputTextColor, borderRadius: t.inputRadius, '--tw-ring-color': t.buttonBgColor }}
                            value={answers[field.id] || ''}
                            onChange={e => handleChange(field.id, e.target.value)} 
                          />
                        )}
                        
                        {field.type === 'longtext' && (
                          <textarea 
                            rows="4" 
                            placeholder={field.placeholder || ''}
                            className={`w-full border p-4 sm:p-5 text-base sm:text-lg outline-none transition-all duration-200 ${hasError ? 'ring-2 ring-red-500 border-red-500' : 'focus:ring-2'}`}
                            style={{ backgroundColor: t.inputBgColor, borderColor: hasError ? '#ef4444' : t.inputBorderColor, color: t.inputTextColor, borderRadius: t.inputRadius, '--tw-ring-color': t.buttonBgColor }}
                            value={answers[field.id] || ''}
                            onChange={e => handleChange(field.id, e.target.value)} 
                          />
                        )}
                        
                        {field.type === 'radio' && (
                          <div className="space-y-3">
                            {field.options.map((opt, i) => (
                              <label key={i} className={`flex items-center gap-4 cursor-pointer p-4 sm:p-5 border transition-all duration-200 hover:scale-[1.01] ${answers[field.id] === opt ? 'ring-2' : ''} ${hasError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                style={{ backgroundColor: t.inputBgColor, borderColor: hasError ? '#ef4444' : t.inputBorderColor, borderRadius: t.inputRadius, '--tw-ring-color': t.buttonBgColor }}>
                                <input type="radio" name={field.id} value={opt} className="w-5 h-5 sm:w-6 sm:h-6" checked={answers[field.id] === opt} onChange={e => handleChange(field.id, e.target.value)} />
                                <span className="font-medium text-base sm:text-lg" style={{ color: t.inputTextColor }}>{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {field.type === 'checkbox' && (
                          <div className="space-y-3">
                            {field.options.map((opt, i) => {
                              const isChecked = (answers[field.id] || []).includes(opt);
                              return (
                                <label key={i} className={`flex items-center gap-4 cursor-pointer p-4 sm:p-5 border transition-all duration-200 hover:scale-[1.01] ${isChecked ? 'ring-2' : ''} ${hasError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                  style={{ backgroundColor: t.inputBgColor, borderColor: hasError ? '#ef4444' : t.inputBorderColor, borderRadius: t.inputRadius, '--tw-ring-color': t.buttonBgColor }}>
                                  <input type="checkbox" value={opt} checked={isChecked} className="w-5 h-5 sm:w-6 sm:h-6" onChange={e => handleCheckboxChange(field.id, opt, e.target.checked)} />
                                  <span className="font-medium text-base sm:text-lg" style={{ color: t.inputTextColor }}>{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {field.type === 'dropdown' && (
                          <select 
                            className={`w-full border p-4 sm:p-5 text-base sm:text-lg focus:outline-none transition-all duration-200 ${hasError ? 'ring-2 ring-red-500 border-red-500' : 'focus:ring-2'}`}
                            style={{ backgroundColor: t.inputBgColor, borderColor: hasError ? '#ef4444' : t.inputBorderColor, color: t.inputTextColor, borderRadius: t.inputRadius, '--tw-ring-color': t.buttonBgColor }}
                            value={answers[field.id] || ''}
                            onChange={e => handleChange(field.id, e.target.value)} 
                          >
                            <option value="" disabled>Select an option...</option>
                            {field.options.map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}

                        {field.type === 'rating' && (
                          <div className={`flex flex-wrap gap-2 text-4xl sm:text-5xl p-2 rounded-xl ${hasError ? 'ring-2 ring-red-500 bg-red-50/10' : ''}`}>
                            {[1,2,3,4,5].map(star => (
                              <span key={star} className="cursor-pointer transition-transform hover:scale-125" style={{ color: answers[field.id] >= star ? '#fbbf24' : hexToRgba(t.textColor, 0.2) }} onClick={() => handleChange(field.id, star)}>★</span>
                            ))}
                          </div>
                        )}

                        {field.type === 'emoji' && (
                          <div className={`flex flex-wrap gap-4 sm:gap-6 text-4xl sm:text-5xl p-2 rounded-xl ${hasError ? 'ring-2 ring-red-500 bg-red-50/10' : ''}`}>
                            {['😠', '🙁', '😐', '🙂', '🤩'].map((emoji, idx) => {
                              const val = idx + 1;
                              return (
                                <span key={idx} className={`cursor-pointer transition-all duration-200 hover:scale-125 hover:grayscale-0 ${answers[field.id] === val ? 'opacity-100 scale-125 grayscale-0 drop-shadow-lg' : 'opacity-40 grayscale'}`} onClick={() => handleChange(field.id, val)}>{emoji}</span>
                              );
                            })}
                          </div>
                        )}

                        {field.type === 'slider' && (
                          <div className={`flex flex-col gap-4 p-4 border transition-all ${hasError ? 'border-red-500 ring-1 ring-red-500' : ''}`} style={{ backgroundColor: t.inputBgColor, borderColor: hasError ? '#ef4444' : t.inputBorderColor, borderRadius: t.inputRadius }}>
                            <input type="range" min="0" max="100" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" onChange={e => handleChange(field.id, e.target.value)} value={answers[field.id] || 50} />
                            <div className="text-center font-bold text-xl" style={{ color: t.textColor }}>{answers[field.id] || 50}%</div>
                          </div>
                        )}

                        {field.type === 'yesno' && (
                          <div className="flex gap-4">
                            <label className={`flex-1 p-5 border text-center font-bold text-lg sm:text-xl cursor-pointer transition-all duration-200 ${answers[field.id] === 'Yes' ? 'ring-4 scale-[1.02] shadow-lg' : 'hover:scale-[1.01]'} ${hasError ? 'border-red-500' : ''}`} style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, color: t.textColor, borderRadius: t.inputRadius, '--tw-ring-color': t.buttonBgColor }}>
                               <input type="radio" name={field.id} value="Yes" className="hidden" checked={answers[field.id] === 'Yes'} onChange={e => handleChange(field.id, e.target.value)} /> Yes
                            </label>
                            <label className={`flex-1 p-5 border text-center font-bold text-lg sm:text-xl cursor-pointer transition-all duration-200 ${answers[field.id] === 'No' ? 'ring-4 scale-[1.02] shadow-lg' : 'hover:scale-[1.01]'} ${hasError ? 'border-red-500' : ''}`} style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, color: t.textColor, borderRadius: t.inputRadius, '--tw-ring-color': t.buttonBgColor }}>
                               <input type="radio" name={field.id} value="No" className="hidden" checked={answers[field.id] === 'No'} onChange={e => handleChange(field.id, e.target.value)} /> No
                            </label>
                          </div>
                        )}

                        {(field.type === 'date' || field.type === 'time') && (
                          <input 
                            type={field.type} 
                            className={`w-full sm:w-1/2 border p-4 sm:p-5 text-base sm:text-lg focus:outline-none transition-all duration-200 ${hasError ? 'ring-2 ring-red-500 border-red-500' : 'focus:ring-2'}`}
                            style={{ backgroundColor: t.inputBgColor, borderColor: hasError ? '#ef4444' : t.inputBorderColor, color: t.inputTextColor, borderRadius: t.inputRadius, '--tw-ring-color': t.buttonBgColor }}
                            value={answers[field.id] || ''}
                            onChange={e => handleChange(field.id, e.target.value)} 
                          />
                        )}

                        {/* Media Blocks */}
                        {field.type === 'image' && field.url && (
                          <div className="flex flex-col gap-3 my-4">
                            {field.label && <h3 className="text-xl font-bold mb-1" style={{ color: t.labelColor }}>{field.label}</h3>}
                            <div style={{ textAlign: field.align }}>
                              <img src={field.url} alt={field.caption || field.label || 'Image'} style={{ width: field.width, borderRadius: field.borderRadius }} className="inline-block shadow-lg" />
                              {field.caption && <p className="text-base mt-3 italic" style={{ color: t.textColor }}>{field.caption}</p>}
                            </div>
                          </div>
                        )}

                        {field.type === 'video' && field.url && (
                          <div className="flex flex-col gap-3 my-4">
                            {field.label && <h3 className="text-xl font-bold mb-1" style={{ color: t.labelColor }}>{field.label}</h3>}
                            <div style={{ textAlign: field.align }}>
                              <video src={field.url} controls style={{ width: field.width, borderRadius: field.borderRadius }} className="inline-block shadow-lg" />
                              {field.caption && <p className="text-base mt-3 italic" style={{ color: t.textColor }}>{field.caption}</p>}
                            </div>
                          </div>
                        )}

                        {/* Error Msg */}
                        {hasError && (
                          <p className="text-red-500 text-sm font-semibold mt-2 flex items-center gap-1"><AlertCircle size={14}/> {validationErrors[field.id]}</p>
                        )}
                      </>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Form Actions */}
            <div className="mt-12 flex items-center justify-between gap-4 pt-8 border-t" style={{ borderColor: hexToRgba(t.inputBorderColor, 0.3) }}>
              {isMultiStep ? (
                <>
                  <button 
                    onClick={handlePrev} 
                    disabled={currentPage === 0 || submitting}
                    className="flex items-center gap-2 px-6 py-4 font-bold rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none"
                    style={{ color: t.headingColor }}
                  >
                    <ChevronLeft size={20}/> Back
                  </button>
                  
                  {currentPage === pages.length - 1 ? (
                    <button 
                      onClick={handleSubmit} 
                      disabled={submitting} 
                      className="flex items-center gap-2 px-8 py-4 font-bold shadow-xl transition-transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none" 
                      style={{ backgroundColor: t.buttonBgColor, color: t.buttonTextColor, borderRadius: t.buttonRadius }}
                    >
                      {submitting ? 'Submitting...' : 'Submit'} <Check size={20}/>
                    </button>
                  ) : (
                    <button 
                      onClick={handleNext} 
                      className="flex items-center gap-2 px-8 py-4 font-bold shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.97]" 
                      style={{ backgroundColor: t.buttonBgColor, color: t.buttonTextColor, borderRadius: t.buttonRadius }}
                    >
                      Next <ChevronRight size={20}/>
                    </button>
                  )}
                </>
              ) : (
                <button 
                  onClick={handleSubmit} 
                  disabled={submitting} 
                  className="w-full flex justify-center items-center gap-2 font-bold py-5 text-lg shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none" 
                  style={{ backgroundColor: t.buttonBgColor, color: t.buttonTextColor, borderRadius: t.buttonRadius }}
                >
                  {submitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : 'Submit Form'}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
