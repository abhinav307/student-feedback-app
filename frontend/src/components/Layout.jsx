import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, LogOut } from 'lucide-react';

export default function Layout({ setToken }) {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 font-bold text-2xl text-indigo-600 border-b">
          Formify
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center gap-2 p-3 rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition-colors">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/builder" className="flex items-center gap-2 p-3 rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition-colors">
            <PlusCircle size={20} /> Create Form
          </Link>
        </nav>
        <div className="p-4 border-t">
          <button 
            onClick={() => setToken(null)}
            className="flex items-center gap-2 p-3 w-full rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}