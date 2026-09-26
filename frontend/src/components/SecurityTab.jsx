import React, { useState, useEffect } from 'react';
import { Lock, Bell, Monitor, Activity, ShieldAlert, CheckCircle2, AlertCircle, Key, Mail, Smartphone, Globe, Power, Trash2, Loader2 } from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function SecurityTab() {
  const { user, setUser } = useOutletContext();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Password State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Settings State — initialize from user or defaults
  const [settings, setSettings] = useState({
    loginAlerts: true,
    suspiciousAlerts: true,
    accountChanges: false
  });

  // Sessions State
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // Activity State
  const [activityLog, setActivityLog] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  // Danger loading
  const [dangerLoading, setDangerLoading] = useState(null);

  // Load security preferences from user
  useEffect(() => {
    if (user?.securityPreferences) {
      setSettings({
        loginAlerts: user.securityPreferences.loginAlerts ?? true,
        suspiciousAlerts: user.securityPreferences.suspiciousAlerts ?? true,
        accountChanges: user.securityPreferences.accountChanges ?? false
      });
    }
  }, [user]);

  // Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get('/auth/sessions');
        setSessions(res.data || []);
      } catch (err) {
        console.error('Failed to load sessions:', err);
      } finally {
        setSessionsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  // Fetch activity log
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await api.get('/auth/activity');
        setActivityLog(res.data || []);
      } catch (err) {
        console.error('Failed to load activity:', err);
      } finally {
        setActivityLoading(false);
      }
    };
    fetchActivity();
  }, []);

  // ===================== HANDLERS =====================

  
  // Modals state
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);
  const [recoveryEmailInput, setRecoveryEmailInput] = useState(user?.recoveryEmail || '');
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [backupLoading, setBackupLoading] = useState(false);

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setRecoveryLoading(true);
    try {
      const res = await api.put('/auth/recovery-email', { recoveryEmail: recoveryEmailInput });
      setUser(prev => ({ ...prev, recoveryEmail: recoveryEmailInput }));
      showToast('success', 'Recovery email updated.');
      setRecoveryModalOpen(false);
      try { const r = await api.get('/auth/activity'); setActivityLog(r.data || []); } catch {}
    } catch (err) {
      showToast('error', 'Failed to update recovery email.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    setBackupLoading(true);
    try {
      const res = await api.post('/auth/backup-codes');
      setBackupCodes(res.data.codes);
      showToast('success', 'New backup codes generated.');
      try { const r = await api.get('/auth/activity'); setActivityLog(r.data || []); } catch {}
    } catch (err) {
      showToast('error', 'Failed to generate backup codes.');
    } finally {
      setBackupLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      showToast('error', 'New passwords do not match.');
      return;
    }
    if (passwordForm.new.length < 8) {
      showToast('error', 'Password must be at least 8 characters long.');
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new
      });
      showToast('success', 'Password updated successfully.');
      setShowPasswordForm(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
      // Refresh activity
      try { const r = await api.get('/auth/activity'); setActivityLog(r.data || []); } catch {}
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggle = async (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    try {
      const res = await api.put('/auth/security-preferences', updated);
      if (res.data) setUser(res.data);
      showToast('success', 'Security settings updated.');
    } catch (err) {
      setSettings(settings); // revert
      showToast('error', 'Failed to update security settings.');
    }
  };

  const handleRevoke = async (sessionId) => {
    if (!window.confirm('Are you sure you want to revoke this session?')) return;
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
      showToast('success', 'Session revoked successfully.');
      try { const r = await api.get('/auth/activity'); setActivityLog(r.data || []); } catch {}
    } catch (err) {
      showToast('error', 'Failed to revoke session.');
    }
  };

  const handleSignOutOthers = async () => {
    if (!window.confirm('Are you sure you want to sign out of all other devices?')) return;
    try {
      await api.delete('/auth/sessions/others');
      setSessions(prev => prev.filter(s => s.isCurrent));
      showToast('success', 'All other sessions have been signed out.');
      try { const r = await api.get('/auth/activity'); setActivityLog(r.data || []); } catch {}
    } catch (err) {
      showToast('error', 'Failed to sign out other sessions.');
    }
  };

  const handleSignOutEverywhere = async () => {
    if (!window.confirm('Are you absolutely sure you want to sign out everywhere? You will be logged out.')) return;
    setDangerLoading('signout');
    try {
      await api.delete('/auth/sessions/others');
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      showToast('error', 'Failed to sign out everywhere.');
      setDangerLoading(null);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you absolutely sure you want to deactivate your account? You will not be able to log in until reactivated.')) return;
    setDangerLoading('deactivate');
    try {
      await api.put('/auth/deactivate');
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      showToast('error', 'Failed to deactivate account.');
      setDangerLoading(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('⚠️ This will PERMANENTLY delete your account and ALL your forms, responses, and data. This CANNOT be undone. Are you absolutely sure?')) return;
    setDangerLoading('delete');
    try {
      await api.delete('/auth/account');
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      showToast('error', 'Failed to delete account.');
      setDangerLoading(null);
    }
  };

  // Helper: format relative time for activity
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Helper: format session lastActive
  const formatLastActive = (dateStr, isCurrent) => {
    if (isCurrent) return 'Current session';
    if (!dateStr) return 'Unknown';
    const now = new Date();
    const d = new Date(dateStr);
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Active just now';
    if (diffMins < 60) return `Active ${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Active ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Active yesterday';
    return `Active ${diffDays} days ago`;
  };

  // Helper: choose icon for activity
  const getActivityIcon = (action) => {
    if (/login/i.test(action)) return Globe;
    if (/password/i.test(action)) return Key;
    if (/session/i.test(action)) return Monitor;
    if (/deactivat/i.test(action)) return Power;
    return Activity;
  };

  // Helper: password changed date
  const getPasswordAge = () => {
    if (!user?.passwordChangedAt) return null;
    const d = new Date(user.passwordChangedAt);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Changed today';
    if (diffDays === 1) return 'Changed yesterday';
    return `Last changed ${diffDays} days ago`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl">
      
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800/60 dark:text-emerald-400' 
            : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/40 dark:border-red-800/60 dark:text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Protect your Formify account and manage login security.</p>
      </div>

      {/* Password Card */}
      <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Lock size={18} className="text-indigo-500" />
                Password
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Keep your account secure with a strong password.</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 font-medium">{getPasswordAge() || 'No password change recorded'}</p>
            </div>
            {!showPasswordForm && (
              <button onClick={() => setShowPasswordForm(true)} className="shrink-0 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl transition">
                Change Password
              </button>
            )}
          </div>

          {showPasswordForm && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                  <input type="password" required value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                  <input type="password" required minLength={8} value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                  <input type="password" required minLength={8} value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition" />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" disabled={passwordLoading} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2">
                    {passwordLoading && <Loader2 size={16} className="animate-spin" />}
                    Save Password
                  </button>
                  <button type="button" onClick={() => setShowPasswordForm(false)} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition">
                    Cancel
                  </button>
                </div>
                <div className="mt-4">
                  <a href="#" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Forgot password?</a>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Security Notifications */}
      <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
            <Bell size={18} className="text-indigo-500" />
            Security Notifications
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Choose which account security events you want to be notified about.</p>
          
          <div className="space-y-4">
            {[
              { id: 'loginAlerts', label: 'New login alerts', desc: 'Get notified when someone logs into your account from a new device.' },
              { id: 'suspiciousAlerts', label: 'Suspicious activity alerts', desc: 'Receive alerts if we detect unusual activity.' },
              { id: 'accountChanges', label: 'Password/account changes', desc: 'Get emails when your password or security settings are changed.' }
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/20 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <button 
                  onClick={() => handleToggle(item.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${settings[item.id] ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings[item.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
            <Monitor size={18} className="text-indigo-500" />
            Active Sessions
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Review devices currently signed in to your Formify account.</p>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {sessionsLoading ? (
            <div className="p-8 flex items-center justify-center text-gray-400">
              <Loader2 size={20} className="animate-spin mr-2" /> Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No active sessions found.</div>
          ) : (
            sessions.map(session => {
              const SessionIcon = /android|iphone|ipad|ios/i.test(session.os || '') ? Smartphone : Monitor;
              return (
                <div key={session.sessionId} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300 shrink-0">
                      <SessionIcon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{session.browser} · {session.os}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{session.location || 'Unknown location'}</p>
                      <p className={`text-xs mt-1 font-medium ${session.isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                        {formatLastActive(session.lastActive, session.isCurrent)}
                      </p>
                    </div>
                  </div>
                  <div>
                    {session.isCurrent ? (
                      <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 text-xs font-semibold rounded-lg inline-block">
                        Current Session
                      </span>
                    ) : (
                      <button onClick={() => handleRevoke(session.sessionId)} className="px-4 py-2 bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition">
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        {sessions.length > 1 && (
          <div className="p-4 bg-gray-50 dark:bg-[#0c0c0e] border-t border-gray-200 dark:border-gray-800 flex justify-end">
            <button onClick={handleSignOutOthers} className="px-4 py-2 bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl transition shadow-sm">
              Sign out other sessions
            </button>
          </div>
        )}
      </div>

      {/* Recent Account Activity */}
      <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                <Activity size={18} className="text-indigo-500" />
                Recent Account Activity
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Review recent security-related activity on your account.</p>
            </div>
          </div>
          {activityLoading ? (
            <div className="py-8 flex items-center justify-center text-gray-400">
              <Loader2 size={20} className="animate-spin mr-2" /> Loading activity...
            </div>
          ) : activityLog.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">No recent activity.</div>
          ) : (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-800 before:to-transparent">
              {activityLog.map((activity, idx) => {
                const Icon = getActivityIcon(activity.action);
                return (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-[#111113] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <Icon size={16} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0c0c0e]/50 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">{formatDate(activity.date)}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${activity.success ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                          {activity.success ? 'Success' : 'Alert'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.device}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recovery */}
      <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
            <ShieldAlert size={18} className="text-indigo-500" />
            Recovery
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Manage the options that help you regain access to your account.</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Recovery email</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.recoveryEmail ? user.recoveryEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'Not set'}</p>
                </div>
              </div>
              <button onClick={() => { setRecoveryEmailInput(user?.recoveryEmail || ''); setRecoveryModalOpen(true); }} className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition">Manage</button>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                  <Key size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Backup codes</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Use if you lose access to your device</p>
                </div>
              </div>
              <button onClick={() => { setBackupCodes([]); setBackupModalOpen(true); }} className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition">Manage</button>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-12 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500 dark:bg-red-600"></div>
        <div className="p-6">
          <h3 className="text-lg font-bold text-red-700 dark:text-red-500 mb-1">DANGER ZONE</h3>
          <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-6">Irreversible and destructive actions for your account.</p>
          
          <div className="space-y-0 divide-y divide-red-100 dark:divide-red-900/30 border border-red-100 dark:border-red-900/30 rounded-xl bg-white dark:bg-[#111113]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-red-50/30 dark:hover:bg-red-900/10 transition">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Sign Out Everywhere</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">End all active sessions on every device.</p>
              </div>
              <button onClick={handleSignOutEverywhere} disabled={dangerLoading === 'signout'} className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl transition disabled:opacity-50">
                {dangerLoading === 'signout' ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />} Sign Out All
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-red-50/30 dark:hover:bg-red-900/10 transition">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Deactivate Account</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Temporarily disable your Formify account.</p>
              </div>
              <button onClick={handleDeactivate} disabled={dangerLoading === 'deactivate'} className="shrink-0 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-500 text-sm font-semibold rounded-xl transition disabled:opacity-50">
                {dangerLoading === 'deactivate' ? <Loader2 size={16} className="animate-spin inline mr-1" /> : null}
                Deactivate
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-red-50/30 dark:hover:bg-red-900/10 transition">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Delete Account</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Permanently delete your account and all associated data.</p>
              </div>
              <button onClick={handleDeleteAccount} disabled={dangerLoading === 'delete'} className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-red-500/20 disabled:opacity-50">
                {dangerLoading === 'delete' ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Recovery Email Modal */}
      {recoveryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Recovery Email</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This email will be used to recover your account if you lose access to your primary email or password.</p>
              
              <form onSubmit={handleRecoverySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <input type="email" required value={recoveryEmailInput} onChange={e => setRecoveryEmailInput(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition" placeholder="backup@example.com" />
                </div>
                
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setRecoveryModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={recoveryLoading} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2">
                    {recoveryLoading && <Loader2 size={16} className="animate-spin" />} Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Backup Codes Modal */}
      {backupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Backup Codes</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">If you lose access to your devices, you can use these backup codes to sign in. <strong>Each code can only be used once.</strong></p>
              
              {backupCodes.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-[#0c0c0e] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                      {backupCodes.map((code, i) => (
                        <div key={i} className="font-mono text-sm font-semibold tracking-wider text-gray-800 dark:text-gray-200 bg-white dark:bg-[#1a1a1c] px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                          {code.slice(0,4)} {code.slice(4)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 rounded-lg text-xs font-medium border border-amber-200 dark:border-amber-900/50">
                    <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                    <p>Copy these codes and keep them somewhere safe. You won't be able to see them again.</p>
                  </div>
                  <div className="flex items-center justify-end pt-2">
                    <button onClick={() => setBackupModalOpen(false)} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition w-full shadow-md shadow-indigo-500/20">
                      I have saved them
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">You currently have backup codes active. Generating new ones will invalidate the old ones.</p>
                  <button onClick={handleGenerateBackupCodes} disabled={backupLoading} className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-xl transition w-full flex items-center justify-center gap-2">
                    {backupLoading ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
                    Generate New Codes
                  </button>
                  <button onClick={() => setBackupModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition w-full">
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
