import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Inbox, Clock, User, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Responses({ token }) {
  const { formId } = useParams();
  const [data, setData] = useState({ responses: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchResponses(page);
  }, [formId, page]);

  const fetchResponses = async (pageNum) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/responses/form/${formId}?page=${pageNum}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching responses');
    } finally {
      setLoading(false);
    }
  };

  if (loading && data.responses.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
        <div className="mt-4">
          <Link to="/" className="text-indigo-600 hover:underline">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Form Responses</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Total of {data.total} submission{data.total !== 1 && 's'} received
          </p>
        </div>
      </div>

      {data.responses.length === 0 ? (
        <div className="bg-white dark:bg-[#111113] rounded-2xl border border-gray-100 dark:border-gray-800 p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Inbox size={28} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No responses yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Responses will appear here when students submit this form. Share your public link to start collecting data.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.responses.map(response => (
            <div key={response._id} className="bg-white dark:bg-[#111113] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              
              {/* Card Header */}
              <div className="bg-gray-50/50 dark:bg-gray-900/50 p-4 sm:px-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                    {response.studentName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{response.studentName}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1"><User size={12}/> {response.email}</span>
                      {response.course !== 'N/A' && <span>• {response.course}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                  <Clock size={14} />
                  {new Date(response.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Answers */}
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {response.answers.map(ans => (
                  <div key={ans.fieldId} className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <FileText size={12} /> {ans.fieldLabel}
                    </span>
                    <div className="text-gray-900 dark:text-gray-200 text-sm bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-transparent dark:border-gray-800 min-h-[44px] flex items-center">
                      {ans.value ? (
                        ans.fieldType === 'rating' ? `★ ${ans.value}/5` : ans.value
                      ) : (
                        <span className="text-gray-400 italic">No answer provided</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-6 mt-8">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {page} of {data.pages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
