import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Settings, Save, Plus, Trash, Image as ImageIcon, Video, 
  UploadCloud, AlignLeft, AlignCenter, AlignRight, LayoutTemplate, Palette
} from 'lucide-react';

const DEFAULT_THEME = {
  backgroundType: 'color', // 'color', 'gradient', 'image'
  backgroundColor: '#f3f4f6',
  backgroundGradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  backgroundImage: '',
  backgroundOverlay: 'rgba(0,0,0,0)',
  backgroundBlur: '0px',
  
  cardColor: '#ffffff',
  cardTransparency: 1,
  cardRadius: '16px',
  cardShadow: '0 10px 25px rgba(0,0,0,0.1)',
  formWidth: '800px',
  
  headingColor: '#111827',
  textColor: '#4b5563',
  labelColor: '#374151',
  
  inputBgColor: '#f9fafb',
  inputBorderColor: '#d1d5db',
  inputTextColor: '#111827',
  inputRadius: "8px",
  
  buttonBgColor: '#4f46e5',
  buttonTextColor: '#ffffff',
  buttonRadius: '8px',
  
  fontFamily: 'Inter, sans-serif',
  logoUrl: '',
  logoAlign: 'center'
};

const PRESETS = {
  'Modern Blue': { ...DEFAULT_THEME, backgroundColor: '#f0f9ff', buttonBgColor: '#0ea5e9' },
  'Dark Glass': { 
    ...DEFAULT_THEME, 
    backgroundType: 'gradient', backgroundGradient: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
    cardColor: '#1e293b', cardTransparency: 0.6, cardRadius: '24px', cardShadow: '0 20px 40px rgba(0,0,0,0.4)',
    headingColor: '#f8fafc', textColor: '#cbd5e1', labelColor: '#e2e8f0',
    inputBgColor: 'rgba(15,23,42,0.5)', inputBorderColor: '#334155', inputTextColor: '#ffffff',
    buttonBgColor: '#3b82f6', backgroundBlur: '10px'
  },
  'Sunset': {
    ...DEFAULT_THEME, backgroundType: 'gradient', backgroundGradient: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
    cardRadius: '20px', buttonBgColor: '#f43f5e', headingColor: '#881337'
  },
  'Academic': {
    ...DEFAULT_THEME, backgroundColor: '#f8f9fa', fontFamily: 'Georgia, serif', cardRadius: '0px',
    inputRadius: '0px', buttonRadius: '0px', buttonBgColor: '#1e3a8a', headingColor: '#1e3a8a'
  },
  'Minimal': {
    ...DEFAULT_THEME, backgroundColor: '#ffffff', cardColor: 'transparent', cardShadow: 'none',
    inputBorderColor: '#000000', buttonBgColor: '#000000', buttonRadius: '0px', inputRadius: '0px'
  }
};

