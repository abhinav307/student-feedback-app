import { useState, useRef, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Settings, Save, Plus, Trash, Image as ImageIcon, Video, 
  UploadCloud, AlignLeft, AlignCenter, AlignRight, LayoutTemplate, Palette,
  Copy, Type, Mail, Phone, Hash, CheckSquare, List, ToggleLeft, Star, Smile,
  SlidersHorizontal, BarChart, Calendar, Clock, HelpCircle, Layers, ArrowLeft,
  GripVertical, Eye, Share2, Globe, Link as LinkIcon, QrCode, Download, CheckCircle, AlertCircle
} from 'lucide-react';
import QRCode from 'react-qr-code';

const DEFAULT_THEME = {
  backgroundType: 'color', backgroundColor: '#f3f4f6', backgroundGradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  backgroundImage: '', backgroundOverlay: 'rgba(0,0,0,0)', backgroundBlur: '0px',
  cardColor: '#ffffff', cardTransparency: 1, cardRadius: '16px', cardShadow: '0 10px 25px rgba(0,0,0,0.1)', formWidth: '800px', layout: 'single',
  headingColor: '#111827', textColor: '#4b5563', labelColor: '#374151',
  inputBgColor: '#f9fafb', inputBorderColor: '#d1d5db', inputTextColor: '#111827', inputRadius: "8px",
  buttonBgColor: '#4f46e5', buttonTextColor: '#ffffff', buttonRadius: '8px',
  fontFamily: 'Inter, sans-serif', logoUrl: '', logoAlign: 'center'
};

const PRESET_COLORS = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#000000', '#0f172a', '#1e293b', '#334155',
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
];

