import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Filter, MessageSquare, AlertCircle, BarChart3, TrendingUp, Users, Star, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie, Legend } from 'recharts';
import html2pdf from 'html2pdf.js';

const COLORS = ['#4f46e5', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#8b5cf6'];

export default function FormAnalytics({ token }) {
  const { formId } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [daysFilter, setDaysFilter] = useState('30');
  const reportRef = useRef();

  useEffect(() => {
    fetchAnalytics();
  }, [formId, token, daysFilter]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/analytics/form/${formId}?days=${daysFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      setError('Error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    const element = reportRef.current;
    html2pdf().from(element).set({
      margin: 0.5,
      filename: `Analytics_${formId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).save();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (error) return <div className="text-center mt-20 text-red-500 font-bold">{error}</div>;
  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] transition-colors duration-300 pb-20">
      <nav className="border-b bg-white dark:bg-[#111113] dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"><ArrowLeft size={20}/></Link>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Analytics Report</span>
          </div>
          <div className="flex items-center gap-4">
            <select className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 outline-none" value={daysFilter} onChange={e => setDaysFilter(e.target.value)}>
               <option value="7">Last 7 days</option>
               <option value="30">Last 30 days</option>
               <option value="90">Last 90 days</option>
               <option value="all">All time</option>
            </select>
            <button onClick={downloadReport} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition">
              <Download size={16}/> Download PDF
            </button>
          </div>
        </div>
      </nav>

      {stats.totalResponses === 0 ? (
        <div className="max-w-4xl mx-auto mt-20 text-center bg-white dark:bg-[#111113] p-12 rounded-3xl border border-gray-200 dark:border-gray-800">
           <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No analytics available yet</h2>
           <p className="text-gray-500">Wait for responses to come in to see charts and insights here.</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8" ref={reportRef}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-[#111113] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
               <div className="flex items-center gap-3 mb-3"><div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg"><Users size={20}/></div><h3 className="text-sm font-semibold text-gray-500">Total Responses</h3></div>
               <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalResponses}</p>
            </div>
            <div className="bg-white dark:bg-[#111113] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
               <div className="flex items-center gap-3 mb-3"><div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg"><Star size={20}/></div><h3 className="text-sm font-semibold text-gray-500">Avg Rating</h3></div>
               <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.averageRating || 'N/A'}</p>
            </div>
            <div className="bg-white dark:bg-[#111113] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
               <div className="flex items-center gap-3 mb-3"><div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg"><TrendingUp size={20}/></div><h3 className="text-sm font-semibold text-gray-500">Completion Rate</h3></div>
               <p className="text-3xl font-bold text-gray-900 dark:text-white">100%</p>
            </div>
            <div className="bg-white dark:bg-[#111113] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
               <div className="flex items-center gap-3 mb-3"><div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-lg"><Clock size={20}/></div><h3 className="text-sm font-semibold text-gray-500">Latest Response</h3></div>
               <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{stats.latestResponse ? new Date(stats.latestResponse).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111113] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm h-80 mb-8">
             <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><BarChart3 size={18} className="text-indigo-500"/> Response Trend</h3>
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={stats.trend}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                 <XAxis dataKey="date" stroke="#6b7280" tick={{fontSize: 12}} tickMargin={10} minTickGap={30} />
                 <YAxis allowDecimals={false} stroke="#6b7280" tick={{fontSize: 12}} />
                 <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                 <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
               </LineChart>
             </ResponsiveContainer>
          </div>

            {stats.quizStats && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 size={20} className="text-indigo-500"/> Quiz Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-[#111113] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                     <p className="text-sm font-semibold text-gray-500 mb-2">Average Score</p>
                     <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.quizStats.averagePercentage}%</p>
                  </div>
                  <div className="bg-white dark:bg-[#111113] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                     <p className="text-sm font-semibold text-gray-500 mb-2">Pass Rate</p>
                     <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.quizStats.passPercentage}%</p>
                  </div>
                  <div className="bg-white dark:bg-[#111113] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                     <p className="text-sm font-semibold text-gray-500 mb-2">Highest Score</p>
                     <p className="text-3xl font-bold text-emerald-500">{stats.quizStats.highestScore}%</p>
                  </div>
                  <div className="bg-white dark:bg-[#111113] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                     <p className="text-sm font-semibold text-gray-500 mb-2">Lowest Score</p>
                     <p className="text-3xl font-bold text-rose-500">{stats.quizStats.lowestScore}%</p>
                  </div>
                </div>
              </div>
            )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {Object.entries(stats.fields).map(([fieldId, field]) => {
                const isChoice = ['radio', 'dropdown', 'checkbox', 'yesno'].includes(field.type);
                const isRating = ['rating', 'emoji'].includes(field.type);
                const isText = ['text', 'longtext'].includes(field.type);
                const isNumber = ['number', 'slider'].includes(field.type);
                
                let chartData = [];
                if (isChoice || isRating) {
                  chartData = Object.keys(field.data).map(key => ({ name: key, count: field.data[key] }));
                }

                return (
                  <div key={fieldId} className="bg-white dark:bg-[#111113] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
                     <div className="mb-4">
                       <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">{field.label}</h3>
                       <p className="text-sm text-gray-500 mt-1">{field.answered} answered • {field.skipped} skipped</p>
                     </div>

                     {isChoice && (
                        <div className="h-64 mt-auto">
                           <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                               <Pie data={chartData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                 {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                               </Pie>
                               <Tooltip />
                               <Legend />
                             </PieChart>
                           </ResponsiveContainer>
                        </div>
                     )}

                     {isRating && (
                        <div className="h-64 mt-auto">
                           <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={chartData}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
                               <XAxis dataKey="name" tickFormatter={v => `${v} ★`} />
                               <YAxis allowDecimals={false} />
                               <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                               <Bar dataKey="count" fill="#fbbf24" radius={[4,4,0,0]} />
                             </BarChart>
                           </ResponsiveContainer>
                        </div>
                     )}

                     {isNumber && (
                        <div className="mt-auto flex flex-col gap-4">
                           <div className="grid grid-cols-3 gap-4 text-center">
                             <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                <p className="text-sm text-gray-500 font-semibold mb-1">Average</p>
                                <p className="text-2xl font-bold text-indigo-600">{field.average || 0}</p>
                             </div>
                             <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                <p className="text-sm text-gray-500 font-semibold mb-1">Lowest</p>
                                <p className="text-2xl font-bold text-red-500">{field.min !== null ? field.min : '-'}</p>
                             </div>
                             <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                <p className="text-sm text-gray-500 font-semibold mb-1">Highest</p>
                                <p className="text-2xl font-bold text-emerald-500">{field.max !== null ? field.max : '-'}</p>
                             </div>
                           </div>
                        </div>
                     )}

                     {isText && (
                        <div className="mt-auto space-y-3 h-64 overflow-y-auto pr-2">
                           {field.recent.length === 0 ? (
                             <p className="text-gray-400 italic text-sm">No text responses yet.</p>
                           ) : (
                             field.recent.map((r, i) => (
                               <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300">
                                 <div className="flex items-center gap-2 mb-1 opacity-50 text-xs">
                                   <MessageSquare size={12}/> {new Date(r.date).toLocaleDateString()}
                                 </div>
                                 <p className="whitespace-pre-wrap">{r.text}</p>
                               </div>
                             ))
                           )}
                        </div>
                     )}
                  </div>
                );
             })}
          </div>

        </div>
      )}
    </div>
  );
}
