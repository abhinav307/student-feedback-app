import { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Settings, Save, Plus, Trash, Image as ImageIcon, Video, UploadCloud, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

export default function FormBuilder({ token }) {
  const navigate = useNavigate();
  // We don't fetch an existing form by ID right now for simplicity, but in a real app we would.
  // Assuming a new form always.
  const [form, setForm] = useState({
    title: 'Untitled Form',
    description: 'Please fill out this form.',
    type: 'feedback',
    fields: [],
    theme: { primaryColor: '#4f46e5', backgroundColor: '#f9fafb', fontFamily: 'Inter', logoUrl: '', logoAlign: 'center' }
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);

  const addField = (type) => {
    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, { 
        id: Date.now().toString(), 
        type, 
        label: type === 'image' || type === 'video' ? 'Media Block' : 'New Question', 
        placeholder: '', 
        required: false,
        options: type === 'radio' ? ['Option 1', 'Option 2'] : [],
        url: '', // For media
        caption: '',
        align: 'center',
        width: '100%',
        borderRadius: '8px'
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

  const handleMediaUpload = async (file, fieldId) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:5000/api/media/upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      updateField(fieldId, { url: res.data.url });
    } catch (err) {
      alert(err.response?.data?.message || 'Error uploading file');
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:5000/api/media/upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setForm(prev => ({ ...prev, theme: { ...prev.theme, logoUrl: res.data.url } }));
    } catch (err) {
      alert(err.response?.data?.message || 'Error uploading logo');
    } finally {
      setUploadingLogo(false);
    }
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
    <div className="flex h-full -m-4 sm:-m-6 lg:-m-8">
      {/* Settings / Field Adder Sidebar */}
      <div className="w-80 bg-white dark:bg-[#111113] border-r border-gray-200 dark:border-gray-800 p-6 overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Settings size={20}/> Form Settings
        </h2>
        
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Form Title</label>
            <input type="text" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500 dark:text-white" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500 dark:text-white min-h-[80px]" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Color</label>
            <input type="color" className="w-full h-10 p-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer" value={form.theme.primaryColor} onChange={e => setForm({...form, theme: {...form.theme, primaryColor: e.target.value}})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo Upload</label>
            <label className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 flex flex-col items-center justify-center rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <UploadCloud size={20} className="text-gray-400 mb-2" />
              <span className="text-xs text-gray-500">{uploadingLogo ? 'Uploading...' : 'Click or drag logo'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e.target.files[0])} />
            </label>
            {form.theme.logoUrl && (
              <div className="flex gap-2 mt-2">
                <button onClick={() => setForm(prev => ({...prev, theme: {...prev.theme, logoAlign: 'left'}}))} className={`p-1 rounded ${form.theme.logoAlign === 'left' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}><AlignLeft size={16}/></button>
                <button onClick={() => setForm(prev => ({...prev, theme: {...prev.theme, logoAlign: 'center'}}))} className={`p-1 rounded ${form.theme.logoAlign === 'center' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}><AlignCenter size={16}/></button>
                <button onClick={() => setForm(prev => ({...prev, theme: {...prev.theme, logoAlign: 'right'}}))} className={`p-1 rounded ${form.theme.logoAlign === 'right' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}><AlignRight size={16}/></button>
                <button onClick={() => setForm(prev => ({...prev, theme: {...prev.theme, logoUrl: ''}}))} className="p-1 text-red-500 ml-auto text-xs font-medium">Remove</button>
              </div>
            )}
          </div>
        </div>

        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Add Elements</h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Media</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => addField('image')} className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 text-sm font-medium text-gray-700 dark:text-gray-300 flex justify-center items-center gap-2 transition-all">
                <ImageIcon size={16}/> Image/GIF
              </button>
              <button onClick={() => addField('video')} className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 text-sm font-medium text-gray-700 dark:text-gray-300 flex justify-center items-center gap-2 transition-all">
                <Video size={16}/> Video
              </button>
            </div>
          </div>
          
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Inputs</p>
            <div className="grid grid-cols-2 gap-2">
              {['text', 'longtext', 'radio', 'rating'].map(type => (
                <button key={type} onClick={() => addField(type)} className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize flex justify-center items-center gap-2 transition-all">
                  <Plus size={16}/> {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview / Canvas */}
      <div className="flex-1 p-8 overflow-y-auto transition-colors duration-500" style={{ backgroundColor: form.theme.backgroundColor, fontFamily: form.theme.fontFamily }}>
        <div className="max-w-2xl mx-auto">
          
          <div className="flex justify-end mb-6">
            <button onClick={saveForm} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95">
              <Save size={18}/> Publish Form
            </button>
          </div>

          <div className="bg-white dark:bg-[#111113] rounded-2xl shadow-xl overflow-hidden border-t-8 transition-colors duration-300 border border-gray-100 dark:border-gray-800" style={{ borderTopColor: form.theme.primaryColor }}>
            
            {form.theme.logoUrl && (
              <div className="p-8 pb-0" style={{ textAlign: form.theme.logoAlign }}>
                <img src={form.theme.logoUrl} alt="Logo" className="max-h-16 object-contain inline-block" />
              </div>
            )}

            <div className="p-8 border-b border-gray-100 dark:border-gray-800">
              <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white leading-tight">{form.title}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg whitespace-pre-wrap">{form.description}</p>
            </div>

            <div className="p-8 space-y-8">
              {form.fields.map((field, idx) => (
                <div key={field.id} className="relative p-6 border-2 border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 rounded-2xl transition-all group bg-gray-50/50 dark:bg-gray-900/20">
                  <button onClick={() => removeField(field.id)} className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash size={16}/>
                  </button>
                  
                  {/* Field Header / Label */}
                  {field.type !== 'image' && field.type !== 'video' && (
                    <input type="text" className="font-semibold bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-700 mb-4 w-full focus:outline-none focus:border-indigo-500 text-gray-800 dark:text-gray-200 text-lg transition-colors" 
                      value={field.label} onChange={e => updateField(field.id, { label: e.target.value })} />
                  )}

                  {/* Input Rendering */}
                  {field.type === 'text' && <input disabled className="w-full border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-white dark:bg-[#111113] cursor-not-allowed" placeholder="Short text answer" />}
                  {field.type === 'longtext' && <textarea disabled className="w-full border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-white dark:bg-[#111113] cursor-not-allowed min-h-[100px]" placeholder="Long text answer" />}
                  
                  {field.type === 'radio' && (
                    <div className="space-y-3">
                      {field.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                          <input type="text" className="bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-700 focus:outline-none text-gray-700 dark:text-gray-300 flex-1" value={opt}
                            onChange={e => {
                              const newOpts = [...field.options];
                              newOpts[i] = e.target.value;
                              updateField(field.id, { options: newOpts });
                            }} />
                        </div>
                      ))}
                      <button onClick={() => updateField(field.id, { options: [...field.options, `Option ${field.options.length + 1}`] })} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-2 hover:underline">+ Add option</button>
                    </div>
                  )}

                  {field.type === 'rating' && <div className="flex gap-2 text-gray-300 dark:text-gray-700 text-3xl">★★★★★</div>}

                  {/* Media Block Rendering (Image / GIF) */}
                  {field.type === 'image' && (
                    <div className="flex flex-col gap-4">
                      <input type="text" className="font-semibold bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-700 w-full focus:outline-none focus:border-indigo-500 text-gray-800 dark:text-gray-200 text-lg transition-colors" 
                        value={field.label} onChange={e => updateField(field.id, { label: e.target.value })} placeholder="Media Title (optional)" />
                      
                      {!field.url ? (
                        <label className="w-full border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/10 p-12 flex flex-col items-center justify-center rounded-2xl cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                          <UploadCloud size={32} className="text-indigo-400 mb-3" />
                          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Click to upload Image / GIF</span>
                          <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP, GIF up to 10MB</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMediaUpload(e.target.files[0], field.id)} />
                        </label>
                      ) : (
                        <div style={{ textAlign: field.align }}>
                          <img src={field.url} alt={field.caption} style={{ width: field.width, borderRadius: field.borderRadius }} className="inline-block object-cover shadow-sm" />
                          {field.caption && <p className="text-sm text-gray-500 mt-2">{field.caption}</p>}
                        </div>
                      )}
                      
                      {/* Media Controls */}
                      {field.url && (
                        <div className="flex flex-wrap items-center gap-3 p-3 mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                          <label className="text-xs font-semibold text-gray-500">Align:</label>
                          <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                            <button onClick={() => updateField(field.id, { align: 'left' })} className={`p-1.5 rounded-md ${field.align === 'left' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}><AlignLeft size={14}/></button>
                            <button onClick={() => updateField(field.id, { align: 'center' })} className={`p-1.5 rounded-md ${field.align === 'center' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}><AlignCenter size={14}/></button>
                            <button onClick={() => updateField(field.id, { align: 'right' })} className={`p-1.5 rounded-md ${field.align === 'right' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}><AlignRight size={14}/></button>
                          </div>
                          
                          <label className="text-xs font-semibold text-gray-500 ml-2">Width:</label>
                          <select className="text-xs bg-gray-100 dark:bg-gray-900 border-none rounded-lg p-2 outline-none cursor-pointer" value={field.width} onChange={(e) => updateField(field.id, { width: e.target.value })}>
                            <option value="50%">Small</option>
                            <option value="75%">Medium</option>
                            <option value="100%">Full Width</option>
                          </select>

                          <label className="text-xs font-semibold text-gray-500 ml-2">Radius:</label>
                          <select className="text-xs bg-gray-100 dark:bg-gray-900 border-none rounded-lg p-2 outline-none cursor-pointer" value={field.borderRadius} onChange={(e) => updateField(field.id, { borderRadius: e.target.value })}>
                            <option value="0px">None</option>
                            <option value="8px">Rounded</option>
                            <option value="16px">Large</option>
                          </select>
                          
                          <input type="text" placeholder="Add caption..." className="flex-1 min-w-[120px] text-xs bg-gray-100 dark:bg-gray-900 border-none rounded-lg p-2 outline-none" value={field.caption} onChange={(e) => updateField(field.id, { caption: e.target.value })} />
                          <button onClick={() => updateField(field.id, { url: '' })} className="text-xs text-red-500 font-medium ml-2">Remove</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Video Block Rendering */}
                  {field.type === 'video' && (
                    <div className="flex flex-col gap-4">
                      <input type="text" className="font-semibold bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-700 w-full focus:outline-none focus:border-indigo-500 text-gray-800 dark:text-gray-200 text-lg transition-colors" 
                        value={field.label} onChange={e => updateField(field.id, { label: e.target.value })} placeholder="Video Title (optional)" />
                      
                      {!field.url ? (
                        <div className="flex gap-4">
                          <label className="flex-1 border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/10 p-12 flex flex-col items-center justify-center rounded-2xl cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                            <UploadCloud size={32} className="text-indigo-400 mb-3" />
                            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Upload MP4 Video</span>
                            <span className="text-xs text-gray-500 mt-1">Max 50MB</span>
                            <input type="file" accept="video/mp4" className="hidden" onChange={(e) => handleMediaUpload(e.target.files[0], field.id)} />
                          </label>
                        </div>
                      ) : (
                        <div style={{ textAlign: field.align }}>
                          <video src={field.url} controls style={{ width: field.width, borderRadius: field.borderRadius }} className="inline-block shadow-sm" />
                          {field.caption && <p className="text-sm text-gray-500 mt-2">{field.caption}</p>}
                        </div>
                      )}
                      
                      {/* Video Controls */}
                      {field.url && (
                        <div className="flex flex-wrap items-center gap-3 p-3 mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                          <label className="text-xs font-semibold text-gray-500">Align:</label>
                          <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                            <button onClick={() => updateField(field.id, { align: 'left' })} className={`p-1.5 rounded-md ${field.align === 'left' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}><AlignLeft size={14}/></button>
                            <button onClick={() => updateField(field.id, { align: 'center' })} className={`p-1.5 rounded-md ${field.align === 'center' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}><AlignCenter size={14}/></button>
                            <button onClick={() => updateField(field.id, { align: 'right' })} className={`p-1.5 rounded-md ${field.align === 'right' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}><AlignRight size={14}/></button>
                          </div>
                          
                          <label className="text-xs font-semibold text-gray-500 ml-2">Width:</label>
                          <select className="text-xs bg-gray-100 dark:bg-gray-900 border-none rounded-lg p-2 outline-none cursor-pointer" value={field.width} onChange={(e) => updateField(field.id, { width: e.target.value })}>
                            <option value="50%">Small</option>
                            <option value="75%">Medium</option>
                            <option value="100%">Full Width</option>
                          </select>
                          
                          <input type="text" placeholder="Add caption..." className="flex-1 min-w-[120px] text-xs bg-gray-100 dark:bg-gray-900 border-none rounded-lg p-2 outline-none" value={field.caption} onChange={(e) => updateField(field.id, { caption: e.target.value })} />
                          <button onClick={() => updateField(field.id, { url: '' })} className="text-xs text-red-500 font-medium ml-2">Remove</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {form.fields.length === 0 && (
                <div className="text-center text-gray-400 py-16 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-900/10">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 shadow-sm rounded-full flex items-center justify-center mx-auto mb-3">
                    <Plus size={20} className="text-indigo-400" />
                  </div>
                  <p className="font-medium text-gray-600 dark:text-gray-300 mb-1">Your form is empty</p>
                  <p className="text-sm">Click the buttons on the left to add fields, images, or videos.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}