import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Settings, Save, Plus, Trash, Image as ImageIcon, Video, 
  UploadCloud, AlignLeft, AlignCenter, AlignRight, LayoutTemplate, Palette,
  Copy, Type, Mail, Phone, Hash, CheckSquare, List, ToggleLeft, Star, Smile,
  SlidersHorizontal, BarChart, Calendar, Clock, HelpCircle, Layers, ArrowLeft,
  GripVertical, Eye, Share2
} from 'lucide-react';

const DEFAULT_THEME = {
  backgroundType: 'color',
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

const FIELD_LIBRARY = [
  { group: 'Text', items: [
    { type: 'text', icon: Type, label: 'Short Text' },
    { type: 'longtext', icon: AlignLeft, label: 'Long Text' },
    { type: 'email', icon: Mail, label: 'Email' },
    { type: 'phone', icon: Phone, label: 'Phone' },
    { type: 'number', icon: Hash, label: 'Number' },
  ]},
  { group: 'Choice', items: [
    { type: 'radio', icon: CheckSquare, label: 'Single Choice' },
    { type: 'checkbox', icon: CheckSquare, label: 'Multiple Choice' },
    { type: 'dropdown', icon: List, label: 'Dropdown' },
    { type: 'yesno', icon: ToggleLeft, label: 'Yes/No' },
  ]},
  { group: 'Rating & Scale', items: [
    { type: 'rating', icon: Star, label: 'Star Rating' },
    { type: 'emoji', icon: Smile, label: 'Emoji Rating' },
    { type: 'slider', icon: SlidersHorizontal, label: 'Slider' },
  ]},
  { group: 'Date & Time', items: [
    { type: 'date', icon: Calendar, label: 'Date' },
    { type: 'time', icon: Clock, label: 'Time' },
  ]},
  { group: 'Media & Layout', items: [
    { type: 'image', icon: ImageIcon, label: 'Image' },
    { type: 'video', icon: Video, label: 'Video' },
    { type: 'section', icon: Layers, label: 'Section Break' },
  ]},
];

export default function FormBuilder({ token }) {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [form, setForm] = useState({
    title: 'Untitled Form',
    description: 'Please fill out this form.',
    type: 'feedback',
    fields: [],
    theme: { ...DEFAULT_THEME },
    status: 'draft'
  });

  const [activeRightTab, setActiveRightTab] = useState('field'); // 'field' | 'theme'
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  const [saveState, setSaveState] = useState(''); 
  const isFirstRender = useRef(true);
  const dragItem = useRef();
  const dragOverItem = useRef();

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5000/api/forms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setForm({ ...res.data, theme: { ...DEFAULT_THEME, ...res.data.theme } });
      }).catch(err => console.error(err));
    }
  }, [id, token]);

  // Autosave Logic (only if form has an ID)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!id) return; // Don't autosave drafts until explicit save

    setSaveState('Saving...');
    const timer = setTimeout(async () => {
      try {
        await axios.put(`http://localhost:5000/api/forms/${id}`, form, { headers: { Authorization: `Bearer ${token}` }});
        setSaveState('Saved ✓');
        setTimeout(() => setSaveState(''), 2000);
      } catch(e) {
        setSaveState('Error saving');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [form, id, token]);

  // Field Management
  const addField = (type) => {
    const newId = Date.now().toString();
    const newField = { 
      id: newId, 
      type, 
      label: type === 'section' ? 'New Section' : 'New Question', 
      description: '',
      placeholder: '', 
      required: false,
      options: ['radio', 'checkbox', 'dropdown'].includes(type) ? ['Option 1', 'Option 2'] : [],
      url: '', caption: '', align: 'center', width: '100%', borderRadius: '8px',
      min: '', max: '', charLimit: ''
    };
    
    setForm(prev => {
      const idx = prev.fields.findIndex(f => f.id === selectedFieldId);
      const newFields = [...prev.fields];
      if (idx === -1) {
        newFields.push(newField);
      } else {
        newFields.splice(idx + 1, 0, newField);
      }
      return { ...prev, fields: newFields };
    });
    setSelectedFieldId(newId);
    setActiveRightTab('field');
  };

  const updateField = (id, updates) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  };

  const duplicateField = (id) => {
    const fieldToDup = form.fields.find(f => f.id === id);
    if (!fieldToDup) return;
    const newId = Date.now().toString();
    const newField = { ...fieldToDup, id: newId, label: fieldToDup.label + ' (copy)' };
    
    setForm(prev => {
      const idx = prev.fields.findIndex(f => f.id === id);
      const newFields = [...prev.fields];
      newFields.splice(idx + 1, 0, newField);
      return { ...prev, fields: newFields };
    });
    setSelectedFieldId(newId);
  };

  const removeField = (id) => {
    setForm(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== id) }));
    if (selectedFieldId === id) setSelectedFieldId(null);
    showToast('Field deleted');
  };

  // Drag and Drop
  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
  };
  const handleDragEnd = () => {
    if (dragItem.current === undefined || dragOverItem.current === undefined) return;
    const newFields = [...form.fields];
    const draggedContent = newFields.splice(dragItem.current, 1)[0];
    newFields.splice(dragOverItem.current, 0, draggedContent);
    dragItem.current = undefined;
    dragOverItem.current = undefined;
    setForm({ ...form, fields: newFields });
  };
  const handleDragOver = (e) => e.preventDefault();

  // Media
  const handleMediaUpload = async (file, fieldId) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:5000/api/media/upload', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      updateField(fieldId, { url: res.data.url });
    } catch (err) { alert('Error uploading media'); }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:5000/api/media/upload', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateTheme('logoUrl', res.data.url);
    } catch (err) { alert('Error uploading logo'); } 
    finally { setUploadingLogo(false); }
  };

  const handleBgUpload = async (file) => {
    if (!file) return;
    setUploadingBg(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:5000/api/media/upload', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateTheme('backgroundImage', res.data.url);
      updateTheme('backgroundType', 'image');
    } catch (err) { alert('Error uploading bg'); } 
    finally { setUploadingBg(false); }
  };

  const updateTheme = (key, value) => setForm(prev => ({ ...prev, theme: { ...prev.theme, [key]: value } }));
  const applyPreset = (presetName) => {
    setForm(prev => ({ ...prev, theme: { ...PRESETS[presetName], logoUrl: prev.theme.logoUrl, logoAlign: prev.theme.logoAlign } }));
    showToast(`Applied ${presetName} theme`);
  };

  // Actions
  const publishForm = async () => {
    try {
      setSaveState('Publishing...');
      const payload = { ...form, status: 'published' };
      if (id) {
        await axios.put(`http://localhost:5000/api/forms/${id}`, payload, { headers: { Authorization: `Bearer ${token}` }});
        showToast('Form published successfully!');
        setSaveState('Published ✓');
      } else {
        const res = await axios.post('http://localhost:5000/api/forms', payload, { headers: { Authorization: `Bearer ${token}` }});
        showToast('Form created & published!');
        navigate(`/builder/${res.data._id}`, { replace: true });
      }
    } catch (err) { alert('Error publishing form'); setSaveState(''); }
  };

  const saveDraft = async () => {
    try {
      setSaveState('Saving...');
      const payload = { ...form, status: 'draft' };
      if (id) {
        await axios.put(`http://localhost:5000/api/forms/${id}`, payload, { headers: { Authorization: `Bearer ${token}` }});
        setSaveState('Saved ✓');
      } else {
        const res = await axios.post('http://localhost:5000/api/forms', payload, { headers: { Authorization: `Bearer ${token}` }});
        navigate(`/builder/${res.data._id}`, { replace: true });
      }
    } catch (err) { alert('Error saving draft'); setSaveState(''); }
  };

  const openPreview = () => {
    if(!id) {
      alert("Please save the form at least once before previewing.");
      return;
    }
    window.open(`/form/${form.publicId}`, '_blank');
  };

  // Styles Computation
  const hexToRgba = (hex, alpha) => {
    if(!hex || !hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const t = form.theme;
  const containerStyle = {
    fontFamily: t.fontFamily,
    backgroundColor: t.backgroundType === 'color' ? t.backgroundColor : undefined,
    backgroundImage: t.backgroundType === 'gradient' ? t.backgroundGradient : (t.backgroundType === 'image' && t.backgroundImage ? `url(${t.backgroundImage})` : 'none'),
    backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', position: 'relative'
  };
  const overlayStyle = { position: 'absolute', inset: 0, backgroundColor: t.backgroundOverlay, backdropFilter: `blur(${t.backgroundBlur})`, pointerEvents: 'none' };
  const cardStyle = { backgroundColor: hexToRgba(t.cardColor, t.cardTransparency), borderRadius: t.cardRadius, boxShadow: t.cardShadow, width: '100%', maxWidth: t.formWidth, margin: '0 auto', position: 'relative', backdropFilter: t.cardTransparency < 1 ? 'blur(16px)' : 'none' };

  const selectedField = form.fields.find(f => f.id === selectedFieldId);

  return (
    <div className="flex flex-col h-screen -m-4 sm:-m-6 lg:-m-8 overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl z-50 animate-in slide-in-from-bottom-5">
          {toastMsg}
        </div>
      )}

      {/* TOP NAVBAR */}
      <div className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111113] px-4 flex items-center justify-between shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"><ArrowLeft size={20}/></button>
          <input 
            type="text" 
            className="text-lg font-bold bg-transparent outline-none border-b border-transparent hover:border-gray-300 focus:border-indigo-500 text-gray-900 dark:text-white px-1 py-0.5 transition-colors" 
            value={form.title} 
            onChange={e => setForm({...form, title: e.target.value})} 
          />
          {saveState && <span className="text-xs text-gray-400 font-medium ml-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{saveState}</span>}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => setActiveRightTab('theme')} className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activeRightTab === 'theme' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
            <Palette size={16}/> <span className="hidden sm:inline">Theme</span>
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>
          <button onClick={openPreview} className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors">
            <Eye size={16}/> <span className="hidden sm:inline">Preview</span>
          </button>
          <button onClick={saveDraft} className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors">
            <Save size={16}/> <span className="hidden sm:inline">Save Draft</span>
          </button>
          <button onClick={publishForm} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-transform hover:scale-105">
            <Share2 size={16}/> Publish
          </button>
        </div>
      </div>

      {/* MAIN 3-COLUMN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT: FIELD LIBRARY (Hidden on mobile if editing properties) */}
        <div className="w-64 bg-white dark:bg-[#111113] border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0 overflow-y-auto hidden md:flex z-10 shadow-lg">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Field Library</h2>
          </div>
          <div className="p-4 space-y-6">
            {FIELD_LIBRARY.map((group, idx) => (
              <div key={idx}>
                <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-300 mb-3">{group.group}</h3>
                <div className="grid grid-cols-1 gap-2">
                  {group.items.map(item => (
                    <button 
                      key={item.type} 
                      onClick={() => addField(item.type)} 
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 rounded-lg transition-colors text-left"
                    >
                      <item.icon size={16} /> {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: FORM CANVAS */}
        <div className="flex-1 relative overflow-y-auto" style={containerStyle}>
          <div style={overlayStyle}></div>
          <div className="py-12 px-4 relative z-10 min-h-full" onClick={(e) => { if (e.target === e.currentTarget) { setSelectedFieldId(null); setActiveRightTab('theme'); } }}>
            
            <div style={cardStyle} className="overflow-hidden transition-all duration-300 outline-none">
              
              {t.logoUrl && (
                <div className="p-8 pb-0" style={{ textAlign: t.logoAlign }}>
                  <img src={t.logoUrl} alt="Logo" className="max-h-20 object-contain inline-block" />
                </div>
              )}

              {/* Form Header (Editable in properties, but inline editable here too) */}
              <div 
                className={`p-8 border-b cursor-pointer transition-colors ${selectedFieldId === 'header' ? 'ring-2 ring-indigo-500 ring-inset bg-black/5 dark:bg-white/5' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} 
                style={{ borderColor: hexToRgba(t.inputBorderColor, 0.3) }}
                onClick={() => { setSelectedFieldId('header'); setActiveRightTab('field'); }}
              >
                <input 
                  className="text-3xl font-bold mb-3 leading-tight w-full bg-transparent outline-none border-b border-transparent focus:border-gray-300" 
                  style={{ color: t.headingColor }} 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                />
                <textarea 
                  className="text-lg w-full bg-transparent outline-none border-b border-transparent focus:border-gray-300 resize-none overflow-hidden" 
                  style={{ color: t.textColor }} 
                  value={form.description} 
                  onChange={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; setForm({...form, description: e.target.value}); }} 
                  rows={1}
                />
              </div>

              <div className="p-4 sm:p-8 space-y-4">
                {form.fields.map((field, index) => (
                  <div 
                    key={field.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onClick={() => { setSelectedFieldId(field.id); setActiveRightTab('field'); }}
                    className={`relative group p-4 sm:p-6 rounded-xl border-2 transition-all cursor-pointer ${selectedFieldId === field.id ? 'border-indigo-500 shadow-md bg-white/40 dark:bg-black/20 backdrop-blur-sm' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-white/20 dark:hover:bg-black/10'}`}
                  >
                    
                    {/* Drag Handle & Actions */}
                    <div className={`absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity ${selectedFieldId === field.id ? 'opacity-100 text-indigo-400' : ''}`}>
                      <GripVertical size={20}/>
                    </div>

                    <div className="pl-6">
                      
                      {/* Section Break Specific rendering */}
                      {field.type === 'section' ? (
                        <div className="border-b-2 pb-4 mt-6" style={{ borderColor: hexToRgba(t.inputBorderColor, 0.5) }}>
                          <h3 className="text-xl font-bold" style={{ color: t.headingColor }}>{field.label}</h3>
                          {field.description && <p className="text-sm mt-1" style={{ color: t.textColor }}>{field.description}</p>}
                        </div>
                      ) : (
                        <>
                          {/* Standard Field Label */}
                          {field.type !== 'image' && field.type !== 'video' && (
                            <div className="font-semibold text-lg mb-2 flex items-center gap-2" style={{ color: t.labelColor }}>
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                            </div>
                          )}
                          {field.description && <p className="text-sm mb-4" style={{ color: t.textColor }}>{field.description}</p>}

                          {/* Inputs */}
                          {(field.type === 'text' || field.type === 'email' || field.type === 'phone' || field.type === 'number') && (
                            <input disabled type={field.type} placeholder={field.placeholder || 'Short answer text'} className="w-full p-3 border outline-none" style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, color: t.inputTextColor, borderRadius: t.inputRadius }} />
                          )}

                          {field.type === 'longtext' && (
                            <textarea disabled placeholder={field.placeholder || 'Long answer text'} className="w-full p-3 border outline-none min-h-[100px]" style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, color: t.inputTextColor, borderRadius: t.inputRadius }} />
                          )}

                          {(field.type === 'radio' || field.type === 'checkbox') && (
                            <div className="space-y-3">
                              {field.options.map((opt, i) => (
                                <div key={i} className="flex items-center gap-3">
                                  <div className={`w-5 h-5 border-2 ${field.type === 'radio' ? 'rounded-full' : 'rounded'}`} style={{ borderColor: t.inputBorderColor }}></div>
                                  <span style={{ color: t.textColor }}>{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {field.type === 'dropdown' && (
                            <div className="w-full p-3 border flex justify-between items-center" style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, color: t.inputTextColor, borderRadius: t.inputRadius }}>
                              <span className="opacity-50">Select an option...</span>
                              <ChevronRight size={16} className="rotate-90 opacity-50"/>
                            </div>
                          )}

                          {field.type === 'rating' && (
                            <div className="flex gap-2 text-3xl" style={{ color: hexToRgba(t.textColor, 0.2) }}>★★★★★</div>
                          )}

                          {field.type === 'emoji' && (
                            <div className="flex gap-4 text-3xl opacity-50">😠 🙁 😐 🙂 🤩</div>
                          )}

                          {field.type === 'slider' && (
                            <div className="w-full h-2 rounded-full mt-4 bg-gray-200">
                               <div className="w-1/2 h-full rounded-full" style={{ backgroundColor: t.buttonBgColor }}></div>
                            </div>
                          )}

                          {(field.type === 'date' || field.type === 'time') && (
                            <div className="w-1/2 p-3 border flex items-center gap-3 opacity-70" style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, color: t.inputTextColor, borderRadius: t.inputRadius }}>
                               {field.type === 'date' ? <Calendar size={18}/> : <Clock size={18}/>}
                               <span>{field.type === 'date' ? 'MM/DD/YYYY' : 'HH:MM AM/PM'}</span>
                            </div>
                          )}

                          {field.type === 'yesno' && (
                            <div className="flex gap-4">
                              <div className="flex-1 p-3 border text-center font-medium" style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, color: t.textColor, borderRadius: t.inputRadius }}>Yes</div>
                              <div className="flex-1 p-3 border text-center font-medium" style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, color: t.textColor, borderRadius: t.inputRadius }}>No</div>
                            </div>
                          )}

                          {(field.type === 'image' || field.type === 'video') && (
                            <div className="flex flex-col gap-2">
                              {!field.url ? (
                                <div className="w-full border-2 border-dashed p-12 flex flex-col items-center justify-center opacity-70" style={{ borderColor: t.inputBorderColor, backgroundColor: t.inputBgColor, borderRadius: t.inputRadius }}>
                                  <ImageIcon size={32} style={{ color: t.textColor }} className="mb-2" />
                                  <span className="text-sm font-medium" style={{ color: t.textColor }}>Placeholder for {field.type}</span>
                                </div>
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
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {form.fields.length === 0 && (
                  <div className="text-center py-20 border-2 border-dashed rounded-2xl mx-8 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition" onClick={() => addField('text')} style={{ borderColor: t.inputBorderColor, color: t.textColor }}>
                    <Plus size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="font-semibold mb-1">Canvas is empty</p>
                    <p className="text-sm opacity-70">Click here or use the library to add fields.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: PROPERTIES & THEME PANEL */}
        <div className="w-80 bg-white dark:bg-[#111113] border-l border-gray-200 dark:border-gray-800 flex flex-col shrink-0 overflow-y-auto shadow-lg z-20">
          <div className="flex border-b border-gray-200 dark:border-gray-800 shrink-0">
            <button onClick={() => setActiveRightTab('field')} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 ${activeRightTab === 'field' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <Settings size={16}/> Properties
            </button>
            <button onClick={() => setActiveRightTab('theme')} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 ${activeRightTab === 'theme' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <Palette size={16}/> Theme Studio
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {activeRightTab === 'field' && selectedFieldId === 'header' && (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                 <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Form Details</h3>
                 <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
                    <input type="text" className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                    <textarea className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm min-h-[100px]" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                 </div>
                 
                 <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Form Logo</label>
                    <label className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 flex flex-col items-center justify-center rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <UploadCloud size={20} className="text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">{uploadingLogo ? 'Uploading...' : (t.logoUrl ? 'Change Logo' : 'Upload Logo')}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e.target.files[0])} />
                    </label>
                    {t.logoUrl && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => updateTheme('logoAlign', 'left')} className={`p-1.5 rounded-lg border ${t.logoAlign === 'left' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}><AlignLeft size={14}/></button>
                        <button onClick={() => updateTheme('logoAlign', 'center')} className={`p-1.5 rounded-lg border ${t.logoAlign === 'center' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}><AlignCenter size={14}/></button>
                        <button onClick={() => updateTheme('logoAlign', 'right')} className={`p-1.5 rounded-lg border ${t.logoAlign === 'right' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}><AlignRight size={14}/></button>
                        <button onClick={() => updateTheme('logoUrl', '')} className="p-1.5 ml-auto text-xs text-red-500 font-medium">Remove</button>
                      </div>
                    )}
                 </div>
              </div>
            )}

            {activeRightTab === 'field' && selectedField && selectedFieldId !== 'header' && (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white capitalize">{selectedField.type} Settings</h3>
                  <div className="flex gap-1">
                    <button onClick={() => duplicateField(selectedField.id)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded bg-gray-50 dark:bg-gray-800" title="Duplicate"><Copy size={14}/></button>
                    <button onClick={() => removeField(selectedField.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded bg-gray-50 dark:bg-gray-800" title="Delete"><Trash size={14}/></button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Label / Question</label>
                  <input type="text" className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-indigo-500" value={selectedField.label} onChange={e => updateField(selectedField.id, { label: e.target.value })} />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Description (Optional)</label>
                  <input type="text" className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-indigo-500" value={selectedField.description || ''} onChange={e => updateField(selectedField.id, { description: e.target.value })} />
                </div>

                {['text', 'longtext', 'email', 'phone', 'number'].includes(selectedField.type) && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Placeholder</label>
                    <input type="text" className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" value={selectedField.placeholder || ''} onChange={e => updateField(selectedField.id, { placeholder: e.target.value })} />
                  </div>
                )}

                {['radio', 'checkbox', 'dropdown'].includes(selectedField.type) && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Options</label>
                    <div className="space-y-2">
                      {selectedField.options.map((opt, i) => (
                        <div key={i} className="flex gap-2">
                          <input type="text" className="flex-1 p-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-sm outline-none focus:border-indigo-500" value={opt} onChange={e => { const newOpts = [...selectedField.options]; newOpts[i] = e.target.value; updateField(selectedField.id, { options: newOpts }); }} />
                          <button onClick={() => { const newOpts = [...selectedField.options]; newOpts.splice(i, 1); updateField(selectedField.id, { options: newOpts }); }} className="p-1.5 text-gray-400 hover:text-red-500"><Trash size={14}/></button>
                        </div>
                      ))}
                      <button onClick={() => updateField(selectedField.id, { options: [...selectedField.options, `Option ${selectedField.options.length + 1}`] })} className="text-xs font-bold text-indigo-600 hover:underline">+ Add Option</button>
                    </div>
                  </div>
                )}

                {(selectedField.type === 'image' || selectedField.type === 'video') && (
                  <div className="space-y-4 pt-2">
                    <label className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 flex flex-col items-center justify-center rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <UploadCloud size={20} className="text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">{selectedField.url ? 'Change Media' : 'Upload Media'}</span>
                      <input type="file" accept={selectedField.type === 'image' ? 'image/*' : 'video/mp4'} className="hidden" onChange={(e) => handleMediaUpload(e.target.files[0], selectedField.id)} />
                    </label>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Alignment</label>
                      <select className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" value={selectedField.align} onChange={e => updateField(selectedField.id, { align: e.target.value })}>
                        <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Width</label>
                      <select className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" value={selectedField.width} onChange={e => updateField(selectedField.id, { width: e.target.value })}>
                        <option value="50%">Small</option><option value="75%">Medium</option><option value="100%">Full Width</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Caption</label>
                      <input type="text" className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" value={selectedField.caption} onChange={e => updateField(selectedField.id, { caption: e.target.value })} />
                    </div>
                  </div>
                )}

                {selectedField.type !== 'section' && selectedField.type !== 'image' && selectedField.type !== 'video' && (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Required Field</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={selectedField.required} onChange={e => updateField(selectedField.id, { required: e.target.checked })} />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                )}
              </div>
            )}

            {activeRightTab === 'field' && !selectedField && selectedFieldId !== 'header' && (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-50">
                <Settings size={32} className="mb-3"/>
                <p className="text-sm font-medium">No field selected</p>
                <p className="text-xs mt-1">Select a field on the canvas to edit its properties.</p>
              </div>
            )}

            {/* Theme Studio Content (Exactly as requested to be preserved) */}
            {activeRightTab === 'theme' && (
              <div className="space-y-6 pb-12 animate-in fade-in zoom-in-95 duration-200">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2 tracking-wider">Presets</label>
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

                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 tracking-wider">Background</label>
                  <select className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm outline-none dark:text-white" value={t.backgroundType} onChange={e => updateTheme('backgroundType', e.target.value)}>
                    <option value="color">Solid Color</option><option value="gradient">Gradient</option><option value="image">Image</option>
                  </select>
                  {t.backgroundType === 'color' && (
                    <div className="flex items-center gap-2">
                      <input type="color" className="h-8 w-8 rounded cursor-pointer border-0 p-0" value={t.backgroundColor} onChange={e => updateTheme('backgroundColor', e.target.value)} />
                      <input type="text" className="flex-1 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 outline-none uppercase font-mono" value={t.backgroundColor} onChange={e => updateTheme('backgroundColor', e.target.value)} />
                    </div>
                  )}
                  {t.backgroundType === 'gradient' && (
                    <input type="text" className="w-full text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 outline-none" value={t.backgroundGradient} onChange={e => updateTheme('backgroundGradient', e.target.value)} />
                  )}
                  {t.backgroundType === 'image' && (
                    <div>
                      <label className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 p-3 flex flex-col items-center justify-center rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <span className="text-xs text-gray-500">{uploadingBg ? 'Uploading...' : (t.backgroundImage ? 'Change Image' : 'Upload Image')}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBgUpload(e.target.files[0])} />
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                         <label className="text-xs text-gray-500">Blur:</label>
                         <input type="text" className="flex-1 text-xs bg-gray-50 border p-1 rounded" value={t.backgroundBlur} onChange={e => updateTheme('backgroundBlur', e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 tracking-wider">Typography</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm outline-none" value={t.fontFamily} onChange={e => updateTheme('fontFamily', e.target.value)}>
                    <option value="Inter, sans-serif">Inter</option><option value="Roboto, sans-serif">Roboto</option><option value="Georgia, serif">Georgia</option><option value="monospace">Monospace</option><option value="'Comic Sans MS', cursive">Comic Sans</option>
                  </select>
                  <ColorPicker label="Heading Color" val={t.headingColor} onChange={v => updateTheme('headingColor', v)} />
                  <ColorPicker label="Text Color" val={t.textColor} onChange={v => updateTheme('textColor', v)} />
                  <ColorPicker label="Label Color" val={t.labelColor} onChange={v => updateTheme('labelColor', v)} />
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 tracking-wider">Card Container</label>
                  <ColorPicker label="Card Color" val={t.cardColor} onChange={v => updateTheme('cardColor', v)} />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Layout:</span>
                    <select className="bg-gray-50 border p-1 rounded" value={t.layout || 'single'} onChange={e => updateTheme('layout', e.target.value)}>
                      <option value="single">Single Page</option>
                      <option value="multistep">Multi-Step (by Section)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Opacity:</span>
                    <input type="range" min="0" max="1" step="0.05" value={t.cardTransparency} onChange={e => updateTheme('cardTransparency', parseFloat(e.target.value))} className="w-32" />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-600 w-16">Radius:</span>
                    <input type="text" className="flex-1 bg-gray-50 border p-1 rounded" value={t.cardRadius} onChange={e => updateTheme('cardRadius', e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-600 w-16">Width:</span>
                    <input type="text" className="flex-1 bg-gray-50 border p-1 rounded" value={t.formWidth} onChange={e => updateTheme('formWidth', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 tracking-wider">Inputs & Buttons</label>
                  <ColorPicker label="Input Bg" val={t.inputBgColor} onChange={v => updateTheme('inputBgColor', v)} />
                  <ColorPicker label="Input Border" val={t.inputBorderColor} onChange={v => updateTheme('inputBorderColor', v)} />
                  <ColorPicker label="Input Text" val={t.inputTextColor} onChange={v => updateTheme('inputTextColor', v)} />
                  <div className="flex items-center gap-2 text-xs mb-3">
                    <span className="text-gray-600 w-16">Radius:</span>
                    <input type="text" className="flex-1 bg-gray-50 border p-1 rounded" value={t.inputRadius} onChange={e => updateTheme('inputRadius', e.target.value)} />
                  </div>
                  <ColorPicker label="Button Bg" val={t.buttonBgColor} onChange={v => updateTheme('buttonBgColor', v)} />
                  <ColorPicker label="Button Text" val={t.buttonTextColor} onChange={v => updateTheme('buttonTextColor', v)} />
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-600 w-16">Btn Radius:</span>
                    <input type="text" className="flex-1 bg-gray-50 border p-1 rounded" value={t.buttonRadius} onChange={e => updateTheme('buttonRadius', e.target.value)} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
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
