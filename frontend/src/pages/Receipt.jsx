import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import QRCode from 'react-qr-code';

export default function Receipt() {
  const { receiptId } = useParams();
  const [data, setData] = useState(null);
  const receiptRef = useRef();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/responses/receipt/${receiptId}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, [receiptId]);

  const downloadPDF = () => {
    const element = receiptRef.current;
    html2pdf().from(element).set({
      margin: 1,
      filename: `receipt-${receiptId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).save();
  };

  if (!data) return <div className="text-center mt-20">Loading receipt...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        <div ref={receiptRef} className="bg-white p-10 rounded-xl shadow-lg border-t-8 border-green-500 relative">
          <div className="text-center mb-8 border-b pb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Submission Successful!</h1>
            <p className="text-gray-500">Thank you for submitting your responses.</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">Receipt ID</p>
              <p className="font-mono font-bold text-lg">{data.receiptId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Date Submitted</p>
              <p className="font-medium">{new Date(data.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Form Name</p>
              <p className="font-medium">{data.formId?.title || 'Unknown Form'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Student</p>
              <p className="font-medium">{data.studentName}</p>
            </div>
          </div>

          <div className="border-t pt-8 mt-8 flex justify-center">
             <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">Verification QR Code</p>
                <QRCode value={window.location.href} size={100} />
             </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button onClick={downloadPDF} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-indigo-700">
            Download PDF Receipt
          </button>
          <Link to="/" className="bg-white text-gray-700 border px-6 py-3 rounded-lg font-bold shadow-sm hover:bg-gray-50">
            Return Home
          </Link>
        </div>

      </div>
    </div>
  );
}