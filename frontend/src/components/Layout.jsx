import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, LogOut, FileText, 
  Settings, HelpCircle, BarChart2, Bell, Search, 
  Menu, X, Moon, Sun, ChevronRight, User, Shield, CheckCircle2
} from 'lucide-react';
import api from '../services/api';

export default function Layout({ setToken }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        if (res.data.hasCompletedOnboarding === false) {
          navigate("/onboarding");
        }
      } catch (err) {
        console.error('Failed to load user', err);
      }
    };
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };
    fetchUser();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    setToken(null);
    navigate('/login');
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
    return (
      <Link 
        to={to} 
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-200 group relative overflow-hidden ${
          isActive 
            ? 'bg-indigo-600 shadow-md shadow-indigo-200 dark:shadow-none text-white' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
      >
        <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors'} />
        <span className="font-semibold text-sm">{label}</span>
      </Link>
    );
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-black overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 dark:bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#0c0c0e] border-r border-gray-200 dark:border-gray-800 
        transform transition-transform duration-300 ease-in-out flex flex-col
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <img src="/logo.png" alt="Icon" className="w-full h-full object-contain" />
            </div>
            <div className="h-8 w-36 ml-1 relative flex items-center">
              {/* Light mode: standard image */}
              <img src="/formify-text.png" alt="Formify" className="h-full w-full object-contain object-left dark:hidden" />
              {/* Dark mode: masked gradient text */}
              <div 
                className="hidden dark:block absolute inset-0 bg-gradient-to-r from-blue-400 via-fuchsia-400 to-purple-500 animate-shimmer"
                style={{
                  WebkitMaskImage: 'url(/formify-text.png)',
                  WebkitMaskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'left center'
                }}
              />
            </div>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 no-scrollbar">
          
          <div>
            <div className="px-4 mb-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Main</div>
            <nav>
              <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
              
            </nav>
          </div>

          <div>
            <div className="px-4 mb-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Create</div>
            <nav>
              <NavItem to="/builder" icon={PlusCircle} label="New Form" />
            </nav>
          </div>

        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <NavItem to="/settings" icon={Settings} label="Settings" />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 font-semibold text-sm transition group"
          >
            <LogOut size={18} className="text-gray-400 dark:text-gray-500 group-hover:text-red-500" /> Logout
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-30 sticky top-0">
          
          <div className="flex items-center flex-1 gap-4">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <Menu size={20} />
            </button>
            
            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span className="hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer">{user?.organization || 'Organization'}</span>
              <ChevronRight size={16} className="mx-1" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {location.pathname === '/' ? 'Dashboard' : 
                 location.pathname.startsWith('/builder') ? 'Form Builder' : 
                 location.pathname.startsWith('/settings') ? 'Settings' : 'Workspace'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors relative">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">{unreadCount}</span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Mark all as read</button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">No new notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n._id} onClick={() => markAsRead(n._id)} className={`p-4 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition ${!n.read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-sm text-gray-900 dark:text-white">{n.title}</span>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1"></span>}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{n.message}</p>
                          <span className="text-[10px] text-gray-400 mt-2 block">{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <div onClick={() => setShowProfile(!showProfile)} className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium cursor-pointer ring-2 ring-transparent hover:ring-indigo-500 transition-all ml-2 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />
                )}
              </div>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden py-2">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'Loading...'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link to="/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                    <User size={16} /> Profile
                  </Link>
                  <Link to="/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                    <Settings size={16} /> Account Settings
                  </Link>
                  <Link to="/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                    <Shield size={16} /> Security
                  </Link>
                  <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <Outlet context={{ user, setUser }} />
        </main>
      </div>
    </div>
  );
}