const PRESET_GRADIENTS = [
  'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
  'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
  'linear-gradient(135deg, #09203f 0%, #537895 100%)',
  'linear-gradient(135deg, #29323c 0%, #485563 100%)',
  'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  'linear-gradient(135deg, #4ca1af 0%, #c4e0e5 100%)',
];

const PRESETS = {
  'Modern Blue': { ...DEFAULT_THEME, backgroundColor: '#f0f9ff', buttonBgColor: '#0ea5e9' },
  'Dark Glass': { 
    ...DEFAULT_THEME, 
    backgroundType: 'gradient', backgroundGradient: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
    cardColor: '#1e293b', cardTransparency: 0.6, cardRadius: '24px', cardShadow: '0 20px 40px rgba(0,0,0,0.4)',
    headingColor: '#f8fafc', textColor: '#cbd5e1', labelColor: '#e2e8f0',
    inputBgColor: 'rgba(15,23,42,0.5)', inputBorderColor: '#334155', inputTextColor: '#ffffff',
    buttonBgColor: '#3b82f6', backgroundBlur: '10px'
  }
};

const FIELD_LIBRARY = [
  { group: 'Text', items: [
    { type: 'text', icon: Type, label: 'Short Text' }, { type: 'longtext', icon: AlignLeft, label: 'Long Text' },
    { type: 'email', icon: Mail, label: 'Email' }, { type: 'phone', icon: Phone, label: 'Phone' }, { type: 'number', icon: Hash, label: 'Number' },
  ]},
  { group: 'Choice', items: [
    { type: 'radio', icon: CheckSquare, label: 'Single Choice' }, { type: 'checkbox', icon: CheckSquare, label: 'Multiple Choice' },
    { type: 'dropdown', icon: List, label: 'Dropdown' }, { type: 'yesno', icon: ToggleLeft, label: 'Yes/No' },
  ]},
  { group: 'Rating & Scale', items: [
    { type: 'rating', icon: Star, label: 'Star Rating' }, { type: 'emoji', icon: Smile, label: 'Emoji Rating' }, { type: 'slider', icon: SlidersHorizontal, label: 'Slider' },
  ]},
  { group: 'Date & Time', items: [
    { type: 'date', icon: Calendar, label: 'Date' }, { type: 'time', icon: Clock, label: 'Time' },
  ]},
  { group: 'Media & Layout', items: [
    { type: 'image', icon: ImageIcon, label: 'Image' }, { type: 'video', icon: Video, label: 'Video' }, { type: 'section', icon: Layers, label: 'Section Break' },
  ]},
  { group: 'Quiz', items: [
    { type: 'quiz-mcq', icon: CheckSquare, label: 'Multiple Choice' }, 
    { type: 'quiz-boolean', icon: ToggleLeft, label: 'True / False' },
    { type: 'quiz-multiselect', icon: CheckSquare, label: 'Multiple Select' }
  ]}
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
    status: 'draft',
    settings: {
      startDate: '', endDate: '', maxResponses: '',
      allowMultiple: false, allowAnonymous: true,
      showReceipt: true, showQrVerification: true
    }
  });

  const [activeRightTab, setActiveRightTab] = useState('field'); // 'field' | 'theme' | 'settings'
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [saveState, setSaveState] = useState(''); 
  
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishStep, setPublishStep] = useState(1);

  const isFirstRender = useRef(true);
  const dragItem = useRef();
  const dragOverItem = useRef();
  const qrRef = useRef();

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    if (id) {
      api.get(`/forms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setForm({ 
          ...res.data, 
          theme: { ...DEFAULT_THEME, ...res.data.theme },
          settings: { 
            startDate: '', endDate: '', maxResponses: '', allowMultiple: false, allowAnonymous: true, showReceipt: true, showQrVerification: true,
            ...res.data.settings 
          }
        });
      }).catch(err => console.error(err));
    }
  }, [id, token]);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (!id) return; 

    setSaveState('Saving...');
    const timer = setTimeout(async () => {
      try {
        await api.put(`/forms/${id}`, form, { headers: { Authorization: `Bearer ${token}` }});
        setSaveState('Saved ✓');
        setTimeout(() => setSaveState(''), 2000);
      } catch(e) { setSaveState('Error saving'); }
    }, 1500);
    return () => clearTimeout(timer);
  }, [form, id, token]);

  const addField = (type) => {
    const newId = Date.now().toString();
    
    let min = ''; let max = ''; let step = '';
    if (type === 'rating' || type === 'emoji') { min = 1; max = 5; step = 1; }
    else if (type === 'slider') { min = 0; max = 100; step = 1; }
    
    const newField = { 
      id: newId, type, label: type === 'section' ? 'New Section' : 'New Question', 
      description: '', placeholder: '', required: false,
      options: ['radio', 'checkbox', 'dropdown'].includes(type) ? ['Option 1', 'Option 2'] : [],
      url: '', caption: '', align: 'center', width: '100%', borderRadius: '8px', min, max, step, charLimit: ''
    };
    
    setForm(prev => {
      const idx = prev.fields.findIndex(f => f.id === selectedFieldId);
      const newFields = [...prev.fields];
      if (idx === -1) newFields.push(newField);
      else newFields.splice(idx + 1, 0, newField);
      return { ...prev, fields: newFields };
    });
    setSelectedFieldId(newId);
    setActiveRightTab('field');
  };

  const updateField = (fid, updates) => setForm(prev => ({ ...prev, fields: prev.fields.map(f => f.id === fid ? { ...f, ...updates } : f) }));
  
  const duplicateField = (fid) => {
    const fieldToDup = form.fields.find(f => f.id === fid);
    if (!fieldToDup) return;
    const newId = Date.now().toString();
    const newField = { ...fieldToDup, id: newId, label: fieldToDup.label + ' (copy)' };
    setForm(prev => {
      const idx = prev.fields.findIndex(f => f.id === fid);
      const newFields = [...prev.fields];
      newFields.splice(idx + 1, 0, newField);
      return { ...prev, fields: newFields };
    });
    setSelectedFieldId(newId);
  };

  const removeField = (fid) => {
    setForm(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== fid) }));
    if (selectedFieldId === fid) setSelectedFieldId(null);
  };

  const handleDragStart = (e, index) => { dragItem.current = index; e.dataTransfer.effectAllowed = "move"; };
  const handleDragEnter = (e, index) => { dragOverItem.current = index; };
  const handleDragEnd = () => {
    if (dragItem.current === undefined || dragOverItem.current === undefined) return;
    const newFields = [...form.fields];
    const draggedContent = newFields.splice(dragItem.current, 1)[0];
    newFields.splice(dragOverItem.current, 0, draggedContent);
    dragItem.current = undefined; dragOverItem.current = undefined;
    setForm({ ...form, fields: newFields });
  };
  const handleDragOver = (e) => e.preventDefault();

  const ensureFormSaved = async () => {
    if (id) return id;
    setSaveState('Saving draft...');
    const payload = { ...form, status: 'draft' };
    const res = await api.post('/forms', payload, { headers: { Authorization: `Bearer ${token}` }});
    navigate(`/builder/${res.data._id}`, { replace: true });
    setSaveState('');
    return res.data._id;
  };

  const handleMediaUpload = async (file, fieldId) => {
    if (!file) return;
    try {
      const currentId = await ensureFormSaved();
      const formData = new FormData(); 
      formData.append('file', file);
      formData.append('formId', currentId);
      showToast('Uploading...');
      const res = await api.post('/media/upload', formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }});
      updateField(fieldId, { url: res.data.url });
      showToast('Image uploaded');
    } catch (err) {
      showToast('Upload failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    setUploadingLogo(true);
    try {
      const currentId = await ensureFormSaved();
      const formData = new FormData(); 
      formData.append('file', file);
      formData.append('formId', currentId);
      const res = await api.post('/media/upload', formData, { headers: { Authorization: `Bearer ${token}` }});
      updateTheme('logoUrl', res.data.url);
    } catch (err) {
      showToast('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally { setUploadingLogo(false); }
  };

  const handleBgUpload = async (file) => {
    if (!file) return;
    setUploadingBg(true);
    const formData = new FormData(); formData.append('file', file);
    try {
      const res = await api.post('/media/upload', formData, { headers: { Authorization: `Bearer ${token}` }});
      updateTheme('backgroundImage', res.data.url);
      updateTheme('backgroundType', 'image');
    } catch (err) {
      showToast('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally { setUploadingBg(false); }
  };

  const updateTheme = (key, value) => setForm(prev => ({ ...prev, theme: { ...prev.theme, [key]: value } }));
  const updateSettings = (key, value) => setForm(prev => ({ ...prev, settings: { ...prev.settings, [key]: value } }));

  const saveDraft = async () => {
    try {
      setSaveState('Saving...');
      const payload = { ...form, status: 'draft' };
      if (id) {
        await api.put(`/forms/${id}`, payload, { headers: { Authorization: `Bearer ${token}` }});
        setSaveState('Saved ✓');
      } else {
        const res = await api.post('/forms', payload, { headers: { Authorization: `Bearer ${token}` }});
        navigate(`/builder/${res.data._id}`, { replace: true });
      }
    } catch (err) { setSaveState(''); showToast('Error saving draft: ' + (err.response?.data?.message || err.message)); }
  };

  const openPublishModal = () => {
    setPublishStep(1);
    setShowPublishModal(true);
  };

  const executePublish = async () => {
    try {
      const payload = { ...form, status: 'published' };
      if (id) {
        await api.put(`/forms/${id}`, payload, { headers: { Authorization: `Bearer ${token}` }});
        setForm(prev => ({ ...prev, status: 'published' }));
      } else {
        const res = await api.post('/forms', payload, { headers: { Authorization: `Bearer ${token}` }});
        setForm(prev => ({ ...prev, status: 'published', publicId: res.data.publicId }));
        navigate(`/builder/${res.data._id}`, { replace: true });
      }
      setPublishStep(2); // Go to share screen
    } catch (err) {
      console.error('Publish Error:', err.response?.data || err);
      showToast(`Error publishing: ${err.response?.data?.message || err.message}`);
    }
  };

  const copyPublicLink = () => {
    const url = `${window.location.origin}/form/${form.publicId}`;
    navigator.clipboard.writeText(url);
    showToast('Public link copied!');
  };

  const downloadQR = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height;
      ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QRCode_${form.publicId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const openPreview = () => {
    sessionStorage.setItem('formPreview', JSON.stringify(form));
    window.open('/form/preview', '_blank');
  };

  const hexToRgba = (hex, alpha) => {
    if(!hex || !hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const t = form.theme;
  const containerStyle = {
    fontFamily: t.fontFamily, backgroundColor: t.backgroundType === 'color' ? t.backgroundColor : undefined,
    backgroundImage: t.backgroundType === 'gradient' ? t.backgroundGradient : (t.backgroundType === 'image' && t.backgroundImage ? `url(${t.backgroundImage})` : 'none'),
    backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', position: 'relative'
  };
  const overlayStyle = { position: 'absolute', inset: 0, backgroundColor: t.backgroundOverlay, backdropFilter: `blur(${t.backgroundBlur})`, pointerEvents: 'none' };
  const cardStyle = { backgroundColor: hexToRgba(t.cardColor, t.cardTransparency), borderRadius: t.cardRadius, boxShadow: t.cardShadow, width: '100%', maxWidth: t.formWidth, margin: '0 auto', position: 'relative', backdropFilter: t.cardTransparency < 1 ? 'blur(16px)' : 'none' };

  const selectedField = form.fields.find(f => f.id === selectedFieldId);

  // Validation for publishing
  const hasTitle = !!form.title && form.title !== 'Untitled Form';
  const hasFields = form.fields.length > 0;
  const canPublish = hasTitle && hasFields;

  return (
    <div className="flex flex-col h-screen -m-4 sm:-m-6 lg:-m-8 overflow-hidden bg-gray-50 dark:bg-[#0a0a0b]">
      
      {toastMsg && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl z-50 animate-in slide-in-from-bottom-5">
          {toastMsg}
        </div>
      )}

      {/* Publish / Share Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111113] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             
             <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                 <Globe className="text-indigo-600"/> {publishStep === 1 ? 'Publish Form' : 'Form Published Successfully'}
               </h2>
               <button onClick={() => setShowPublishModal(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition">✕</button>
             </div>

             <div className="p-8">
               {publishStep === 1 ? (
                 <div className="space-y-6">
                   <h3 className="font-semibold text-gray-700 dark:text-gray-300">Pre-Publish Checklist</h3>
                   <div className="space-y-3 text-sm">
                     <div className="flex items-center gap-3">
                       {hasTitle ? <CheckCircle className="text-emerald-500" size={20}/> : <AlertCircle className="text-amber-500" size={20}/>}
                       <span className="text-gray-700 dark:text-gray-300">Form has a valid title</span>
                     </div>
                     <div className="flex items-center gap-3">
                       {hasFields ? <CheckCircle className="text-emerald-500" size={20}/> : <AlertCircle className="text-amber-500" size={20}/>}
                       <span className="text-gray-700 dark:text-gray-300">Form contains at least one field</span>
                     </div>
                   </div>

                   {form.status === 'published' && (
                     <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 p-4 rounded-xl text-sm font-medium">
                       This form is already published. Continuing will apply your latest changes to the live form immediately.
                     </div>
                   )}

                   <div className="pt-6">
                     <button onClick={executePublish} disabled={!canPublish} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition">
                       {form.status === 'published' ? 'Update Live Form' : 'Publish Form'}
                     </button>
                   </div>
                 </div>
               ) : (
                 <div className="space-y-8 flex flex-col items-center">
                   
                   <div className="w-full">
                     <label className="block text-sm font-semibold text-gray-500 mb-2">Public Form URL</label>
                     <div className="flex bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                       <input type="text" readOnly value={`${window.location.origin}/form/${form.publicId}`} className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-700 dark:text-gray-300 outline-none" />
                       <button onClick={copyPublicLink} className="px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 transition">
                         <Copy size={16}/> Copy
                       </button>
                     </div>
                   </div>

                   <div className="border-t border-gray-100 dark:border-gray-800 w-full pt-8 flex flex-col items-center">
                     <label className="block text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Share via QR</label>
                     <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm mb-4" ref={qrRef}>
                       <QRCode value={`${window.location.origin}/form/${form.publicId}`} size={160} />
                     </div>
                     <button onClick={downloadQR} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-semibold flex items-center gap-2 transition">
                       <Download size={16}/> Download QR Code
                     </button>
                   </div>
                 </div>
               )}
             </div>
          </div>
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
          <div className="flex items-center gap-2">
            {saveState && <span className="text-xs text-gray-400 font-medium ml-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{saveState}</span>}
            {form.status !== 'draft' && (
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${form.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {form.status.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => setActiveRightTab('settings')} className={`p-2 rounded-lg text-sm font-medium transition-colors ${activeRightTab === 'settings' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
            <Settings size={18}/>
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>
          <button onClick={openPreview} className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors">
            <Eye size={16}/> <span className="hidden sm:inline">Preview</span>
          </button>
          {form.status === 'draft' && (
            <button onClick={saveDraft} className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors">
              <Save size={16}/> <span className="hidden sm:inline">Save Draft</span>
            </button>
          )}
          <button onClick={openPublishModal} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-transform hover:scale-105">
            {form.status === 'published' ? <Share2 size={16}/> : <Globe size={16}/>} 
            {form.status === 'published' ? 'Share' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT: FIELD LIBRARY */}
        <div className="w-64 bg-white dark:bg-[#111113] border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0 overflow-y-auto hidden md:flex z-10 shadow-lg">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Field Library</h2>
          </div>
          <div className="p-4 space-y-6">
            {FIELD_LIBRARY.filter(g => form.type === 'quiz' ? true : g.group !== 'Quiz').map((group, idx) => (
              <div key={idx}>
                <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-300 mb-3">{group.group}</h3>
                <div className="grid grid-cols-1 gap-2">
                  {group.items.map(item => (
                    <button 
                      key={item.type} onClick={() => addField(item.type)} 
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

              <div 
                className={`p-8 border-b cursor-pointer transition-colors ${selectedFieldId === 'header' ? 'ring-2 ring-indigo-500 ring-inset bg-black/5 dark:bg-white/5' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} 
                style={{ borderColor: hexToRgba(t.inputBorderColor, 0.3) }}
                onClick={() => { setSelectedFieldId('header'); setActiveRightTab('field'); }}
              >
                <input className="text-3xl font-bold mb-3 leading-tight w-full bg-transparent outline-none border-b border-transparent focus:border-gray-300" style={{ color: t.headingColor }} value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                <textarea className="text-lg w-full bg-transparent outline-none border-b border-transparent focus:border-gray-300 resize-none overflow-hidden" style={{ color: t.textColor }} value={form.description} onChange={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; setForm({...form, description: e.target.value}); }} rows={1} />
              </div>

              <div className="p-4 sm:p-8 space-y-4">
                {form.fields.map((field, index) => (
                  <div 
                    key={field.id} draggable
                    onDragStart={(e) => handleDragStart(e, index)} onDragEnter={(e) => handleDragEnter(e, index)} onDragEnd={handleDragEnd} onDragOver={handleDragOver}
                    onClick={() => { setSelectedFieldId(field.id); setActiveRightTab('field'); }}
                    className={`relative group p-4 sm:p-6 rounded-xl border-2 transition-all cursor-pointer ${selectedFieldId === field.id ? 'border-indigo-500 shadow-md bg-white/40 dark:bg-black/20 backdrop-blur-sm' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-white/20 dark:hover:bg-black/10'}`}
                  >
                    <div className={`absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity ${selectedFieldId === field.id ? 'opacity-100 text-indigo-400' : ''}`}>
                      <GripVertical size={20}/>
                    </div>

                    <div className="pl-6">
                      {field.type === 'section' ? (
                        <div className="border-b-2 pb-4 mt-6" style={{ borderColor: hexToRgba(t.inputBorderColor, 0.5) }}>
                          <h3 className="text-xl font-bold" style={{ color: t.headingColor }}>{field.label}</h3>
                          {field.description && <p className="text-sm mt-1" style={{ color: t.textColor }}>{field.description}</p>}
                        </div>
                      ) : (
                        <>
                          {field.type !== 'image' && field.type !== 'video' && (
                            <div className="font-semibold text-lg mb-2 flex items-center gap-2" style={{ color: t.labelColor }}>
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                            </div>
                          )}
                          {field.description && <p className="text-sm mb-4" style={{ color: t.textColor }}>{field.description}</p>}

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
                            </div>
                          )}

                          {field.type === 'rating' && <div className="flex gap-2 text-3xl" style={{ color: hexToRgba(t.textColor, 0.2) }}>★★★★★</div>}
                          {field.type === 'emoji' && <div className="flex gap-4 text-3xl opacity-50">😠 🙁 😐 🙂 🤩</div>}
                          {field.type === 'slider' && <div className="w-full h-2 rounded-full mt-4 bg-gray-200"><div className="w-1/2 h-full rounded-full" style={{ backgroundColor: t.buttonBgColor }}></div></div>}

                          {(field.type === 'date' || field.type === 'time') && (
                            <div className="w-1/2 p-3 border flex items-center gap-3 opacity-70" style={{ backgroundColor: t.inputBgColor, borderColor: t.inputBorderColor, color: t.inputTextColor, borderRadius: t.inputRadius }}>
                               {field.type === 'date' ? <Calendar size={18}/> : <Clock size={18}/>} <span>{field.type === 'date' ? 'MM/DD/YYYY' : 'HH:MM AM/PM'}</span>
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
                                  {field.type === 'image' ? <img src={field.url} alt="media" style={{ width: field.width, borderRadius: field.borderRadius }} className="inline-block shadow-sm" /> : <video src={field.url} controls style={{ width: field.width, borderRadius: field.borderRadius }} className="inline-block shadow-sm" />}
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

        {/* RIGHT: PROPERTIES & THEME & SETTINGS PANEL */}
        <div className="w-80 bg-white dark:bg-[#111113] border-l border-gray-200 dark:border-gray-800 flex flex-col shrink-0 overflow-y-auto shadow-lg z-20">
          <div className="flex border-b border-gray-200 dark:border-gray-800 shrink-0">
            <button onClick={() => setActiveRightTab('field')} className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1 border-b-2 ${activeRightTab === 'field' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <Settings size={14}/> Properties
            </button>
            <button onClick={() => setActiveRightTab('theme')} className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1 border-b-2 ${activeRightTab === 'theme' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <Palette size={14}/> Theme
            </button>
            <button onClick={() => setActiveRightTab('settings')} className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1 border-b-2 ${activeRightTab === 'settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <Globe size={14}/> Settings
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {activeRightTab === 'field' && selectedFieldId === 'header' && (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                 <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Form Details</h3>
                 <div><label className="block text-xs font-semibold text-gray-500 mb-1">Title</label><input type="text" className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
                 <div><label className="block text-xs font-semibold text-gray-500 mb-1">Description</label><textarea className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm min-h-[100px]" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
                 
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

                <div><label className="block text-xs font-semibold text-gray-500 mb-1">Label / Question</label><input type="text" className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-indigo-500" value={selectedField.label} onChange={e => updateField(selectedField.id, { label: e.target.value })} /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">Description (Optional)</label><input type="text" className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-indigo-500" value={selectedField.description || ''} onChange={e => updateField(selectedField.id, { description: e.target.value })} /></div>

                {['text', 'longtext', 'email', 'phone', 'number'].includes(selectedField.type) && (
                  <div><label className="block text-xs font-semibold text-gray-500 mb-1">Placeholder</label><input type="text" className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" value={selectedField.placeholder || ''} onChange={e => updateField(selectedField.id, { placeholder: e.target.value })} /></div>
                )}

                {['radio', 'checkbox', 'dropdown', 'quiz-mcq', 'quiz-multiselect'].includes(selectedField.type) && (
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

                {['rating', 'emoji', 'slider'].includes(selectedField.type) && (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Minimum</label>
                        <input type="number" className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-indigo-500" value={selectedField.min !== undefined ? selectedField.min : ''} onChange={e => updateField(selectedField.id, { min: e.target.value })} />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Maximum</label>
                        <input type="number" className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-indigo-500" value={selectedField.max !== undefined ? selectedField.max : ''} onChange={e => updateField(selectedField.id, { max: e.target.value })} />
                      </div>
                      {selectedField.type === 'slider' && (
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Step</label>
                          <input type="number" className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-indigo-500" value={selectedField.step !== undefined ? selectedField.step : ''} onChange={e => updateField(selectedField.id, { step: e.target.value })} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {['image', 'video'].includes(selectedField.type) && (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Upload {selectedField.type === 'image' ? 'Image/GIF' : 'Video'}</label>
                    <label className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 flex flex-col items-center justify-center rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <UploadCloud size={20} className="text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">{selectedField.url ? 'Change File' : 'Select File'}</span>
                      <input 
                        type="file" 
                        accept={selectedField.type === 'image' ? "image/*" : "video/*"} 
                        className="hidden" 
                        onChange={(e) => handleMediaUpload(e.target.files[0], selectedField.id)} 
                      />
                    </label>
                    {selectedField.url && (
                      <button onClick={() => updateField(selectedField.id, { url: '' })} className="mt-2 text-xs text-red-500 font-medium">Remove Media</button>
                    )}
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

            {activeRightTab === 'theme' && (
              <div className="space-y-6 pb-12 animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 tracking-wider">Background</label>
                    <select className="w-full bg-gray-50 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm outline-none dark:bg-[#0c0c0e] dark:text-white" value={t.backgroundType} onChange={e => updateTheme('backgroundType', e.target.value)}>
                      <option value="color">Solid Color</option>
                      <option value="gradient">Gradient</option>
                      <option value="image">Image</option>
                    </select>
                  </div>

                  {t.backgroundType === 'color' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                      <ColorPicker label="Custom Color" val={t.backgroundColor} onChange={v => updateTheme('backgroundColor', v)} />
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Presets</label>
                        <div className="grid grid-cols-5 gap-2">
                          {PRESET_COLORS.map((c, i) => (
                            <button
                              key={i}
                              onClick={() => updateTheme('backgroundColor', c)}
                              className={`w-full aspect-square rounded-lg border-2 transition-transform hover:scale-110 shadow-sm ${t.backgroundColor === c ? 'border-indigo-500 scale-110 z-10' : 'border-transparent'}`}
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {t.backgroundType === 'gradient' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Preset Gradients</label>
                        <div className="grid grid-cols-4 gap-2">
                          {PRESET_GRADIENTS.map((g, i) => (
                            <button
                              key={i}
                              onClick={() => updateTheme('backgroundGradient', g)}
                              className={`w-full aspect-[4/3] rounded-lg border-2 transition-transform hover:scale-110 shadow-sm ${t.backgroundGradient === g ? 'border-indigo-500 scale-110 z-10' : 'border-transparent'}`}
                              style={{ background: g }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 tracking-wider">Card Container</label>
                  <ColorPicker label="Card Color" val={t.cardColor} onChange={v => updateTheme('cardColor', v)} />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Layout:</span>
                    <select className="bg-gray-50 border p-1 rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white" value={t.layout || 'single'} onChange={e => updateTheme('layout', e.target.value)}>
                      <option value="single">Single Page</option><option value="multistep">Multi-Step</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeRightTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-3 tracking-wider">Form Type</label>
                  <select className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm outline-none dark:text-white mb-4" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="feedback">Feedback Form</option>
                    <option value="survey">Survey</option>
                    <option value="custom">Custom Form</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>
                {form.type === 'quiz' && (
                  <div className="pt-2 pb-4 border-b border-gray-100 dark:border-gray-800 space-y-4">
                    <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Quiz Settings</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Passing Score (%)</span>
                      <input type="number" className="w-20 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1.5 text-sm outline-none text-right" value={form.settings.passingScore || ''} onChange={e => updateSettings('passingScore', e.target.value)} placeholder="40" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Limit (mins)</span>
                      <input type="number" className="w-20 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1.5 text-sm outline-none text-right" value={form.settings.timeLimit || ''} onChange={e => updateSettings('timeLimit', e.target.value)} placeholder="0" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Attempts</span>
                      <input type="number" className="w-20 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1.5 text-sm outline-none text-right" value={form.settings.maxAttempts || ''} onChange={e => updateSettings('maxAttempts', e.target.value)} placeholder="1" />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" checked={form.settings.shuffleQuestions || false} onChange={e => updateSettings('shuffleQuestions', e.target.checked)} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Shuffle Questions</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" checked={form.settings.shuffleOptions || false} onChange={e => updateSettings('shuffleOptions', e.target.checked)} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Shuffle Options</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" checked={form.settings.showResult !== false} onChange={e => updateSettings('showResult', e.target.checked)} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Result to Student</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" checked={form.settings.showCorrectAnswers || false} onChange={e => updateSettings('showCorrectAnswers', e.target.checked)} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Correct Answers</span>
                    </label>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-3 tracking-wider">Form Status</label>
                  <select className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm outline-none dark:text-white" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="published">Published (Active)</option>
                    <option value="closed">Closed (No new responses)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Availability</label>
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">Start Date</span>
                    <input type="datetime-local" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm outline-none dark:text-gray-300" value={form.settings.startDate || ''} onChange={e => updateSettings('startDate', e.target.value)} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">End Date</span>
                    <input type="datetime-local" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm outline-none dark:text-gray-300" value={form.settings.endDate || ''} onChange={e => updateSettings('endDate', e.target.value)} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">Max Responses (Limits submission count)</span>
                    <input type="number" placeholder="Leave empty for unlimited" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm outline-none dark:text-gray-300" value={form.settings.maxResponses || ''} onChange={e => updateSettings('maxResponses', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Submission & Receipts</label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" checked={form.settings.allowAnonymous} onChange={e => updateSettings('allowAnonymous', e.target.checked)} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Anonymous</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" checked={form.settings.showReceipt} onChange={e => updateSettings('showReceipt', e.target.checked)} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Issue Submission Receipt</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" checked={form.settings.showQrVerification} onChange={e => updateSettings('showQrVerification', e.target.checked)} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add QR Verification to Receipt</span>
                  </label>
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