export default function FormBuilder({ token }) {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [activeTab, setActiveTab] = useState('build'); // 'build' | 'customize'
  
  const [form, setForm] = useState({
    title: 'Untitled Form',
    description: 'Please fill out this form.',
    type: 'feedback',
    fields: [],
    theme: { ...DEFAULT_THEME }
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5000/api/forms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        // merge default theme with existing in case new properties were added
        setForm({ ...res.data, theme: { ...DEFAULT_THEME, ...res.data.theme } });
      }).catch(err => console.error(err));
    }
  }, [id, token]);

  const addField = (type) => {
    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, { 
        id: Date.now().toString(), type, 
        label: type === 'image' || type === 'video' ? 'Media Block' : 'New Question', 
        placeholder: '', required: false,
        options: type === 'radio' ? ['Option 1', 'Option 2'] : [],
        url: '', caption: '', align: 'center', width: '100%', borderRadius: '8px'
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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setForm(prev => ({ ...prev, theme: { ...prev.theme, logoUrl: res.data.url } }));
    } catch (err) {
      alert('Error uploading logo');
    } finally { setUploadingLogo(false); }
  };

  const handleBgUpload = async (file) => {
    if (!file) return;
    setUploadingBg(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:5000/api/media/upload', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      updateTheme('backgroundImage', res.data.url);
      updateTheme('backgroundType', 'image');
    } catch (err) {
      alert('Error uploading background');
    } finally { setUploadingBg(false); }
  };

  const updateTheme = (key, value) => {
    setForm(prev => ({ ...prev, theme: { ...prev.theme, [key]: value } }));
  };

  const applyPreset = (presetName) => {
    setForm(prev => ({ ...prev, theme: { ...PRESETS[presetName], logoUrl: prev.theme.logoUrl, logoAlign: prev.theme.logoAlign } }));
    showToast(`Applied ${presetName} theme`);
  };

  const saveForm = async () => {
    try {
      if (id) {
        await axios.put(`http://localhost:5000/api/forms/${id}`, form, { headers: { Authorization: `Bearer ${token}` }});
      } else {
        await axios.post('http://localhost:5000/api/forms', form, { headers: { Authorization: `Bearer ${token}` }});
      }
      showToast('Form saved successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) { alert('Error saving form'); }
  };

  // Helper to convert hex to rgba for card transparency
  const hexToRgba = (hex, alpha) => {
    if(!hex || !hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Compute live styles
  const t = form.theme;
  const containerStyle = {
    fontFamily: t.fontFamily,
    backgroundColor: t.backgroundType === 'color' ? t.backgroundColor : undefined,
    backgroundImage: t.backgroundType === 'gradient' ? t.backgroundGradient : (t.backgroundType === 'image' && t.backgroundImage ? `url(${t.backgroundImage})` : 'none'),
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    position: 'relative'
  };

  const overlayStyle = {
    position: 'absolute', inset: 0,
    backgroundColor: t.backgroundOverlay,
    backdropFilter: `blur(${t.backgroundBlur})`,
    pointerEvents: 'none'
  };

  const cardStyle = {
    backgroundColor: hexToRgba(t.cardColor, t.cardTransparency),
    borderRadius: t.cardRadius,
    boxShadow: t.cardShadow,
    width: '100%',
    maxWidth: t.formWidth,
    margin: '0 auto',
    position: 'relative',
    backdropFilter: t.cardTransparency < 1 ? 'blur(16px)' : 'none'
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl z-50 animate-in slide-in-from-bottom-5">
          {toastMsg}
        </div>
      )}

      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-[#111113] border-r border-gray-200 dark:border-gray-800 flex flex-col z-10 shadow-lg">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button onClick={() => setActiveTab('build')} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 ${activeTab === 'build' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
            <LayoutTemplate size={16}/> Build
          </button>
          <button onClick={() => setActiveTab('customize')} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 ${activeTab === 'customize' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
            <Palette size={16}/> Customize
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'build' ? (
            <>
              {/* Form Settings & Fields (Same as before but compact) */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Form Details</label>
                <div className="space-y-3">
                  <input type="text" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500 dark:text-white" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Form Title" />
                  <textarea className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500 dark:text-white min-h-[80px]" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Logo</label>
                <label className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 flex flex-col items-center justify-center rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <UploadCloud size={20} className="text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e.target.files[0])} />
                </label>
                {t.logoUrl && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => updateTheme('logoAlign', 'left')} className={`p-1 rounded ${t.logoAlign === 'left' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}><AlignLeft size={16}/></button>
                    <button onClick={() => updateTheme('logoAlign', 'center')} className={`p-1 rounded ${t.logoAlign === 'center' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}><AlignCenter size={16}/></button>
                    <button onClick={() => updateTheme('logoAlign', 'right')} className={`p-1 rounded ${t.logoAlign === 'right' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}><AlignRight size={16}/></button>
                    <button onClick={() => updateTheme('logoUrl', '')} className="p-1 text-red-500 ml-auto text-xs font-medium">Remove</button>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Add Elements</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => addField('text')} className="btn-add-field"><Plus size={14}/> Text</button>
                  <button onClick={() => addField('longtext')} className="btn-add-field"><Plus size={14}/> Long Text</button>
                  <button onClick={() => addField('radio')} className="btn-add-field"><Plus size={14}/> Choices</button>
                  <button onClick={() => addField('rating')} className="btn-add-field"><Plus size={14}/> Rating</button>
                  <button onClick={() => addField('image')} className="btn-add-field"><ImageIcon size={14}/> Image/GIF</button>
                  <button onClick={() => addField('video')} className="btn-add-field"><Video size={14}/> Video</button>
                </div>
              </div>
            </>
          ) : (
            /* Theme Studio */
            <div className="space-y-6">
              {/* Presets */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Presets</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(PRESETS).map(key => (
                    <button key={key} onClick={() => applyPreset(key)} className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                      {key}
                    </button>
                  ))}
                  <button onClick={() => setForm(prev => ({...prev, theme: {...DEFAULT_THEME, logoUrl: prev.theme.logoUrl, logoAlign: prev.theme.logoAlign}}))} className="text-xs font-medium bg-red-50 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-100 transition">
                    Reset
                  </button>
                </div>
              </div>

              {/* Background */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Background</label>
                <select className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm outline-none dark:text-white" value={t.backgroundType} onChange={e => updateTheme('backgroundType', e.target.value)}>
                  <option value="color">Solid Color</option>
                  <option value="gradient">Gradient</option>
                  <option value="image">Image</option>
                </select>
                
                {t.backgroundType === 'color' && (
                  <div className="flex items-center gap-2">
                    <input type="color" className="h-8 w-8 rounded cursor-pointer border-0 p-0" value={t.backgroundColor} onChange={e => updateTheme('backgroundColor', e.target.value)} />
                    <input type="text" className="flex-1 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 outline-none dark:text-white uppercase font-mono" value={t.backgroundColor} onChange={e => updateTheme('backgroundColor', e.target.value)} />
                  </div>
                )}

                {t.backgroundType === 'gradient' && (
                  <input type="text" className="w-full text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 outline-none dark:text-white" value={t.backgroundGradient} onChange={e => updateTheme('backgroundGradient', e.target.value)} placeholder="linear-gradient(...)" />
                )}

                {t.backgroundType === 'image' && (
                  <div>
                    <label className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 p-3 flex flex-col items-center justify-center rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <span className="text-xs text-gray-500">{uploadingBg ? 'Uploading...' : (t.backgroundImage ? 'Change Image' : 'Upload Image')}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBgUpload(e.target.files[0])} />
                    </label>
                    <div className="flex items-center gap-2 mt-2">
                       <label className="text-xs text-gray-500">Blur:</label>
                       <input type="text" className="flex-1 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1 outline-none dark:text-white" value={t.backgroundBlur} onChange={e => updateTheme('backgroundBlur', e.target.value)} placeholder="0px" />
                    </div>
                  </div>
                )}
              </div>

              {/* Foreground / Typography */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Typography</label>
                <select className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm outline-none dark:text-white" value={t.fontFamily} onChange={e => updateTheme('fontFamily', e.target.value)}>
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="monospace">Monospace</option>
                  <option value="'Comic Sans MS', cursive">Comic Sans</option>
                </select>
                <ColorPicker label="Heading Color" val={t.headingColor} onChange={v => updateTheme('headingColor', v)} />
                <ColorPicker label="Text Color" val={t.textColor} onChange={v => updateTheme('textColor', v)} />
                <ColorPicker label="Label Color" val={t.labelColor} onChange={v => updateTheme('labelColor', v)} />
              </div>

              {/* Form Container */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Card Container</label>
                <ColorPicker label="Card Color" val={t.cardColor} onChange={v => updateTheme('cardColor', v)} />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Opacity:</span>
                  <input type="range" min="0" max="1" step="0.05" value={t.cardTransparency} onChange={e => updateTheme('cardTransparency', parseFloat(e.target.value))} className="w-32" />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600 dark:text-gray-400 w-16">Radius:</span>
                  <input type="text" className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1" value={t.cardRadius} onChange={e => updateTheme('cardRadius', e.target.value)} />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600 dark:text-gray-400 w-16">Width:</span>
                  <input type="text" className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1" value={t.formWidth} onChange={e => updateTheme('formWidth', e.target.value)} />
                </div>
              </div>

              {/* Inputs & Buttons */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Inputs & Buttons</label>
                <ColorPicker label="Input Bg" val={t.inputBgColor} onChange={v => updateTheme('inputBgColor', v)} />
                <ColorPicker label="Input Border" val={t.inputBorderColor} onChange={v => updateTheme('inputBorderColor', v)} />
                <ColorPicker label="Input Text" val={t.inputTextColor} onChange={v => updateTheme('inputTextColor', v)} />
                <div className="flex items-center gap-2 text-xs mb-3">
                  <span className="text-gray-600 dark:text-gray-400 w-16">Inp. Radius:</span>
                  <input type="text" className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1" value={t.inputRadius} onChange={e => updateTheme('inputRadius', e.target.value)} />
                </div>
                <ColorPicker label="Button Bg" val={t.buttonBgColor} onChange={v => updateTheme('buttonBgColor', v)} />
                <ColorPicker label="Button Text" val={t.buttonTextColor} onChange={v => updateTheme('buttonTextColor', v)} />
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600 dark:text-gray-400 w-16">Btn Radius:</span>
                  <input type="text" className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1" value={t.buttonRadius} onChange={e => updateTheme('buttonRadius', e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Preview / Canvas */}
      <div className="flex-1 overflow-y-auto relative transition-all duration-300" style={containerStyle}>
        <div style={overlayStyle}></div>
        
        <div className="py-12 px-4 relative z-10 min-h-full">
          <div className="flex justify-end mb-6 max-w-[800px] mx-auto">
            <button onClick={saveForm} className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-transform">
              <Save size={18}/> Publish
            </button>
          </div>

          <div style={cardStyle} className="overflow-hidden transition-all duration-300">
            {t.logoUrl && (
              <div className="p-8 pb-0" style={{ textAlign: t.logoAlign }}>
                <img src={t.logoUrl} alt="Logo" className="max-h-16 object-contain inline-block" />
              </div>
            )}

            <div className="p-8 border-b" style={{ borderColor: hexToRgba(t.inputBorderColor, 0.3) }}>
              <h1 className="text-3xl font-bold mb-3 leading-tight" style={{ color: t.headingColor }}>{form.title}</h1>
              <p className="text-lg whitespace-pre-wrap" style={{ color: t.textColor }}>{form.description}</p>
            </div>

            <div className="p-8 space-y-8">
              {form.fields.map((field) => (
                <div key={field.id} className="relative group">
                  {/* Delete button (Builder only) */}
                  <button onClick={() => removeField(field.id)} className="absolute -top-3 -right-3 p-1.5 bg-red-500 shadow-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <Trash size={14}/>
                  </button>
                  
                  {field.type !== 'image' && field.type !== 'video' && (
                    <input type="text" className="font-semibold bg-transparent border-b border-transparent hover:border-gray-300 mb-4 w-full focus:outline-none transition-colors text-lg" 
                      style={{ color: t.labelColor, borderBottomColor: hexToRgba(t.inputBorderColor, 0.5) }}
                      value={field.label} onChange={e => updateField(field.id, { label: e.target.value })} />
                  )}

                  {/* Text Input Preview */}
                  {(field.type === 'text' || field.type === 'longtext') && (
                    <div 
                      className="w-full p-3 border" 
                      style={{ 
                        backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, 
                        color: t.inputTextColor, borderRadius: t.inputRadius,
                        minHeight: field.type === 'longtext' ? '100px' : 'auto'
                      }}
                    >
                      <span style={{opacity: 0.5}}>{field.type === 'text' ? 'Short answer' : 'Long answer'}</span>
                    </div>
                  )}

                  {/* Radio Preview */}
                  {field.type === 'radio' && (
                    <div className="space-y-3">
                      {field.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: t.inputBorderColor }}></div>
                          <input type="text" className="bg-transparent border-b border-transparent hover:border-gray-300 focus:outline-none flex-1" style={{ color: t.textColor }} value={opt} onChange={e => { const newOpts = [...field.options]; newOpts[i] = e.target.value; updateField(field.id, { options: newOpts }); }} />
                        </div>
                      ))}
                      <button onClick={() => updateField(field.id, { options: [...field.options, `Option ${field.options.length + 1}`] })} className="text-sm font-medium mt-2 hover:underline" style={{ color: t.buttonBgColor }}>+ Add option</button>
                    </div>
                  )}

                  {/* Rating Preview */}
                  {field.type === 'rating' && (
                    <div className="flex gap-2 text-3xl" style={{ color: hexToRgba(t.textColor, 0.2) }}>★★★★★</div>
                  )}

                  {/* Media Blocks */}
                  {(field.type === 'image' || field.type === 'video') && (
                    <div className="flex flex-col gap-4">
                      <input type="text" className="font-semibold bg-transparent border-b border-transparent hover:border-gray-300 w-full focus:outline-none text-lg transition-colors" 
                        style={{ color: t.labelColor, borderBottomColor: hexToRgba(t.inputBorderColor, 0.5) }}
                        value={field.label} onChange={e => updateField(field.id, { label: e.target.value })} placeholder="Media Title (optional)" />
                      
                      {!field.url ? (
                        <label className="w-full border-2 border-dashed p-12 flex flex-col items-center justify-center cursor-pointer transition-colors" style={{ borderColor: t.inputBorderColor, backgroundColor: hexToRgba(t.inputBgColor, 0.5), borderRadius: t.inputRadius }}>
                          <UploadCloud size={32} style={{ color: t.buttonBgColor }} className="mb-3" />
                          <span className="text-sm font-medium" style={{ color: t.buttonBgColor }}>Upload {field.type}</span>
                          <input type="file" accept={field.type === 'image' ? 'image/*' : 'video/mp4'} className="hidden" onChange={(e) => handleMediaUpload(e.target.files[0], field.id)} />
                        </label>
                      ) : (
                        <div style={{ textAlign: field.align }}>
                          {field.type === 'image' ? (
                            <img src={field.url} alt="media" style={{ width: field.width, borderRadius: field.borderRadius }} className="inline-block shadow-sm" />
                          ) : (
                            <video src={field.url} controls style={{ width: field.width, borderRadius: field.borderRadius }} className="inline-block shadow-sm" />
                          )}
                          {field.caption && <p className="text-sm mt-2" style={{ color: t.textColor }}>{field.caption}</p>}
                        </div>
                      )}
                      
                      {/* Media Settings Inline */}
                      {field.url && (
                        <div className="flex flex-wrap items-center gap-3 p-3 mt-4 border rounded-xl" style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor }}>
                          <label className="text-xs font-semibold" style={{ color: t.textColor }}>Align:</label>
                          <div className="flex rounded-lg p-1" style={{ backgroundColor: hexToRgba(t.textColor, 0.1) }}>
                            <button onClick={() => updateField(field.id, { align: 'left' })} className="p-1.5"><AlignLeft size={14} color={t.textColor}/></button>
                            <button onClick={() => updateField(field.id, { align: 'center' })} className="p-1.5"><AlignCenter size={14} color={t.textColor}/></button>
                            <button onClick={() => updateField(field.id, { align: 'right' })} className="p-1.5"><AlignRight size={14} color={t.textColor}/></button>
                          </div>
                          
                          <select className="text-xs border-none rounded-lg p-2 outline-none cursor-pointer" style={{ backgroundColor: hexToRgba(t.textColor, 0.1), color: t.textColor }} value={field.width} onChange={(e) => updateField(field.id, { width: e.target.value })}>
                            <option value="50%">Small</option>
                            <option value="75%">Medium</option>
                            <option value="100%">Full Width</option>
                          </select>
                          
                          <input type="text" placeholder="Add caption..." className="flex-1 min-w-[120px] text-xs border-none rounded-lg p-2 outline-none" style={{ backgroundColor: hexToRgba(t.textColor, 0.1), color: t.textColor }} value={field.caption} onChange={(e) => updateField(field.id, { caption: e.target.value })} />
                          <button onClick={() => updateField(field.id, { url: '' })} className="text-xs font-medium ml-2 text-red-500">Remove</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {form.fields.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed rounded-2xl" style={{ borderColor: t.inputBorderColor, color: t.textColor }}>
                  <p className="font-medium mb-1">Your form is empty</p>
                  <p className="text-sm opacity-70">Add fields from the build tab.</p>
                </div>
              )}
              
              {/* Submit Button Preview */}
              <button disabled className="w-full font-bold py-4 mt-8 opacity-90 transition-transform" style={{ backgroundColor: t.buttonBgColor, color: t.buttonTextColor, borderRadius: t.buttonRadius }}>
                Submit Responses
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Basic styles for sidebar buttons */}
      <style>{`
        .btn-add-field {
          border: 1px solid #e5e7eb;
          background-color: #f9fafb;
          padding: 8px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .btn-add-field:hover { border-color: #6366f1; }
        html.dark .btn-add-field { background-color: #1f2937; border-color: #374151; color: #d1d5db; }
        html.dark .btn-add-field:hover { border-color: #818cf8; }
      `}</style>
    </div>
  );
}

function ColorPicker({ label, val, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{label}</span>
      <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 p-1 rounded-md bg-white dark:bg-gray-900">
        <input type="color" className="w-5 h-5 rounded cursor-pointer border-0 p-0" value={val?.substring(0,7) || '#000000'} onChange={e => onChange(e.target.value)} />
        <input type="text" className="w-16 text-[10px] uppercase font-mono outline-none bg-transparent dark:text-white" value={val} onChange={e => onChange(e.target.value)} />
      </div>
    </div>
  );
}
