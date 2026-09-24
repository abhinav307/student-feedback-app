import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function PublicForm() {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/forms/public/${publicId}`)
      .then(res => setForm(res.data))
      .catch(err => setError('Form not found or is closed'));
  }, [publicId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedAnswers = Object.keys(answers).map(fieldId => ({ fieldId, value: answers[fieldId] }));
      const res = await axios.post(`http://localhost:5000/api/responses/submit/${publicId}`, { answers: formattedAnswers });
      navigate(`/receipt/${res.data.receiptId}`);
    } catch (err) {
      alert('Error submitting form');
    }
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
          
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {form.fields.map(field => (
              <div key={field.id} className="relative">
                
                {field.type !== 'image' && field.type !== 'video' && (
                  <label className="block font-semibold mb-3 text-lg" style={{ color: t.labelColor || '#374151' }}>
                    {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                )}

                {field.type === 'text' && (
                  <input type="text" required={field.required} className="w-full border p-3.5 focus:outline-none transition-shadow" 
                    style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, color: t.inputTextColor, borderRadius: t.inputRadius }}
                    onChange={e => setAnswers({...answers, [field.id]: e.target.value})} />
                )}
                
                {field.type === 'longtext' && (
                  <textarea required={field.required} rows="4" className="w-full border p-3.5 outline-none transition-shadow" 
                    style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, color: t.inputTextColor, borderRadius: t.inputRadius }}
                    onChange={e => setAnswers({...answers, [field.id]: e.target.value})} />
                )}
                
                {field.type === 'radio' && (
                  <div className="space-y-3">
                    {field.options.map((opt, i) => (
                      <label key={i} className="flex items-center gap-3 cursor-pointer p-3 border transition-colors hover:opacity-80"
                        style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, borderRadius: t.inputRadius }}>
                        <input type="radio" name={field.id} value={opt} required={field.required} className="w-5 h-5 focus:ring-indigo-500" onChange={e => setAnswers({...answers, [field.id]: e.target.value})} />
                        <span className="font-medium" style={{ color: t.inputTextColor }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'rating' && (
                  <div className="flex gap-2 text-4xl">
                    {[1,2,3,4,5].map(star => (
                      <span key={star} className="cursor-pointer transition-transform hover:scale-110" style={{ color: answers[field.id] >= star ? '#fbbf24' : hexToRgba(t.textColor, 0.2) }} onClick={() => setAnswers({...answers, [field.id]: star})}>★</span>
                    ))}
                  </div>
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

              </div>
            ))}
            <button type="submit" className="w-full font-bold py-4 mt-8 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]" 
              style={{ backgroundColor: t.buttonBgColor, color: t.buttonTextColor, borderRadius: t.buttonRadius }}>
              Submit Responses
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
