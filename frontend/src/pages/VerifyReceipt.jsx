import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, ShieldCheck, FileText, Calendar, Hash } from 'lucide-react';

export default function VerifyReceipt() {
  const { receiptId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/responses/verify/${receiptId}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(true);
        setLoading(false);
      });
  }, [receiptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Verifying receipt...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex flex-col items-center pt-20 px-4">
        <div className="bg-white dark:bg-[#111113] p-8 rounded-3xl shadow-xl border border-red-100 dark:border-red-900/30 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invalid Receipt</h1>
          <p className="text-gray-500 mb-8">
            The receipt ID <span className="font-mono text-gray-700 dark:text-gray-300 font-semibold">{receiptId}</span> could not be verified in our system. It may be incorrect, tampered with, or deleted.
          </p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold transition">
            <ArrowLeft size={18} /> Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex flex-col items-center pt-20 px-4">
      <div className="bg-white dark:bg-[#111113] p-1 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 max-w-lg w-full overflow-hidden">
        
        <div className="bg-emerald-500 p-8 text-center rounded-t-3xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><ShieldCheck size={120} /></div>
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 relative z-10" />
          <h1 className="text-3xl font-bold relative z-10 tracking-tight">Verified Receipt</h1>
          <p className="opacity-90 relative z-10 font-medium mt-1">Authentic Form Submission</p>
        </div>

        <div className="p-8">
          <div className="space-y-6">
            
            <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center shrink-0 text-indigo-500"><FileText size={24}/></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Form Name</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white leading-tight">{data.formTitle}</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center shrink-0 text-indigo-500"><Hash size={24}/></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Receipt ID</p>
                <p className="text-lg font-mono font-bold text-gray-900 dark:text-white leading-tight">{data.receiptId}</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center shrink-0 text-indigo-500"><Calendar size={24}/></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Submitted On</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white leading-tight">{new Date(data.date).toLocaleString()}</p>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-500 mb-6">This receipt guarantees that the response was successfully recorded in the database. Student personal data is intentionally hidden for privacy.</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold transition">
              <ArrowLeft size={18} /> Done
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
