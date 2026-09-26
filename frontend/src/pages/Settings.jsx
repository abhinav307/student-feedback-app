import { useState, useEffect, useRef, useCallback } from 'react';
import { Save, User, Shield, Bell, Edit2, X, Globe, Link2, MapPin, Building, Phone, Clock, Camera, Upload } from 'lucide-react';
import { FaGithub, FaLinkedin, FaMediumM, FaInstagram, FaFacebook, FaYoutube, FaSnapchatGhost, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiHuggingface } from 'react-icons/si';
import { useOutletContext } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import api from '../services/api';
import { getCroppedImg } from '../utils/cropImage';
import SecurityTab from '../components/SecurityTab';
import NotificationsTab from '../components/NotificationsTab';

const socialConfig = {
  professional: [
    { id: 'github', label: 'GitHub', icon: FaGithub, prefix: 'https://github.com/' },
    { id: 'linkedin', label: 'LinkedIn', icon: FaLinkedin, prefix: 'https://linkedin.com/in/' },
    { id: 'x', label: 'X', icon: FaXTwitter, prefix: 'https://x.com/' },
    { id: 'medium', label: 'Medium', icon: FaMediumM, prefix: 'https://medium.com/@' },
    { id: 'huggingFace', label: 'Hugging Face', icon: SiHuggingface, prefix: 'https://huggingface.co/' }
  ],
  personal: [
    { id: 'instagram', label: 'Instagram', icon: FaInstagram, prefix: 'https://instagram.com/' },
    { id: 'facebook', label: 'Facebook', icon: FaFacebook, prefix: 'https://facebook.com/' },
    { id: 'snapchat', label: 'Snapchat', icon: FaSnapchatGhost, prefix: 'https://snapchat.com/add/' },
    { id: 'youtube', label: 'YouTube', icon: FaYoutube, prefix: 'https://youtube.com/@' },
    { id: 'tiktok', label: 'TikTok', icon: FaTiktok, prefix: 'https://tiktok.com/@' }
  ]
};

