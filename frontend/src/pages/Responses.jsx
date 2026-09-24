import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Inbox, Clock, User, FileText, ChevronLeft, ChevronRight,
  Search, Download, Trash2, Eye, Filter, RefreshCw, X
} from 'lucide-react';

export default function Responses({ token }) {
  const { formId } = useParams();
  
  const [data, setData] = useState({ form: {}, responses: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Table Controls
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Modal
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    fetchResponses();
  }, [formId, page, sortField, sortOrder]);

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/responses/form/${formId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 10, search, sort: sortField, order: sortOrder }
      });
      setData(res.data);
      setSelectedIds([]); // Clear selection on fetch
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching responses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page
    fetchResponses();
  };

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedIds.length === data.responses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.responses.map(r => r._id));
    }
  };

  const deleteResponse = async (id) => {
    if (!window.confirm('Delete this response permanently?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/responses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Response deleted');
      fetchResponses();
    } catch (err) {
      alert('Error deleting response');
    }
  };

  const bulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} responses permanently?`)) return;
    
    try {
      await axios.post(`http://localhost:5000/api/responses/bulk-delete`, {
        formId,
        ids: selectedIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(`${selectedIds.length} responses deleted`);
      fetchResponses();
    } catch (err) {
      alert('Error deleting responses');
    }
  };

  const exportCSV = async (exportSelected = false) => {
    try {
      // If we only want selected, we can filter current page data
      // Otherwise, we hit the export endpoint to get all
      let responsesToExport = [];
      if (exportSelected && selectedIds.length > 0) {
        responsesToExport = data.responses.filter(r => selectedIds.includes(r._id));
      } else {
        const res = await axios.get(`http://localhost:5000/api/responses/export/${formId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        responsesToExport = res.data;
      }
      
      if (!responsesToExport.length) return alert('No data to export');

      // Extract all unique field headers from all responses dynamically
      const dynamicFields = new Set();
      responsesToExport.forEach(r => {
        r.answers.forEach(a => dynamicFields.add(a.fieldLabel));
      });
      const headerLabels = Array.from(dynamicFields);

      // Standard headers
      const csvRows = [];
      csvRows.push(['Submission ID', 'Student Name', 'Email', 'Course', 'Branch', 'Semester', 'Date Submitted', ...headerLabels].join(','));

      responsesToExport.forEach(r => {
        const row = [
          `"${r.submissionId}"`,
          `"${r.studentName}"`,
          `"${r.email}"`,
          `"${r.course}"`,
          `"${r.branch}"`,
          `"${r.semester}"`,
          `"${new Date(r.createdAt).toLocaleString()}"`
        ];
        
        // Match dynamic answers to columns
        headerLabels.forEach(label => {
          const ans = r.answers.find(a => a.fieldLabel === label);
          let val = ans ? (ans.value || '') : '';
          val = String(val).replace(/"/g, '""'); // escape quotes
          row.push(`"${val}"`);
        });

        csvRows.push(row.join(','));
      });

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `${data.form.title || 'Form'}_Responses.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Export successful');
    } catch (err) {
      alert('Error exporting data');
    }
  };

  if (loading && data.responses.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="text-gray-500 font-medium">Loading responses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center mt-20">
        <div className="inline-block p-6 bg-red-50 text-red-600 rounded-xl border border-red-100 shadow-sm">
          <h2 className="text-lg font-bold mb-2">Error Loading Data</h2>
          <p>{error}</p>
          <div className="mt-4">
            <Link to="/" className="text-indigo-600 font-semibold hover:underline bg-white px-4 py-2 rounded-lg inline-block">← Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-500 p-4 sm:p-6 lg:p-8">
      
      {/* Toasts */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl z-50 animate-in slide-in-from-bottom-5 font-medium flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          {toastMsg}
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white dark:bg-[#111113] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{data.form?.title || 'Form Responses'}</h1>
            <p className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              {data.total} real-time response{data.total !== 1 && 's'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => fetchResponses()} className="p-2.5 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Refresh">
            <RefreshCw size={18} className={loading ? "animate-spin text-indigo-500" : ""} />
          </button>
          <button onClick={() => exportCSV(false)} className="px-4 py-2.5 text-sm font-semibold bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl hover:scale-105 transition-transform flex items-center gap-2 shadow-lg">
            <Download size={16} /> Export All (CSV)
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, email, course, or ID..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 dark:text-white shadow-sm transition-colors text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        {/* Filters / Sort / Bulk Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg text-sm font-medium border border-indigo-100 dark:border-indigo-800 animate-in fade-in zoom-in-95">
              <span>{selectedIds.length} selected</span>
              <div className="w-px h-4 bg-indigo-200 dark:bg-indigo-700 mx-1"></div>
              <button onClick={() => exportCSV(true)} className="hover:text-indigo-900 dark:hover:text-white flex items-center gap-1"><Download size={14}/> Export</button>
              <button onClick={bulkDelete} className="hover:text-red-600 flex items-center gap-1 ml-2 text-red-500"><Trash2 size={14}/> Delete</button>
            </div>
          )}

          <div className="flex items-center gap-2 bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 rounded-xl p-1 shadow-sm">
            <select className="bg-transparent text-sm text-gray-600 dark:text-gray-300 outline-none p-1.5 font-medium cursor-pointer" value={sortField} onChange={e => setSortField(e.target.value)}>
              <option value="createdAt">Date Submitted</option>
              <option value="studentName">Student Name</option>
              <option value="course">Course</option>
              <option value="quizScore">Score</option>
            </select>
            <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-lg transition" title="Toggle Order">
              <Filter size={16} className={sortOrder === 'desc' ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
          </div>
        </div>
      </div>

      {data.total === 0 && !search ? (
        <div className="bg-white dark:bg-[#111113] rounded-3xl border border-gray-100 dark:border-gray-800 p-20 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100 dark:border-gray-700">
            <Inbox size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No responses yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Responses will appear here when students submit this form. Your data will update automatically.
          </p>
        </div>
      ) : data.responses.length === 0 ? (
        <div className="bg-white dark:bg-[#111113] rounded-3xl border border-gray-100 dark:border-gray-800 p-20 text-center shadow-sm">
          <Search size={32} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No matching results</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111113] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-900/50 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="p-4 w-12 text-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" 
                      checked={selectedIds.length === data.responses.length && data.responses.length > 0} 
                      onChange={selectAll} />
                  </th>
                  <th className="px-6 py-4 font-semibold">Submission ID</th>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Course & Branch</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {data.responses.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
                    <td className="p-4 text-center">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" 
                        checked={selectedIds.includes(r._id)} onChange={() => toggleSelection(r._id)} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                        {r.submissionId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                         <div className="w-6 h-6 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full flex items-center justify-center text-xs">
                           {r.studentName.charAt(0)}
                         </div>
                         {r.studentName}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 ml-8">{r.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 dark:text-gray-300">{r.course !== 'N/A' ? r.course : '-'}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{r.branch !== 'N/A' ? r.branch : ''}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString()} <span className="text-xs">{new Date(r.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedResponse(r)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition" title="View Detail"><Eye size={16}/></button>
                        <button onClick={() => deleteResponse(r._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition" title="Delete"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
            {data.responses.map(r => (
              <div key={r._id} className="p-4 bg-white dark:bg-[#111113] hover:bg-gray-50 dark:hover:bg-gray-900/30 transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600" checked={selectedIds.includes(r._id)} onChange={() => toggleSelection(r._id)} />
                    <span className="font-mono text-xs font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300">{r.submissionId}</span>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => setSelectedResponse(r)} className="p-1.5 text-indigo-600 bg-indigo-50 rounded-md"><Eye size={14}/></button>
                     <button onClick={() => deleteResponse(r._id)} className="p-1.5 text-red-600 bg-red-50 rounded-md"><Trash2 size={14}/></button>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{r.studentName}</h4>
                <p className="text-sm text-gray-500">{r.email} • {r.course}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Showing {((page - 1) * 10) + 1} - {Math.min(page * 10, data.total)} of {data.total} responses
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition shadow-sm"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button 
                onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition shadow-sm"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Response Detail Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111113] rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 border border-gray-100 dark:border-gray-800">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText size={20} className="text-indigo-500"/> Submission Detail
                </h3>
                <p className="text-sm text-gray-500 font-mono mt-1">{selectedResponse.submissionId}</p>
              </div>
              <button onClick={() => setSelectedResponse(null)} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 transition">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              
              {/* Profile Block */}
              <div className="flex flex-wrap items-center gap-6 p-6 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 shadow-sm rounded-2xl flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-50 dark:border-gray-700">
                  {selectedResponse.studentName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">{selectedResponse.studentName}</h4>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                    <span className="flex items-center gap-1.5"><User size={14} className="text-indigo-400"/> {selectedResponse.email}</span>
                    <span className="flex items-center gap-1.5"><Inbox size={14} className="text-indigo-400"/> {selectedResponse.course} {selectedResponse.branch !== 'N/A' && `(${selectedResponse.branch})`}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-indigo-400"/> {new Date(selectedResponse.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Answers Blocks */}
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs mb-4">Provided Answers</h4>
                <div className="space-y-4">
                  {selectedResponse.answers.map((ans, idx) => (
                    <div key={idx} className="p-5 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/20">
                      <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{ans.fieldLabel}</p>
                      
                      {ans.value ? (
                        ans.fieldType === 'rating' ? (
                           <div className="text-2xl text-amber-400 tracking-widest">
                             {'★'.repeat(ans.value)}{'☆'.repeat(5 - ans.value)}
                           </div>
                        ) : (
                          <div className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{ans.value}</div>
                        )
                      ) : (
                        <span className="text-gray-400 italic text-sm">No response</span>
                      )}
                    </div>
                  ))}
                  {selectedResponse.answers.length === 0 && (
                    <p className="text-gray-500 italic">No answers recorded.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
