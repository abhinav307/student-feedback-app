import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, AlertCircle, FileText, ClipboardCheck, MessageSquare, BarChart,
  Send, Lock, Edit, Download, TrendingUp, BarChart3, Activity, FileCheck,
  Sparkles, Lightbulb, Wrench, Megaphone
} from 'lucide-react';
import api from '../services/api';
import { useOutletContext } from 'react-router-dom';

const defaultPrefs = {
  form: { newSubmission: true, newQuizSubmission: true, newFeedbackResponse: true, responseMilestone: false, responseMilestoneThreshold: 100 },
  management: { formPublished: true, formClosed: true, formUpdated: false, exportReady: true },
  analytics: { weeklySummary: false, responseSummary: false, performanceAlerts: false, scheduledReportReady: true },
  communication: { productUpdates: true, tipsGuides: false, maintenanceAlerts: true, serviceAnnouncements: true }
};

export default function NotificationsTab() {
  const { user, setUser } = useOutletContext();
  const [toast, setToast] = useState(null);
  const [prefs, setPrefs] = useState(defaultPrefs);

  useEffect(() => {
    if (user?.notificationPreferences) {
      setPrefs(prev => ({
        form: { ...prev.form, ...user.notificationPreferences.form },
        management: { ...prev.management, ...user.notificationPreferences.management },
        analytics: { ...prev.analytics, ...user.notificationPreferences.analytics },
        communication: { ...prev.communication, ...user.notificationPreferences.communication }
      }));
    }
  }, [user]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggle = async (section, key) => {
    const updatedPrefs = { ...prefs, [section]: { ...prefs[section], [key]: !prefs[section][key] } };
    setPrefs(updatedPrefs);
    try {
      const res = await api.put('/auth/profile', { notificationPreferences: updatedPrefs });
      setUser(res.data);
      showToast('success', 'Notification preferences updated successfully.');
    } catch (err) {
      setPrefs(prefs);
      showToast('error', 'Unable to update notification preferences. Please try again.');
    }
  };

  const handleThresholdChange = async (val) => {
    const updatedPrefs = { ...prefs, form: { ...prefs.form, responseMilestoneThreshold: parseInt(val) } };
    setPrefs(updatedPrefs);
    try {
      const res = await api.put('/auth/profile', { notificationPreferences: updatedPrefs });
      setUser(res.data);
      showToast('success', 'Notification preferences updated successfully.');
    } catch (err) {
      setPrefs(prefs);
      showToast('error', 'Unable to update notification preferences. Please try again.');
    }
  };

  const handleGlobalAction = async (action) => {
    let updatedPrefs = { ...prefs };
    if (action === 'enable-all') {
      updatedPrefs = {
        form: { ...updatedPrefs.form, newSubmission: true, newQuizSubmission: true, newFeedbackResponse: true, responseMilestone: true },
        management: { ...updatedPrefs.management, formPublished: true, formClosed: true, formUpdated: true, exportReady: true },
        analytics: { ...updatedPrefs.analytics, weeklySummary: true, responseSummary: true, performanceAlerts: true, scheduledReportReady: true },
        communication: { ...updatedPrefs.communication, productUpdates: true, tipsGuides: true, maintenanceAlerts: true, serviceAnnouncements: true }
      };
    } else if (action === 'disable-optional') {
      updatedPrefs = {
        form: { ...updatedPrefs.form },
        management: { ...updatedPrefs.management },
        analytics: { ...updatedPrefs.analytics, weeklySummary: false, responseSummary: false, performanceAlerts: false },
        communication: { ...updatedPrefs.communication, productUpdates: false, tipsGuides: false, maintenanceAlerts: true, serviceAnnouncements: true }
      };
    }

    setPrefs(updatedPrefs);
    try {
      const res = await api.put('/auth/profile', { notificationPreferences: updatedPrefs });
      setUser(res.data);
      showToast('success', 'Notification preferences updated successfully.');
    } catch (err) {
      setPrefs(prefs);
      showToast('error', 'Unable to update notification preferences. Please try again.');
    }
  };

  const ToggleRow = ({ section, id, label, desc, icon: Icon, isMilestone }) => {
    const isOn = prefs[section][id];
    return (
      <div className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${isOn ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : 'hover:bg-gray-50/50 dark:hover:bg-gray-900/20'}`}>
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-xl shrink-0 transition-colors ${isOn ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' : 'bg-gray-100 text-gray-500 dark:bg-[#0c0c0e] dark:text-gray-400'}`}>
            <Icon size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{desc}</p>
            {isMilestone && isOn && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Milestone:</span>
                <select 
                  value={prefs.form.responseMilestoneThreshold} 
                  onChange={(e) => handleThresholdChange(e.target.value)}
                  className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-1.5 shadow-sm outline-none"
                >
                  {[10, 25, 50, 100, 250, 500, 1000].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={() => handleToggle(section, id)}
          aria-label={`Toggle ${label}`}
          className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${isOn ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl relative">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Choose which Formify activities and updates you want to be notified about.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => handleGlobalAction('enable-all')}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl transition"
          >
            Enable All
          </button>
          <button 
            onClick={() => handleGlobalAction('disable-optional')}
            className="px-4 py-2 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl transition"
          >
            Disable Optional
          </button>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Form & Response Notifications */}
        <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-transparent">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">Form & Response Notifications</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Stay informed when people interact with your forms and quizzes.</p>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <ToggleRow section="form" id="newSubmission" label="New Form Submission" desc="Receive an alert when someone submits a form." icon={FileText} />
            <ToggleRow section="form" id="newQuizSubmission" label="New Quiz Submission" desc="Receive an alert when someone completes a quiz." icon={ClipboardCheck} />
            <ToggleRow section="form" id="newFeedbackResponse" label="New Feedback Response" desc="Receive an alert when someone submits feedback." icon={MessageSquare} />
            <ToggleRow section="form" id="responseMilestone" label="Response Milestone" desc="Get notified when a form reaches a response milestone." icon={BarChart} isMilestone={true} />
          </div>
        </div>

        {/* Form Management */}
        <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-transparent">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">Form Management</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Stay informed about important changes to your forms.</p>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <ToggleRow section="management" id="formPublished" label="Form Published" desc="Get notified when a form is published and becomes available." icon={Send} />
            <ToggleRow section="management" id="formClosed" label="Form Closed / Expired" desc="Get notified when a form stops accepting responses." icon={Lock} />
            <ToggleRow section="management" id="formUpdated" label="Form Updated" desc="Get notified when important changes are made to a form." icon={Edit} />
            <ToggleRow section="management" id="exportReady" label="Form Export Ready" desc="Get notified when a CSV, PDF, or report export is ready." icon={Download} />
          </div>
        </div>

        {/* Reports & Analytics */}
        <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-transparent">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">Reports & Analytics</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Choose when Formify should send performance and analytics updates.</p>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <ToggleRow section="analytics" id="weeklySummary" label="Weekly Analytics Summary" desc="Receive a weekly summary of your forms and response performance." icon={TrendingUp} />
            <ToggleRow section="analytics" id="responseSummary" label="Response Summary" desc="Receive periodic statistics about form responses." icon={BarChart3} />
            <ToggleRow section="analytics" id="performanceAlerts" label="Performance Alerts" desc="Get notified about unusual increases or decreases in response activity." icon={Activity} />
            <ToggleRow section="analytics" id="scheduledReportReady" label="Scheduled Report Ready" desc="Get notified when a scheduled analytics report has been generated." icon={FileCheck} />
          </div>
        </div>

        {/* Product & Communication */}
        <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-transparent">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">Product & Communication</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Control updates and communication from Formify.</p>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <ToggleRow section="communication" id="productUpdates" label="Product Updates" desc="Get notified about new Formify features and major improvements." icon={Sparkles} />
            <ToggleRow section="communication" id="tipsGuides" label="Tips & Guides" desc="Receive helpful tips, tutorials, and guidance for using Formify." icon={Lightbulb} />
            <ToggleRow section="communication" id="maintenanceAlerts" label="Maintenance Alerts" desc="Receive notifications about planned maintenance and service interruptions." icon={Wrench} />
            <ToggleRow section="communication" id="serviceAnnouncements" label="Service Announcements" desc="Receive important announcements about the Formify platform." icon={Megaphone} />
          </div>
        </div>

      </div>
    </div>
  );
}
