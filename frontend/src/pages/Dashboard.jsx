import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Settings, Eye, Trash, Moon, Sun, Copy, ExternalLink, Inbox, CheckCircle, BarChart3, TrendingUp, Users, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard({ token, setToken }) {
  const [forms, setForms] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      // Fetch Forms
      const formsRes = await axios.get('http://localhost:5000/api/forms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForms(formsRes.data);
      
      // Fetch Global Analytics
      const analyticsRes = await axios.get('http://localhost:5000/api/analytics/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(analyticsRes.data);
    } catch (error) {
      if (error.response?.status === 401) setToken('');
    }
  };

  const deleteForm = async (id) => {
    if (!window.confirm('Are you sure you want to delete this form and all its responses?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/forms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Error deleting form');
    }
  };

  const copyLink = (publicId) => {
    const url = `${window.location.origin}/form/${publicId}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-[#0a0a0b]' : 'bg-gray-50'}`}>
      
      <nav className="border-b bg-white dark:bg-[#111113] dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Formify</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-800"></div>
            <button onClick={() => setToken('')} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Global Analytics Preview */}
        {analytics && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white dark:bg-[#111113] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                 <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Users size={20}/></div>
                   <h3 className="text-sm font-semibold text-gray-500">Total Responses</h3>
                 </div>
                 <p className="text-4xl font-extrabold text-gray-900 dark:text-white">{analytics.totalResponses}</p>
              </div>
              <div className="bg-white dark:bg-[#111113] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                 <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><Star size={20}/></div>
                   <h3 className="text-sm font-semibold text-gray-500">Average Rating</h3>
                 </div>
                 <p className="text-4xl font-extrabold text-gray-900 dark:text-white">{analytics.averageRating} <span className="text-lg text-gray-400 font-medium">/ 5.0</span></p>
              </div>
              <div className="bg-white dark:bg-[#111113] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                 <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><TrendingUp size={20}/></div>
                   <h3 className="text-sm font-semibold text-gray-500">Total Forms</h3>
                 </div>
                 <p className="text-4xl font-extrabold text-gray-900 dark:text-white">{analytics.totalForms}</p>
              </div>
            </div>

            {/* Global Trend Chart */}
            <div className="bg-white dark:bg-[#111113] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm h-72 w-full">
               <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Responses (Last 30 Days)</h3>
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={analytics.trend}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#374151' : '#e5e7eb'} />
                   <XAxis dataKey="date" stroke={darkMode ? '#9ca3af' : '#6b7280'} tick={{fontSize: 12}} tickMargin={10} minTickGap={30} />
                   <YAxis allowDecimals={false} stroke={darkMode ? '#9ca3af' : '#6b7280'} tick={{fontSize: 12}} />
                   <Tooltip contentStyle={{backgroundColor: darkMode ? '#1f2937' : '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                   <Line type="monotone" dataKey="responses" stroke="#4f46e5" strokeWidth={3} dot={false} activeDot={{r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2}} />
                 </LineChart>
               </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Forms</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage, analyze, and share your created forms.</p>
          </div>
          <Link to="/builder" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-sm">
            <Plus size={20} /> <span className="hidden sm:inline">Create Form</span>
          </Link>
        </div>

        {forms.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#111113] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No forms yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Get started by creating your first form. It only takes a few seconds.</p>
            <Link to="/builder" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-sm">
              Create your first form
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map(form => (
              <div key={form._id} className="bg-white dark:bg-[#111113] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden group">
                
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${form.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {form.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-400 flex items-center gap-1">
                      <Inbox size={14}/> {form.responseCount || 0}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {form.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                    {form.description}
                  </p>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/builder/${form._id}`)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all" title="Edit">
                      <Settings size={18} />
                    </button>
                    <button onClick={() => navigate(`/responses/${form._id}`)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all" title="Responses">
                      <Inbox size={18} />
                    </button>
                    <button onClick={() => navigate(`/analytics/${form._id}`)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all" title="Analytics">
                      <BarChart3 size={18} />
                    </button>
                    {form.status === 'published' && (
                      <button onClick={() => copyLink(form.publicId)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all" title="Copy Link">
                        <Copy size={18} />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {form.status === 'published' && (
                      <a href={`/form/${form.publicId}`} target="_blank" rel="noreferrer" className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all" title="View Live">
                        <ExternalLink size={18} />
                      </a>
                    )}
                    <button onClick={() => deleteForm(form._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all" title="Delete">
                      <Trash size={18} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
