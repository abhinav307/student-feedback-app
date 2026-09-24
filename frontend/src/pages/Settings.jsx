import { useState } from 'react';
import { Save, User, Shield, Bell, Moon, Sun } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
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
        <div className="flex-1 bg-white dark:bg-[#111113] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8">
          
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">Public Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization Name</label>
                  <input type="text" defaultValue="Acme Corp" className="w-full max-w-md p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                  <input type="email" defaultValue="admin@acme.com" className="w-full max-w-md p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white transition" />
                </div>
              </div>
              <div className="pt-4 flex items-center gap-4">
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition">Save Changes</button>
                {saved && <span className="text-emerald-500 font-medium text-sm flex items-center gap-1"><CheckCircle2 size={16}/> Saved!</span>}
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleSave} className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full max-w-md p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full max-w-md p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white transition" />
                </div>
              </div>
              <div className="pt-4 flex items-center gap-4">
                <button type="submit" className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl font-bold shadow-sm transition">Update Security</button>
                {saved && <span className="text-emerald-500 font-medium text-sm">Updated!</span>}
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">Alert Preferences</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 border border-gray-100 dark:border-gray-800 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                  <div>
                    <span className="block font-semibold text-gray-900 dark:text-white">New Submission Alerts</span>
                    <span className="text-sm text-gray-500">Receive an email every time a form is submitted.</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-100 dark:border-gray-800 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                  <div>
                    <span className="block font-semibold text-gray-900 dark:text-white">Weekly Digest</span>
                    <span className="text-sm text-gray-500">Receive a weekly summary of your analytics.</span>
                  </div>
                </label>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Quick helper
function CheckCircle2(props) {
  return <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
