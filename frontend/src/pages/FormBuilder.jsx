import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, Plus, Trash } from 'lucide-react';

export default function FormBuilder({ token }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: 'Untitled Form',
    description: 'Please fill out this form.',
    type: 'feedback',
    fields: [],
    theme: { primaryColor: '#4f46e5', backgroundColor: '#f9fafb', fontFamily: 'Inter' }
  });

  const addField = (type) => {
    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, { 
        id: Date.now().toString(), 
        type, 
        label: 'New Question', 
        placeholder: '', 
        required: false,
        options: type === 'radio' ? ['Option 1', 'Option 2'] : []
      }]
    }));
  };

  const updateField = (id, updates) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  };

  const removeField = (id) => {
    setForm(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== id) }));
  };

  const saveForm = async () => {
    try {
      await axios.post('http://localhost:5000/api/forms', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/');
    } catch (err) {
      alert('Error saving form');
    }
  };

  return (
    <div className="flex h-full">
      {/* Settings / Field Adder Sidebar */}
      <div className="w-80 bg-white border-r p-6 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Settings size={20}/> Form Settings</h2>
        
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Form Title</label>
            <input type="text" className="w-full border rounded p-2" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <textarea className="w-full border rounded p-2" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Primary Color</label>
            <input type="color" className="w-full h-10" value={form.theme.primaryColor} onChange={e => setForm({...form, theme: {...form.theme, primaryColor: e.target.value}})} />
          </div>
        </div>

        <h3 className="font-bold mb-3">Add Fields</h3>
        <div className="grid grid-cols-2 gap-2">
          {['text', 'longtext', 'number', 'email', 'radio', 'rating'].map(type => (
            <button key={type} onClick={() => addField(type)} className="border p-2 rounded hover:bg-gray-50 text-sm capitalize flex justify-center items-center gap-1">
              <Plus size={14}/> {type}
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview / Canvas */}
      <div className="flex-1 bg-gray-100 p-8 overflow-y-auto" style={{ backgroundColor: form.theme.backgroundColor, fontFamily: form.theme.fontFamily }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-end mb-4">
            <button onClick={saveForm} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:bg-green-700">
              <Save size={20}/> Save & Publish
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-xl overflow-hidden border-t-8" style={{ borderTopColor: form.theme.primaryColor }}>
            <div className="p-8 border-b">
              <h1 className="text-3xl font-bold mb-2">{form.title}</h1>
              <p className="text-gray-600">{form.description}</p>
            </div>

            <div className="p-8 space-y-6">
              {form.fields.map((field, idx) => (
                <div key={field.id} className="relative p-4 border rounded-lg hover:border-blue-400 group bg-gray-50">
                  <button onClick={() => removeField(field.id)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash size={18}/></button>
                  
                  <input type="text" className="font-bold bg-transparent border-b border-dashed border-gray-400 mb-2 w-full focus:outline-none focus:border-blue-500 text-lg" 
                    value={field.label} onChange={e => updateField(field.id, { label: e.target.value })} />
                  
                  {field.type === 'text' && <input disabled className="w-full border rounded p-2 bg-white" placeholder="Short text answer" />}
                  {field.type === 'longtext' && <textarea disabled className="w-full border rounded p-2 bg-white" placeholder="Long text answer" />}
                  {field.type === 'radio' && (
                    <div className="space-y-2">
                      {field.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input type="radio" disabled />
                          <input type="text" className="bg-transparent border-b border-dashed focus:outline-none" value={opt}
                            onChange={e => {
                              const newOpts = [...field.options];
                              newOpts[i] = e.target.value;
                              updateField(field.id, { options: newOpts });
                            }} />
                        </div>
                      ))}
                      <button onClick={() => updateField(field.id, { options: [...field.options, `Option ${field.options.length + 1}`] })} className="text-sm text-blue-500">+ Add option</button>
                    </div>
                  )}
                  {field.type === 'rating' && <div className="flex gap-2 text-gray-300 text-2xl">★★★★★</div>}
                </div>
              ))}
              {form.fields.length === 0 && <div className="text-center text-gray-400 py-8 border-2 border-dashed rounded-lg">Drag or add fields from the sidebar</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}