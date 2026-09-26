import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({ role: '', goal: '', companySize: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/auth/onboarding', { answers });
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to save onboarding data');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-[#111113] rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 transition-all">
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full mb-10 overflow-hidden">
          <div className="bg-indigo-600 h-full transition-all duration-500 ease-out" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Formify! 👋</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Let's personalize your experience. How do you plan to use Formify?</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Education & Teaching', 'Business & HR', 'Personal Use', 'Developer/IT'].map(role => (
                <button 
                  key={role}
                  onClick={() => setAnswers({ ...answers, role })}
                  className={`p-6 border-2 rounded-2xl text-left transition-all ${answers.role === role ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-gray-700'}`}
                >
                  <h3 className={`font-semibold ${answers.role === role ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>{role}</h3>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">What is your main goal? 🎯</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">This helps us recommend the best templates.</p>
            
            <div className="grid grid-cols-1 gap-4">
              {['Creating Student Quizzes', 'Collecting Customer Feedback', 'Event Registrations', 'Other'].map(goal => (
                <button 
                  key={goal}
                  onClick={() => setAnswers({ ...answers, goal })}
                  className={`p-5 border-2 rounded-2xl text-left transition-all ${answers.goal === goal ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-gray-700'}`}
                >
                  <h3 className={`font-semibold ${answers.goal === goal ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>{goal}</h3>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Almost done! 🚀</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">What is your team or organization size?</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Just me', '2-10', '11-50', '50+'].map(size => (
                <button 
                  key={size}
                  onClick={() => setAnswers({ ...answers, companySize: size })}
                  className={`p-4 border-2 rounded-2xl text-center transition-all ${answers.companySize === size ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-gray-700'}`}
                >
                  <h3 className={`font-semibold ${answers.companySize === size ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>{size}</h3>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 flex justify-between items-center">
          <button 
            onClick={() => setStep(step - 1)} 
            disabled={step === 1}
            className={`font-medium ${step === 1 ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Back
          </button>
          
          <button 
            onClick={handleNext}
            disabled={
              (step === 1 && !answers.role) || 
              (step === 2 && !answers.goal) || 
              (step === 3 && !answers.companySize) || 
              loading
            }
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            {loading ? 'Saving...' : step === 3 ? 'Get Started' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
