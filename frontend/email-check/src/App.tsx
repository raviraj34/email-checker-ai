import React, { useState, useCallback } from 'react';
import Orb from './components/background';
import Button from './components/Buttons';

// --- Type Definitions for Clarity ---
interface ValidationDetails {
  hasMx: boolean;
  isDisposable: boolean;
  provider: string;
  category: string;
}

interface ValidationResult {
  email: string;
  domain: string;
  isValid: boolean;
  details: ValidationDetails;
}


// --- Helper Icon Components ---
const MailIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LoaderIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin h-5 w-5 text-white">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const CheckCircleIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-green-500">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const AlertTriangleIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-yellow-500">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);

const XCircleIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-red-500">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" x2="9" y1="9" y2="15" />
    <line x1="9" x2="15" y1="9" y2="15" />
  </svg>
);

// --- Main App Component ---
export default function App() {
  const [email, setEmail] = useState<string>('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  /**
   * A simple email format validator using a regular expression.
   */
  const validateEmailFormat = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  /**
   * Handles the email check by calling the backend API.
   * This function is memoized with useCallback for performance.
   */
  const handleCheckEmail = useCallback(async () => {
    setError('');
    setResult(null);

    if (!validateEmailFormat(email)) {
      setError('Please enter a valid email address format.');
      return;
    }

    setIsLoading(true);

    // IMPORTANT: Replace with your backend's URL (local or deployed)
    const backendUrl = 'https://email-checker-ai-b7xr.onrender.com/api/check-email';

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An unknown error occurred.');
      }

      setResult(data as ValidationResult);

    } catch (err: any) {
      console.error("API Call Error:", err);
      setError(err.message || 'Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  /**
   * Returns the appropriate Tailwind CSS classes for the category chip.
   */
  const getCategoryChipStyle = (category: string): string => {
    switch (category) {
      case 'Business/Corporate':
        return 'bg-blue-100 text-blue-800';
      case 'Public/Personal':
        return 'bg-green-100 text-green-800';
      case 'Educational':
        return 'bg-purple-100 text-purple-800';
      case 'Disposable/Temporary':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-black text-white-500 min-h-screen flex flex-col items-center justify-center p-4 font-sans">

      <div className='absolute right-8 bottom-7'>

        <Button ></Button>
      </div>
    
      <div style={{ width: '100%', height: '600px', position: 'absolute' }}>
        <Orb
          hoverIntensity={0.5}
          rotateOnHover={true}
          hue={0}
          forceHoverState={false}
        />
      </div>

      <div className="w-full max-w-2xl mx-auto relative">
        <div className="bg-transparent rounded-xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-300 text-center">Advanced Email Checker</h1>
          <p className="text-center text-gray-400 mt-2 mb-8">Validate, categorize, and identify email providers with Gemini Ai.</p>

          <div className="relative">
            <MailIcon />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && handleCheckEmail()}
              placeholder="Enter email address..."
              className="w-full pl-10 pr-28 py-3 bg-blured-lg text-white placeholder:text-white border-gray-900  border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              disabled={isLoading}
            />
            <button
              onClick={handleCheckEmail}
              className=" absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300"
              disabled={isLoading || !email}
            >
              {isLoading ? <LoaderIcon /> : 'Check'}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
        </div>

        {result && (
          <div className=" bg-transparent backdrop-filter backdrop-blur-sm bg-opacity-60 rounded-xl shadow-lg p-6 md:p-8 mt-6 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-200 mb-4 border-b pb-3">Validation Result</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-transparent backdrop-filter backdrop-blur-sm bg-opacity-60 rounded-lg">
                <span className="font-medium text-gray-300">Email</span>
                <span className="font-mono text-gray-100 break-all text-right">{result.email}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-transparent backdrop-filter backdrop-blur-3xl bg-opacity-90 rounded-lg">
                <span className="font-medium text-gray-300">Overall Status</span>
                {result.isValid ? (
                  <span className="flex items-center font-bold text-green-600"><CheckCircleIcon /> Valid</span>
                ) : (
                  <span className="flex items-center font-bold text-red-600"><XCircleIcon /> Invalid</span>
                )}
              </div>
              <div className="flex justify-between items-center p-3 bg-transparent rounded-lg">
                <span className="font-medium text-gray-300">Category</span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryChipStyle(result.details.category)}`}>
                  {result.details.category}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-transparent rounded-lg">
                <span className="font-medium text-gray-300">Provider</span>
                <span className="font-semibold text-gray-300">{result.details.provider}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-transparent rounded-lg">
                <span className="font-medium text-gray-300">Can Receive Mail (MX)</span>
                {result.details.hasMx ? (
                  <span className="flex items-center text-green-600"><CheckCircleIcon /> Yes</span>
                ) : (
                  <span className="flex items-center text-red-600"><XCircleIcon /> No</span>
                )}
              </div>
              <div className="flex justify-between items-center p-3 bg-transparent backdrop-filter backdrop-blur-sm bg-opacity-60 rounded-lg">
                <span className="font-medium text-gray-300">Is Disposable</span>
                {result.details.isDisposable ? (
                  <span className="flex items-center text-yellow-600"><AlertTriangleIcon /> Yes</span>
                ) : (
                  <span className="flex items-center text-gray-300">No</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
    </div>
  );
}
