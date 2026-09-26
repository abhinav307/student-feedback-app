import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Settings, Eye, Trash, Moon, Sun, Copy, ExternalLink, Inbox, CheckCircle, BarChart3, TrendingUp, Users, Star, ArrowRight, FileText, HelpCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

export default function Dashboard({ token }) {
  const [forms, setForms] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [days]);

  const fetchDashboardData = async () => {
    try {
      const [formsRes, analyticsRes] = await Promise.all([
        api.get('/forms'),
        api.get(`/analytics/dashboard?days=${days}`)
      ]);
      setForms(formsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (id) => {
    if (!confirm('Are you sure you want to delete this form?')) return;
    try {
      await api.delete(`/forms/${id}`);
      fetchDashboardData();
    } catch (err) {
      alert('Error deleting form');
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const hasResponses = analytics?.totalResponses > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your forms today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={days} 
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>

          <Link to="/builder" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-md hover:shadow-lg">
            <Plus size={18} /> Create Form
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shrink-0">
              <Inbox size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Forms</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.totalForms || 0}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Responses</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.totalResponses || 0}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shrink-0">
              <Star size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Average Rating</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.averageRating || '0.0'}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center shrink-0">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Conversion Rate</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">--%</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Response Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Response Trend</h2>
          <div className="flex-1 min-h-[300px] flex items-center justify-center">
            {!hasResponses ? (
              <div className="text-center flex flex-col items-center opacity-60">
                <BarChart3 size={48} className="text-gray-400 mb-3" />
                <p className="text-gray-500 font-medium">No response data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.trend}>
                  <defs>
                    <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                    dy={10}
                    tickFormatter={(str) => {
                      const date = new Date(str);
                      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="responses" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorResponses)" activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Forms */}
        <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Performing Forms</h2>
          <div className="flex-1 flex flex-col">
            {!hasResponses ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-60">
                <FileText size={40} className="text-gray-400 mb-3" />
                <p className="text-gray-500 font-medium text-sm">Publish forms to see metrics</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics?.topForms?.map((form, index) => (
                  <Link to={`/analytics/${form.id}`} key={form.id} className="block group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white truncate max-w-[180px] group-hover:text-indigo-600 transition">{form.title}</span>
                      <span className="font-bold text-sm text-gray-500">{form.count} res</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.max(5, (form.count / analytics.totalResponses) * 100)}%` }}
                      ></div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forms List Table */}
      <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Forms</h2>
          
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/20 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">
                <th className="p-4 pl-6">Form Name</th>
                <th className="p-4">Status</th>
                <th className="p-4">Responses</th>
                <th className="p-4">Created</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {forms.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">
                    You haven't created any forms yet.
                  </td>
                </tr>
              ) : (
                forms.map(form => (
                  <tr key={form._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition">
                    <td className="p-4 pl-6 font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        {form.type === 'quiz' ? <HelpCircle size={18} className="text-indigo-500" /> : <FileText size={18} className="text-emerald-500" />}
                      </div>
                      <span className="truncate max-w-[200px]">{form.title || 'Untitled Form'}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        form.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        form.status === 'closed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {form.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-gray-700 dark:text-gray-300">
                      {form.responseCount || 0}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(form.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {form.status === 'published' && (
                          <a href={`/form/${form.publicId}`} target="_blank" className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition tooltip-trigger" title="View live">
                            <ExternalLink size={18} />
                          </a>
                        )}
                        <Link to={`/responses/${form._id}`} className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition" title="Responses">
                          <Eye size={18} />
                        </Link>
                        <Link to={`/analytics/${form._id}`} className="p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition" title="Analytics">
                          <BarChart3 size={18} />
                        </Link>
                        <Link to={`/builder/${form._id}`} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition" title="Edit">
                          <Settings size={18} />
                        </Link>
                        <button onClick={() => deleteForm(form._id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition" title="Delete">
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