export default function Settings() {
  const { user, setUser } = useOutletContext();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({});

  // Cropper State
  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        name: user.name || '',
        avatar: user.avatar || '',
        displayName: user.displayName || '',
        email: user.email || '',
        phone: user.phone || '',
        organization: user.organization || '',
        location: user.location || '',
        country: user.country || '',
        about: user.about || '',
        website: user.website || '',
        language: user.language || 'English',
        timezone: user.timezone || 'UTC',
        socialProfiles: {
          github: user.socialProfiles?.github || '',
          linkedin: user.socialProfiles?.linkedin || '',
          x: user.socialProfiles?.x || '',
          medium: user.socialProfiles?.medium || '',
          huggingFace: user.socialProfiles?.huggingFace || '',
          instagram: user.socialProfiles?.instagram || '',
          facebook: user.socialProfiles?.facebook || '',
          snapchat: user.socialProfiles?.snapchat || '',
          youtube: user.socialProfiles?.youtube || '',
          tiktok: user.socialProfiles?.tiktok || '',
        }
      });
    }
  }, [user, isEditing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocialChange = (id, value) => {
    setFormData({
      ...formData,
      socialProfiles: { ...formData.socialProfiles, [id]: value }
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSaved(false);
    try {
      const res = await api.put('/auth/profile', formData);
      setUser(res.data);
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError('');
  };

  const hasAnySocial = (type) => {
    if (!formData.socialProfiles) return false;
    return socialConfig[type].some(platform => formData.socialProfiles[platform.id]?.trim() !== '');
  };

  // Image Upload Handlers
  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result));
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const saveCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      setFormData(prev => ({ ...prev, avatar: croppedImage }));
      setImageSrc(null); // Close modal
    } catch (e) {
      console.error(e);
      setError('Failed to crop image');
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-300 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workspace Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col space-y-1">
            <button 
              onClick={() => setActiveTab('profile')} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
            >
              <User size={18}/> Profile
            </button>
            <button 
              onClick={() => setActiveTab('security')} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
            >
              <Shield size={18}/> Security
            </button>
            <button 
              onClick={() => setActiveTab('notifications')} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'notifications' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
            >
              <Bell size={18}/> Notifications
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-[#111113] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 relative">
          
          {saved && (
            <div className="absolute top-4 right-4 z-50 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 size={16} />
              Profile updated successfully.
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-8 relative">
              
              {/* Header section */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-gray-100 dark:border-gray-800 pb-6">
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 rounded-full shadow-md overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 group">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {(formData.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    {/* Hover Overlay for Edit Mode */}
                    {isEditing && (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                      >
                        <Camera size={20} />
                        <span className="text-[10px] font-medium mt-1">Change</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{formData.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{formData.displayName || 'Set a display name'}</p>
                    <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mt-1">{formData.email}</p>
                  </div>
                  
                  {/* Hidden File Input */}
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={onFileChange} className="hidden" />
                </div>
                
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-xl transition shadow-sm text-sm">
                    <Edit2 size={16} />
                    Edit Profile
                  </button>
                )}
              </div>

              {/* READ ONLY MODE */}
              {!isEditing ? (
                <div className="space-y-8 animate-in fade-in">
                  
                  {/* Basic Info Grid */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                      <ProfileField icon={Phone} label="Phone Number" value={formData.phone} />
                      <ProfileField icon={Building} label="Organization" value={formData.organization} />
                      <ProfileField icon={MapPin} label="Location" value={formData.location} />
                      <ProfileField icon={Globe} label="Country" value={formData.country} />
                      <ProfileField icon={Globe} label="Language" value={formData.language} />
                      <ProfileField icon={Clock} label="Time Zone" value={formData.timezone} />
                      <ProfileField icon={Link2} label="Website" value={formData.website} isLink />
                    </div>
                  </div>

                  {formData.about && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">About Me</h3>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        {formData.about}
                      </p>
                    </div>
                  )}

                  {/* Social Profiles Display */}
                  {(hasAnySocial('professional') || hasAnySocial('personal')) && (
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Social Profiles</h3>
                      
                      {hasAnySocial('professional') && (
                        <div className="mb-6">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Professional</h4>
                          <div className="flex flex-wrap gap-3">
                            {socialConfig.professional.map(platform => {
                              const url = formData.socialProfiles?.[platform.id];
                              if (!url) return null;
                              return <SocialIcon key={platform.id} Icon={platform.icon} url={url} label={platform.label} />;
                            })}
                          </div>
                        </div>
                      )}

                      {hasAnySocial('personal') && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal & Social</h4>
                          <div className="flex flex-wrap gap-3">
                            {socialConfig.personal.map(platform => {
                              const url = formData.socialProfiles?.[platform.id];
                              if (!url) return null;
                              return <SocialIcon key={platform.id} Icon={platform.icon} url={url} label={platform.label} />;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* EDIT MODE */
                <form onSubmit={handleSaveProfile} className="space-y-8 animate-in fade-in">
                  
                  {error && <div className="p-4 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-xl text-sm font-medium">{error}</div>}

                  <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                      <Input label="Display Name" name="displayName" value={formData.displayName} onChange={handleChange} placeholder="What should we call you?" />
                      <Input label="Email Address" name="email" value={formData.email} onChange={handleChange} type="email" required />
                      <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} type="tel" />
                      <Input label="Organization / Institution" name="organization" value={formData.organization} onChange={handleChange} />
                      <Input label="Location (City/State)" name="location" value={formData.location} onChange={handleChange} />
                      <Input label="Country" name="country" value={formData.country} onChange={handleChange} />
                      <Input label="Website" name="website" value={formData.website} onChange={handleChange} type="url" placeholder="https://" />
                      <Input label="Preferred Language" name="language" value={formData.language} onChange={handleChange} />
                      <Input label="Time Zone" name="timezone" value={formData.timezone} onChange={handleChange} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">About Me</label>
                    <textarea 
                      name="about" 
                      value={formData.about} 
                      onChange={handleChange} 
                      rows={4}
                      placeholder="Share a little bit about yourself..."
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white transition text-sm resize-none" 
                    />
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Social Profiles</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-3">Professional</h4>
                        <div className="space-y-3">
                          {socialConfig.professional.map(platform => (
                            <SocialInput key={platform.id} platform={platform} value={formData.socialProfiles?.[platform.id] || ''} onChange={(val) => handleSocialChange(platform.id, val)} />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-3">Personal & Social</h4>
                        <div className="space-y-3">
                          {socialConfig.personal.map(platform => (
                            <SocialInput key={platform.id} platform={platform} value={formData.socialProfiles?.[platform.id] || ''} onChange={(val) => handleSocialChange(platform.id, val)} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <button type="submit" disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-md transition flex items-center gap-2">
                      <Save size={18} />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={cancelEdit} disabled={loading} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition flex items-center gap-2">
                      <X size={18} />
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <SecurityTab />
          )}

          {activeTab === 'notifications' && (<NotificationsTab />)}
          </div>
      </div>

      {/* Cropper Modal */}
      {imageSrc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111113] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-lg dark:text-white">Crop Profile Picture</h3>
              <button onClick={() => setImageSrc(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">
                <X size={20} />
              </button>
            </div>
            
            <div className="relative w-full h-[300px] bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full accent-indigo-600"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setImageSrc(null)} className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition">
                  Cancel
                </button>
                <button onClick={saveCroppedImage} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition">
                  Apply & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


/* Helper Components */

function ProfileField({ icon: Icon, label, value, isLink = false }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
        <Icon size={14} className="opacity-70"/> {label}
      </p>
      {isLink ? (
        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
          {value}
        </a>
      ) : (
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
      )}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <input 
        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white transition text-sm" 
        {...props} 
      />
    </div>
  );
}

function SocialInput({ platform, value, onChange }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm shrink-0 text-gray-700 dark:text-gray-300">
        <platform.icon size={18} />
      </div>
      <div className="flex-1 flex items-center bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden focus-within:border-indigo-500 transition">
        <span className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 border-r border-gray-200 dark:border-gray-700 select-none hidden sm:block">
          {platform.prefix}
        </span>
        <input 
          type="url" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder={`Enter your ${platform.label} URL...`}
          className="flex-1 w-full p-2 bg-transparent outline-none dark:text-white text-sm"
        />
      </div>
    </div>
  );
}

function SocialIcon({ Icon, url, label }) {
  return (
    <a 
      href={url.startsWith('http') ? url : `https://${url}`} 
      target="_blank" 
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="group relative w-12 h-12 rounded-2xl bg-gray-50 hover:bg-indigo-50 dark:bg-gray-900 dark:hover:bg-indigo-900/30 flex items-center justify-center text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-all shadow-sm hover:shadow hover:scale-105 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800"
    >
      <Icon size={20} className="transition-transform group-hover:scale-110" />
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
        {label}
      </span>
    </a>
  );
}

function CheckCircle2(props) {
  return <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
