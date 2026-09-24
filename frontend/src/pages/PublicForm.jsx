import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function PublicForm() {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/forms/public/${publicId}`)
      .then(res => {
        setForm(res.data);
        // Initialize checkboxes with empty arrays
        const initialAnswers = {};
        res.data.fields.forEach(f => {
          if (f.type === 'checkbox') initialAnswers[f.id] = [];
        });
        setAnswers(initialAnswers);
      })
      .catch(err => setError('Form not found or is closed'));
  }, [publicId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Process answers
      const formattedAnswers = Object.keys(answers).map(fieldId => {
        let value = answers[fieldId];
        if (Array.isArray(value)) value = value.join(', ');
        return { fieldId, value };
      });
      
      const res = await axios.post(`http://localhost:5000/api/responses/submit/${publicId}`, { answers: formattedAnswers });
      navigate(`/receipt/${res.data.receiptId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting form');
      setSubmitting(false);
    }
  };

  const handleCheckboxChange = (fieldId, option, checked) => {
    setAnswers(prev => {
      const current = prev[fieldId] || [];
      if (checked) {
        return { ...prev, [fieldId]: [...current, option] };
      } else {
        return { ...prev, [fieldId]: current.filter(o => o !== option) };
      }
    });
  };

  const hexToRgba = (hex, alpha) => {
    if(!hex || !hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  if (error) return <div className="text-center mt-20 text-xl text-red-500 font-bold">{error}</div>;
  if (!form) return <div className="text-center mt-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  const t = form.theme || {};
  
  const containerStyle = {
    fontFamily: t.fontFamily || 'Inter, sans-serif',
    backgroundColor: t.backgroundType === 'color' ? (t.backgroundColor || '#f3f4f6') : undefined,
    backgroundImage: t.backgroundType === 'gradient' ? t.backgroundGradient : (t.backgroundType === 'image' && t.backgroundImage ? `url(${t.backgroundImage})` : 'none'),
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    position: 'relative',
    minHeight: '100vh'
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
    width: '100%',
    maxWidth: t.formWidth || '800px',
    margin: '0 auto',
    position: 'relative',
    backdropFilter: (t.cardTransparency ?? 1) < 1 ? 'blur(16px)' : 'none'
  };

  return (
    <div style={containerStyle}>
      <div style={overlayStyle}></div>
      
      <div className="py-12 px-4 relative z-10 min-h-full">
        <div style={cardStyle} className="overflow-hidden">
          
          {t.logoUrl && (
            <div className="p-8 pb-0" style={{ textAlign: t.logoAlign || 'center' }}>
              <img src={t.logoUrl} alt="Organization Logo" className="max-h-16 object-contain inline-block" />
            </div>
          )}

          <div className="p-8 border-b" style={{ borderColor: hexToRgba(t.inputBorderColor || '#d1d5db', 0.3) }}>
            <h1 className="text-3xl font-bold mb-3 leading-tight" style={{ color: t.headingColor || '#111827' }}>{form.title}</h1>
            <p className="text-lg whitespace-pre-wrap" style={{ color: t.textColor || '#4b5563' }}>{form.description}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-8">
            {form.fields.map(field => (
              <div key={field.id} className="relative">
                
                {field.type === 'section' ? (
                  <div className="border-b-2 pb-4 mt-6" style={{ borderColor: hexToRgba(t.inputBorderColor || '#d1d5db', 0.5) }}>
                    <h2 className="text-2xl font-bold" style={{ color: t.headingColor || '#111827' }}>{field.label}</h2>
                    {field.description && <p className="text-base mt-2" style={{ color: t.textColor || '#4b5563' }}>{field.description}</p>}
                  </div>
                ) : (
                  <>
                    {field.type !== 'image' && field.type !== 'video' && (
                      <div className="mb-3">
                        <label className="block font-semibold text-lg" style={{ color: t.labelColor || '#374151' }}>
                          {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field.description && <p className="text-sm mt-1" style={{ color: t.textColor || '#4b5563' }}>{field.description}</p>}
                      </div>
                    )}

                    {(field.type === 'text' || field.type === 'email' || field.type === 'phone' || field.type === 'number') && (
                      <input 
                        type={field.type} 
                        required={field.required} 
                        placeholder={field.placeholder || ''}
                        className="w-full border p-3.5 focus:outline-none transition-shadow" 
                        style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, color: t.inputTextColor, borderRadius: t.inputRadius }}
                        onChange={e => setAnswers({...answers, [field.id]: e.target.value})} 
                      />
                    )}
                    
                    {field.type === 'longtext' && (
                      <textarea 
                        required={field.required} 
                        rows="4" 
                        placeholder={field.placeholder || ''}
                        className="w-full border p-3.5 outline-none transition-shadow" 
                        style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, color: t.inputTextColor, borderRadius: t.inputRadius }}
                        onChange={e => setAnswers({...answers, [field.id]: e.target.value})} 
                      />
                    )}
                    
                    {field.type === 'radio' && (
                      <div className="space-y-3">
                        {field.options.map((opt, i) => (
                          <label key={i} className="flex items-center gap-3 cursor-pointer p-3 border transition-colors hover:opacity-80"
                            style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, borderRadius: t.inputRadius }}>
                            <input type="radio" name={field.id} value={opt} required={field.required} className="w-5 h-5" onChange={e => setAnswers({...answers, [field.id]: e.target.value})} />
                            <span className="font-medium" style={{ color: t.inputTextColor }}>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {field.type === 'checkbox' && (
                      <div className="space-y-3">
                        {field.options.map((opt, i) => (
                          <label key={i} className="flex items-center gap-3 cursor-pointer p-3 border transition-colors hover:opacity-80"
                            style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, borderRadius: t.inputRadius }}>
                            <input type="checkbox" value={opt} className="w-5 h-5" onChange={e => handleCheckboxChange(field.id, opt, e.target.checked)} />
                            <span className="font-medium" style={{ color: t.inputTextColor }}>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {field.type === 'dropdown' && (
                      <select 
                        required={field.required} 
                        className="w-full border p-3.5 focus:outline-none transition-shadow" 
                        style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, color: t.inputTextColor, borderRadius: t.inputRadius }}
                        onChange={e => setAnswers({...answers, [field.id]: e.target.value})} 
                        defaultValue=""
                      >
                        <option value="" disabled>Select an option...</option>
                        {field.options.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {field.type === 'rating' && (
                      <div className="flex gap-2 text-4xl">
                        {[1,2,3,4,5].map(star => (
                          <span key={star} className="cursor-pointer transition-transform hover:scale-110" style={{ color: answers[field.id] >= star ? '#fbbf24' : hexToRgba(t.textColor, 0.2) }} onClick={() => setAnswers({...answers, [field.id]: star})}>★</span>
                        ))}
                      </div>
                    )}

                    {field.type === 'emoji' && (
                      <div className="flex gap-4 text-4xl">
                        {['😠', '🙁', '😐', '🙂', '🤩'].map((emoji, idx) => {
                          const val = idx + 1;
                          return (
                            <span key={idx} className={`cursor-pointer transition-transform hover:scale-110 ${answers[field.id] === val ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`} onClick={() => setAnswers({...answers, [field.id]: val})}>{emoji}</span>
                          );
                        })}
                      </div>
                    )}

                    {field.type === 'slider' && (
                      <div className="flex flex-col gap-2">
                        <input type="range" min="0" max="100" className="w-full" onChange={e => setAnswers({...answers, [field.id]: e.target.value})} />
                        <div className="text-center font-bold" style={{ color: t.textColor }}>{answers[field.id] || 50}</div>
                      </div>
                    )}

                    {field.type === 'yesno' && (
                      <div className="flex gap-4">
                        <label className={`flex-1 p-4 border text-center font-bold cursor-pointer transition-all ${answers[field.id] === 'Yes' ? 'ring-2 ring-indigo-500 scale-[1.02]' : ''}`} style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, color: t.textColor, borderRadius: t.inputRadius }}>
                           <input type="radio" name={field.id} value="Yes" className="hidden" onChange={e => setAnswers({...answers, [field.id]: e.target.value})} /> Yes
                        </label>
                        <label className={`flex-1 p-4 border text-center font-bold cursor-pointer transition-all ${answers[field.id] === 'No' ? 'ring-2 ring-indigo-500 scale-[1.02]' : ''}`} style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, color: t.textColor, borderRadius: t.inputRadius }}>
                           <input type="radio" name={field.id} value="No" className="hidden" onChange={e => setAnswers({...answers, [field.id]: e.target.value})} /> No
                        </label>
                      </div>
                    )}

                    {(field.type === 'date' || field.type === 'time') && (
                      <input 
                        type={field.type} 
                        required={field.required} 
                        className="w-full sm:w-1/2 border p-3.5 focus:outline-none transition-shadow" 
                        style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, color: t.inputTextColor, borderRadius: t.inputRadius }}
                        onChange={e => setAnswers({...answers, [field.id]: e.target.value})} 
                      />
                    )}

                    {/* Media Blocks */}
                    {field.type === 'image' && field.url && (
                      <div className="flex flex-col gap-2">
                        {field.label && <h3 className="text-lg font-semibold mb-1" style={{ color: t.labelColor }}>{field.label}</h3>}
                        <div style={{ textAlign: field.align }}>
                          <img src={field.url} alt={field.caption || field.label || 'Image'} style={{ width: field.width, borderRadius: field.borderRadius }} className="inline-block shadow-sm" />
                          {field.caption && <p className="text-sm mt-2" style={{ color: t.textColor }}>{field.caption}</p>}
                        </div>
                      </div>
                    )}

                    {field.type === 'video' && field.url && (
                      <div className="flex flex-col gap-2">
                        {field.label && <h3 className="text-lg font-semibold mb-1" style={{ color: t.labelColor }}>{field.label}</h3>}
                        <div style={{ textAlign: field.align }}>
                          <video src={field.url} controls style={{ width: field.width, borderRadius: field.borderRadius }} className="inline-block shadow-sm" />
                          {field.caption && <p className="text-sm mt-2" style={{ color: t.textColor }}>{field.caption}</p>}
                        </div>
                      </div>
                    )}
                  </>
                )}

              </div>
            ))}
            
            {form.fields.length > 0 && (
              <button type="submit" disabled={submitting} className="w-full font-bold py-4 mt-8 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50" 
                style={{ backgroundColor: t.buttonBgColor, color: t.buttonTextColor, borderRadius: t.buttonRadius }}>
                {submitting ? 'Submitting...' : 'Submit Responses'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
