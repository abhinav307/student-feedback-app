import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, Users, Link as LinkIcon, Trash2, 
  Plus, MoreVertical, ExternalLink, BarChart2, Edit3, MessageSquare
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ token }) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/forms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForms(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (id) => {
    if(!window.confirm('Delete this form permanently?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/forms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchForms();
    } catch (err) { console.error(err); }
  };

  const copyToClipboard = (publicId) => {
    navigator.clipboard.writeText(`${window.location.origin}/form/${publicId}`);
    // Toast notification logic could go here
    alert("Link copied to clipboard!");
  };

  // Real data calculations
  const totalForms = forms.length;
  const activeForms = forms.filter(f => f.status === 'published').length;
  const totalResponses = forms.reduce((acc, f) => acc + (f.responseCount || 0), 0);
  
  // Real chart data generation based on forms (Using response counts by form name for visualization)
  const chartData = forms.map(f => ({
    name: f.title.length > 15 ? f.title.substring(0, 15) + '...' : f.title,
    responses: f.responseCount || 0
  }));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {getGreeting()}, Manager
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Here's what's happening with your forms today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Forms" value={loading ? '-' : totalForms} icon={FileText} color="blue" />
        <StatCard title="Active Forms" value={loading ? '-' : activeForms} icon={FileText} color="emerald" />
        <StatCard title="Total Responses" value={loading ? '-' : totalResponses} icon={Users} color="indigo" />
        <StatCard title="Avg. Rating" value={loading ? '-' : 'N/A'} icon={BarChart2} color="amber" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        
        {/* Chart Section */}
        <div className="xl:col-span-2 bg-white dark:bg-[#111113] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Response Overview</h2>
          <div className="flex-1 min-h-[250px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-pulse flex gap-2"><div className="w-2 h-2 bg-indigo-500 rounded-full"></div><div className="w-2 h-2 bg-indigo-500 rounded-full animation-delay-150"></div><div className="w-2 h-2 bg-indigo-500 rounded-full animation-delay-300"></div></div>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="responses" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorResponses)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-[#111113] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <QuickActionBtn 
              title="Create Feedback Form" 
              desc="Start gathering student feedback" 
              icon={MessageSquare} 
              onClick={() => navigate('/builder')} 
            />
            <QuickActionBtn 
              title="Create Quiz" 
              desc="Assess student knowledge" 
              icon={FileText} 
              onClick={() => navigate('/builder')} 
            />
            <QuickActionBtn 
              title="Create Survey" 
              desc="Gather general insights" 
              icon={BarChart2} 
              onClick={() => navigate('/builder')} 
            />
          </div>
        </div>
      </div>

      {/* Forms Table / Cards Section */}
      <div className="bg-white dark:bg-[#111113] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Forms</h2>
          <button onClick={() => navigate('/builder')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center gap-1 transition-colors">
            View All <Plus size={16}/>
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center"><div className="animate-pulse flex gap-2 justify-center"><div className="w-2 h-2 bg-indigo-500 rounded-full"></div><div className="w-2 h-2 bg-indigo-500 rounded-full animation-delay-150"></div></div></div>
        ) : forms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/30 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="px-6 py-4 font-medium">Form Name</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Responses</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {forms.map(form => (
                  <tr key={form._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{form.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{new Date(form.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 capitalize">
                        {form.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
                        form.status === 'published' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${form.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {form.status === 'published' ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-gray-300">
                        <Users size={14} className="text-gray-400" />
                        {form.responseCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ActionBtn icon={LinkIcon} tooltip="Copy Link" onClick={() => copyToClipboard(form.publicId)} />
                        <ActionBtn icon={ExternalLink} tooltip="Preview" onClick={() => window.open(`/form/${form.publicId}`, '_blank')} />
                        <ActionBtn icon={Edit3} tooltip="Edit" onClick={() => navigate(`/builder/${form._id}`)} />
                        <ActionBtn icon={Trash2} tooltip="Delete" onClick={() => deleteForm(form._id)} danger />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <FileText size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No forms yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
              Create your first form and start collecting responses in minutes.
            </p>
            <button 
              onClick={() => navigate('/builder')}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus size={18} /> Create Form
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Subcomponents for cleaner code

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
  };

  return (
    <div className="bg-white dark:bg-[#111113] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}

function QuickActionBtn({ title, desc, icon: Icon, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all text-left group"
    >
      <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-white dark:group-hover:bg-gray-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shadow-sm border border-gray-100 dark:border-gray-700">
        <Icon size={18} />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
      </div>
    </button>
  );
}

function ActionBtn({ icon: Icon, onClick, tooltip, danger }) {
  return (
    <button 
      onClick={onClick}
      title={tooltip}
      className={`p-2 rounded-lg transition-colors ${
        danger 
          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' 
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
      }`}
    >
      <Icon size={16} />
    </button>
  );
}

function EmptyChartState() {
  return (
    <div className="w-full h-full min-h-[250px] flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
      <BarChart2 size={24} className="text-gray-300 dark:text-gray-700 mb-2" />
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No response data yet</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Publish a form to start seeing analytics here.</p>
    </div>
  );
}