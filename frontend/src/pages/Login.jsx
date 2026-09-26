import { useState } from 'react';
import api from '../services/api';
import { ArrowRight, Mail, Lock, Phone, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';


export default function Login({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [registerOtpSent, setRegisterOtpSent] = useState(false);
  const [formData, setFormData] = useState({ name: '', identifier: '', phone: '', email: '', password: '', otp: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      console.log('Google Auth: credential received, sending to backend...');
      const res = await api.post('/auth/google', { credential: credentialResponse.credential });
      console.log('Google Auth: backend responded successfully');
      setToken(res.data.token);
      if (!res.data.hasCompletedOnboarding) {
        navigate('/onboarding');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Google Auth backend error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Google Auth failed. Check browser console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.post('/auth/send-otp', { identifier: formData.identifier });
      setOtpSent(true);
      setSuccessMsg('OTP sent! Check your email or messages.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      let res;
      if (!isLogin) {
        if (!registerOtpSent) {
          res = await api.post('/auth/register', { 
            name: formData.name, 
            email: formData.email, 
            phone: formData.phone,
            password: formData.password 
          });
          setRegisterOtpSent(true);
          setSuccessMsg(res.data.message || `Verification code sent to ${formData.email}`);
          return; // Stop here and wait for OTP
        } else {
          res = await api.post('/auth/verify-register', { email: formData.email, otp: formData.otp });
        }
      } else {
        if (loginMethod === 'otp') {
          res = await api.post('/auth/verify-otp', { identifier: formData.identifier, otp: formData.otp });
        } else {
          res = await api.post('/auth/login', { identifier: formData.identifier, password: formData.password });
        }
      }
      
      setToken(res.data.token);
      
      // Navigate based on onboarding
      if (!res.data.hasCompletedOnboarding) {
        navigate('/onboarding');
      } else {
        navigate('/');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0b] p-4 font-sans selection:bg-indigo-500/30">
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>

      <div className="max-w-md w-full bg-white dark:bg-[#111113] rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-8 md:p-10 relative z-10 overflow-hidden transition-all duration-500">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-14 h-14 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Icon" className="w-full h-full object-contain drop-shadow-xl" />
            </div>
            <div className="h-10 w-40 relative flex items-center">
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
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isLogin ? 'Enter your details to access your workspace.' : 'Start collecting better data today.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={18} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative">
          
          {/* Registration Fields */}
          {!isLogin && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              
              {!registerOtpSent ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                    <div className="relative">
                      <input type="text" required placeholder="John Doe"
                        className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white transition-all text-sm"
                        onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Work Email</label>
                    <input type="email" required placeholder="john@company.com"
                      className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white transition-all text-sm"
                      onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number (Optional)</label>
                    <input type="tel" placeholder="+1 (555) 000-0000"
                      className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white transition-all text-sm"
                      onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                    <input type="password" required placeholder="8+ chars, 1 letter, 1 number"
                      className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white transition-all text-sm"
                      onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                </>
              ) : (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Enter Verification Code</label>
                  <p className="text-sm text-gray-500 mb-4">We sent a 6-digit code to <b>{formData.email}</b>. Check your inbox (and spam folder).</p>
                  <input type="text" required placeholder="123456" maxLength={6}
                    className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white font-mono tracking-widest transition-all text-lg text-center"
                    onChange={e => setFormData({...formData, otp: e.target.value})} />
                  <button type="button" onClick={() => { setRegisterOtpSent(false); setError(''); setSuccessMsg(''); }}
                    className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                    ← Go back and edit details
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Login Fields */}
          {isLogin && (
            <div className="space-y-5 animate-in slide-in-from-left-4 duration-300">
              
              {/* Toggle OTP vs Password */}
              <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl">
                <button type="button" onClick={() => { setLoginMethod('password'); setOtpSent(false); }} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === 'password' ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Password</button>
                <button type="button" onClick={() => setLoginMethod('otp')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === 'otp' ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Sign in with OTP</button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email or Phone Number</label>
                <input type="text" required placeholder="john@company.com or +123456" disabled={otpSent}
                  className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white transition-all text-sm disabled:opacity-60"
                  onChange={e => setFormData({...formData, identifier: e.target.value})} />
              </div>

              {loginMethod === 'password' && (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                  <input type="password" required placeholder="••••••••"
                    className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white transition-all text-sm"
                    onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              )}

              {loginMethod === 'otp' && !otpSent && (
                <button type="button" onClick={handleSendOTP} disabled={!formData.identifier || loading} className="w-full py-3 px-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-semibold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              )}

              {loginMethod === 'otp' && otpSent && (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Enter 6-digit OTP</label>
                  <input type="text" required placeholder="123456" maxLength={6}
                    className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white font-mono tracking-widest transition-all text-lg text-center"
                    onChange={e => setFormData({...formData, otp: e.target.value})} />
                  <p className="text-xs text-center mt-3 text-gray-500">OTP sent to your device. Please check your inbox or messages.</p>
                </div>
              )}
            </div>
          )}


          {(!isLogin || loginMethod === 'password' || (loginMethod === 'otp' && otpSent)) && (
            <button type="submit" disabled={loading} className="group w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70">
              {loading ? 'Processing...' : isLogin ? 'Sign In' : (registerOtpSent ? 'Verify & Create Account' : 'Create Account')}
              {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          )}
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">or</span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
          </div>
          
          <div className="flex justify-center">
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} 
              onError={(err) => {
                console.error('GoogleLogin component onError fired:', err);
                // Don't set error state here — this fires on initialization failures
                // (e.g. third-party cookies blocked). The user hasn't clicked anything yet.
              }}
            />
          </div>


        </form>
        
        <div className="mt-8 text-center border-t border-gray-100 dark:border-gray-800 pt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); setRegisterOtpSent(false); setOtpSent(false); }} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
