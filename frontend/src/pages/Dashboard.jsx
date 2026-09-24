import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FileText, Users, Link as LinkIcon, Trash2 } from 'lucide-react';

export default function Dashboard({ token }) {
  const [forms, setForms] = useState([]);

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
    }
  };

  const deleteForm = async (id) => {
    if(!confirm('Delete this form?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/forms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchForms();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Forms</h1>
        <Link to="/builder" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700">
          Create New Form
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map(form => (
          <div key={form._id} className="bg-white rounded-xl shadow-sm border p-6 flex flex-col">
            <h3 className="font-bold text-lg mb-2 text-gray-900">{form.title}</h3>
            <p className="text-gray-500 text-sm mb-4 flex-1">{form.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
              <span className="flex items-center gap-1"><Users size={16}/> {form.responseCount} Responses</span>
              <span className="flex items-center gap-1 capitalize bg-gray-100 px-2 rounded">{form.type}</span>
            </div>

            <div className="flex gap-2 mt-auto">
              <button 
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/form/${form.publicId}`)}
                className="flex-1 flex justify-center items-center gap-1 bg-gray-50 hover:bg-gray-100 border text-gray-700 py-2 rounded-lg text-sm font-medium"
              >
                <LinkIcon size={16} /> Copy Link
              </button>
              <button onClick={() => deleteForm(form._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {forms.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No forms created yet. Click "Create New Form" to get started!
          </div>
        )}
      </div>
    </div>
  );
}