import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import FormBuilder from './pages/FormBuilder';
import PublicForm from './pages/PublicForm';
import Receipt from './pages/Receipt';
import VerifyReceipt from './pages/VerifyReceipt';
import Responses from './pages/Responses';
import FormAnalytics from './pages/FormAnalytics';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';


function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-500 mb-8">Page not found</p>
      <Link to="/" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
        <Home size={20} /> Back to Dashboard
      </Link>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');

    const handleAuthExpired = () => setToken(null);
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, [token]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/form/:publicId" element={<PublicForm />} />
        <Route path="/receipt/:receiptId" element={<Receipt />} />
        <Route path="/verify/:receiptId" element={<VerifyReceipt />} />
        
        {/* Auth Route */}
        <Route path="/login" element={
          !token ? <Login setToken={setToken} /> : <Navigate to="/" />
        } />

        <Route path="/onboarding" element={ token ? <Onboarding /> : <Navigate to="/login" /> } />
        {/* Protected Manager Routes */}
        <Route path="/" element={
          token ? <Layout setToken={setToken} /> : <Navigate to="/login" />
        }>
          <Route index element={<Dashboard token={token} setToken={setToken} />} />
          <Route path="builder/:id?" element={<FormBuilder token={token} setToken={setToken} />} />
          <Route path="responses/:formId" element={<Responses token={token} setToken={setToken} />} />
          <Route path="analytics/:formId" element={<FormAnalytics token={token} setToken={setToken} />} />
          <Route path="forms" element={<Dashboard token={token} setToken={setToken} />} />
          <Route path="analytics" element={<Navigate to="/" />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* Catch All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
export default App;
