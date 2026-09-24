import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import QRCode from 'react-qr-code';
import { Download, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Receipt() {
  const { receiptId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const receiptRef = useRef();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/responses/receipt/${receiptId}`)
      .then(res => setData(res.data))
      .catch(err => setError('Receipt not found.'));
  }, [receiptId]);

  const downloadPDF = () => {
    const element = receiptRef.current;
    html2pdf().from(element).set({
      margin: 1,
      filename: `Submission_${data?.receiptId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).save();
  };

  const hexToRgba = (hex, alpha) => {
    if(!hex || !hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-red-100 max-w-md">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Receipt Not Found</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link to="/" className="text-indigo-600 font-semibold hover:underline">Return Home</Link>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const t = data.formId?.theme || {};
  
  const containerStyle = {
    fontFamily: t.fontFamily || 'Inter, sans-serif',
    backgroundColor: t.backgroundType === 'color' ? (t.backgroundColor || '#f3f4f6') : undefined,
    backgroundImage: t.backgroundType === 'gradient' ? t.backgroundGradient : (t.backgroundType === 'image' && t.backgroundImage ? `url(${t.backgroundImage})` : 'none'),
    backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
    position: 'relative', minHeight: '100vh', padding: '2rem 1rem'
  };

  const overlayStyle = {
    position: 'absolute', inset: 0,
    backgroundColor: t.backgroundOverlay || 'rgba(0,0,0,0)',
    backdropFilter: `blur(${t.backgroundBlur || '0px'})`,
    pointerEvents: 'none'
  };

  return (
    <div style={containerStyle}>
      <div style={overlayStyle}></div>
      
      <div className="max-w-3xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <button 
            onClick={() => navigate(`/form/${data.formId.publicId}`)} 
            className="w-full sm:w-auto px-6 py-3 bg-white/90 backdrop-blur-sm text-gray-800 rounded-xl font-bold shadow-sm hover:bg-white transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={18}/> Submit Another
          </button>
          <button 
            onClick={downloadPDF} 
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2"
            style={{ backgroundColor: t.buttonBgColor || '#4f46e5', color: t.buttonTextColor || '#ffffff' }}
          >
            <Download size={18}/> Download PDF
          </button>
        </div>

        {/* Printable PDF Area */}
        <div ref={receiptRef} className="bg-white p-8 sm:p-12 rounded-3xl shadow-2xl relative overflow-hidden" style={{ color: '#1f2937', fontFamily: t.fontFamily || 'sans-serif' }}>
          
          {/* Success Banner */}
          <div className="absolute top-0 left-0 right-0 h-3" style={{ backgroundColor: t.buttonBgColor || '#10b981' }}></div>
          
          <div className="text-center mb-10 mt-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm" style={{ backgroundColor: hexToRgba(t.buttonBgColor || '#10b981', 0.1), color: t.buttonBgColor || '#10b981' }}>
              <CheckCircle2 size={40} />
            </div>
            <h1 className="text-3xl font-extrabold mb-2" style={{ color: t.headingColor || '#111827' }}>Submission Successful</h1>
            <p className="text-gray-500 text-lg">Thank you for your response!</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Receipt ID</p>
              <p className="font-mono font-bold text-lg text-gray-900">{data.receiptId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Date Submitted</p>
              <p className="font-medium text-gray-900">{new Date(data.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Form Name</p>
              <p className="font-medium text-gray-900">{data.formId?.title || 'Unknown Form'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Submitted By</p>
              <p className="font-medium text-gray-900">{data.studentName || 'Anonymous'}</p>
            </div>
          </div>

          {/* Answers Summary */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-6 pb-2 border-b-2" style={{ borderColor: hexToRgba(t.headingColor || '#111827', 0.1), color: t.headingColor || '#111827' }}>Response Summary</h2>
            
            <div className="space-y-6">
              {data.answers && data.answers.map((ans, idx) => {
                if (ans.fieldType === 'section' || ans.fieldType === 'image' || ans.fieldType === 'video') return null;
                return (
                  <div key={idx} className="flex flex-col gap-1">
                    <p className="font-semibold text-gray-700">{ans.fieldLabel}</p>
                    {ans.value ? (
                      ans.fieldType === 'rating' ? (
                        <p className="text-amber-500 text-xl tracking-widest">
                           {'★'.repeat(ans.value)}{'☆'.repeat(5 - ans.value)}
                        </p>
                      ) : (
                        <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-xl border border-gray-100">{ans.value}</p>
                      )
                    ) : (
                      <p className="text-gray-400 italic">No response provided</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border-t-2 pt-8 flex flex-col items-center justify-center text-center" style={{ borderColor: hexToRgba(t.headingColor || '#111827', 0.1) }}>
             <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-4">Official Verification</p>
             <div className="p-3 bg-white border-2 border-gray-100 rounded-2xl shadow-sm inline-block">
               <QRCode value={window.location.href} size={100} />
             </div>
             <p className="text-xs text-gray-400 mt-4 max-w-xs leading-relaxed">
               Scan this QR code to view the live receipt for this exact submission.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}
