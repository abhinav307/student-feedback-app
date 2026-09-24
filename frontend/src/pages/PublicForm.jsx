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
  if (!form) return <div className="text-center mt-20">Loading form...</div>;

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: form.theme.backgroundColor, fontFamily: form.theme.fontFamily }}>
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden border-t-8" style={{ borderTopColor: form.theme.primaryColor }}>
        <div className="p-8 border-b">
          <h1 className="text-3xl font-bold mb-2">{form.title}</h1>
          <p className="text-gray-600 whitespace-pre-wrap">{form.description}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {form.fields.map(field => (
            <div key={field.id}>
              <label className="block text-gray-800 font-medium mb-2">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
              
              {field.type === 'text' && <input type="text" required={field.required} className="w-full border rounded-lg p-3 focus:ring-2 outline-none" style={{ focusRingColor: form.theme.primaryColor }} onChange={e => setAnswers({...answers, [field.id]: e.target.value})} />}
              
              {field.type === 'longtext' && <textarea required={field.required} rows="4" className="w-full border rounded-lg p-3 outline-none" onChange={e => setAnswers({...answers, [field.id]: e.target.value})} />}
              
              {field.type === 'radio' && (
                <div className="space-y-2">
                  {field.options.map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 border">
                      <input type="radio" name={field.id} value={opt} required={field.required} onChange={e => setAnswers({...answers, [field.id]: e.target.value})} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.type === 'rating' && (
                <div className="flex gap-2 text-3xl">
                  {[1,2,3,4,5].map(star => (
                    <span key={star} className="cursor-pointer" style={{ color: answers[field.id] >= star ? '#fbbf24' : '#e5e7eb' }} onClick={() => setAnswers({...answers, [field.id]: star})}>★</span>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button type="submit" className="w-full text-white font-bold py-3 rounded-lg mt-8" style={{ backgroundColor: form.theme.primaryColor }}>
            Submit Responses
          </button>
        </form>
      </div>
    </div>
  );
}