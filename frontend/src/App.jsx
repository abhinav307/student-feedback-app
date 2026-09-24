import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import FormBuilder from './pages/FormBuilder';
import PublicForm from './pages/PublicForm';
import Receipt from './pages/Receipt';
import Layout from './components/Layout';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/form/:publicId" element={<PublicForm />} />
        <Route path="/receipt/:receiptId" element={<Receipt />} />
        
        {/* Auth Route */}
        <Route path="/login" element={
          !token ? <Login setToken={setToken} /> : <Navigate to="/" />
        } />

        {/* Protected Manager Routes */}
        <Route path="/" element={
          token ? <Layout setToken={setToken} /> : <Navigate to="/login" />
        }>
          <Route index element={<Dashboard token={token} />} />
          <Route path="builder/:id?" element={<FormBuilder token={token} />} />
          <Route path="forms" element={<Dashboard token={token} />} />
          <Route path="analytics" element={<div className="p-8 text-center text-gray-500">Analytics Dashboard coming soon.</div>} />
          <Route path="settings" element={<div className="p-8 text-center text-gray-500">Settings panel coming soon.</div>} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;