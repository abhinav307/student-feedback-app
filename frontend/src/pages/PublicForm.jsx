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

  if (error) return <div className="text-center mt-20 text-xl text-red-500 font-bold">{error}</div>;
  if (!form) return <div className="text-center mt-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="min-h-screen py-12 px-4 transition-colors duration-500" style={{ backgroundColor: form.theme.backgroundColor, fontFamily: form.theme.fontFamily }}>
      <div className="max-w-2xl mx-auto bg-white dark:bg-[#111113] rounded-2xl shadow-2xl overflow-hidden border-t-8 border border-gray-100 dark:border-gray-800" style={{ borderTopColor: form.theme.primaryColor }}>
        
        {/* Logo Rendering */}
        {form.theme.logoUrl && (
          <div className="p-8 pb-0" style={{ textAlign: form.theme.logoAlign }}>
            <img src={form.theme.logoUrl} alt="Organization Logo" className="max-h-16 object-contain inline-block" />
          </div>
        )}

        <div className="p-8 border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white leading-tight">{form.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg whitespace-pre-wrap">{form.description}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {form.fields.map(field => (
            <div key={field.id} className="relative">
              
              {/* Text/Input Label */}
              {field.type !== 'image' && field.type !== 'video' && (
                <label className="block text-gray-800 dark:text-gray-200 font-semibold mb-3 text-lg">
                  {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              )}

              {/* Input Types */}
              {field.type === 'text' && (
                <input type="text" required={field.required} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 focus:ring-2 outline-none dark:text-white transition-shadow" style={{ focusRingColor: form.theme.primaryColor }} onChange={e => setAnswers({...answers, [field.id]: e.target.value})} />
              )}
              
              {field.type === 'longtext' && (
                <textarea required={field.required} rows="4" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 outline-none focus:ring-2 dark:text-white transition-shadow" onChange={e => setAnswers({...answers, [field.id]: e.target.value})} />
              )}
              
              {field.type === 'radio' && (
                <div className="space-y-3">
                  {field.options.map((opt, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors">
                      <input type="radio" name={field.id} value={opt} required={field.required} className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300" onChange={e => setAnswers({...answers, [field.id]: e.target.value})} />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.type === 'rating' && (
                <div className="flex gap-2 text-4xl">
                  {[1,2,3,4,5].map(star => (
                    <span key={star} className="cursor-pointer transition-transform hover:scale-110" style={{ color: answers[field.id] >= star ? '#fbbf24' : '#e5e7eb' }} onClick={() => setAnswers({...answers, [field.id]: star})}>★</span>
                  ))}
                </div>
              )}

              {/* Media Blocks (Image/GIF/Video) */}
              {field.type === 'image' && field.url && (
                <div className="flex flex-col gap-2">
                  {field.label && <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">{field.label}</h3>}
                  <div style={{ textAlign: field.align }}>
                    <img src={field.url} alt={field.caption || field.label || 'Image'} style={{ width: field.width, borderRadius: field.borderRadius }} className="inline-block shadow-sm" />
                    {field.caption && <p className="text-sm text-gray-500 mt-2">{field.caption}</p>}
                  </div>
                </div>
              )}

              {field.type === 'video' && field.url && (
                <div className="flex flex-col gap-2">
                  {field.label && <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">{field.label}</h3>}
                  <div style={{ textAlign: field.align }}>
                    <video src={field.url} controls style={{ width: field.width, borderRadius: field.borderRadius }} className="inline-block shadow-sm" />
                    {field.caption && <p className="text-sm text-gray-500 mt-2">{field.caption}</p>}
                  </div>
                </div>
              )}

            </div>
          ))}
          <button type="submit" className="w-full text-white font-bold py-4 rounded-xl mt-8 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]" style={{ backgroundColor: form.theme.primaryColor }}>
            Submit Responses
          </button>
        </form>
      </div>
    </div>
  );
}