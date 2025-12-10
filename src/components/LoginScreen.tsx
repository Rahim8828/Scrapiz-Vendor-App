import React, { useState, useEffect } from 'react';
import { ChevronRight, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { login, isLoading } = useAuth();

  // Clear error when user starts typing
  useEffect(() => {
    if (isTyping && error) {
      setError('');
    }
  }, [isTyping, error]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPhone(value);
    setIsTyping(true);
    setSuccess('');
    
    // Auto-format phone number display
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsTyping(false);
    
    const isValidPhone = phone.length === 10 && /^\d{10}$/.test(phone);
    
    if (!isValidPhone) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    try {
      await login(phone);
      setSuccess('OTP sent successfully! Check your messages.');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    }
  };

  const formatPhoneDisplay = (value: string) => {
    if (value.length <= 5) return value;
    return `${value.slice(0, 5)} ${value.slice(5)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F5E8] via-[#F0F9F0] to-white flex flex-col justify-center px-3 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements - responsive */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-[#28a745] opacity-5 rounded-full"></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-[#20c997] opacity-5 rounded-full"></div>
      </div>
      
      <div className="w-full max-w-sm sm:max-w-md mx-auto relative z-10 py-4 sm:py-0">
        {/* Header - Mobile optimized */}
        <div className="text-center mb-6 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 bg-gradient-to-r from-[#28a745] to-[#20c997] rounded-full shadow-2xl mb-4 sm:mb-6 transform hover:scale-105 transition-transform duration-300">
            <span className="text-white font-bold text-2xl sm:text-3xl lg:text-4xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
              S
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 tracking-tight mb-1 sm:mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Scrapiz
          </h1>
          <p className="text-lg sm:text-xl font-medium text-[#28a745] mb-1 sm:mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Scrapiz Partner App
          </p>
          <p className="text-gray-600 text-base sm:text-lg px-2">Welcome back! Ready to earn?</p>
        </div>

        {/* Login Form Card - Mobile optimized */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/20 transform transition-all hover:shadow-3xl duration-500 mx-1 sm:mx-0">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Quick Login
            </h2>
            <p className="text-gray-600 text-sm sm:text-base px-2">Enter your mobile number for instant access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="relative">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-600 font-medium text-base sm:text-lg">🇮🇳 +91</span>
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={formatPhoneDisplay(phone)}
                  onChange={handlePhoneChange}
                  placeholder="98765 43210"
                  inputMode="numeric"
                  autoComplete="tel"
                  className={`w-full pl-20 sm:pl-24 lg:pl-28 pr-12 sm:pr-14 py-3 sm:py-4 bg-gray-50/50 border-2 rounded-xl sm:rounded-2xl text-lg sm:text-xl font-medium transition-all duration-300 text-gray-800 placeholder-gray-400 tracking-wider focus:outline-none focus:ring-4 ${
                    error 
                      ? 'border-red-400 focus:ring-red-100 focus:border-red-500 bg-red-50/50' 
                      : success
                      ? 'border-green-400 focus:ring-green-100 focus:border-green-500 bg-green-50/50'
                      : phone.length === 10
                      ? 'border-[#28a745] focus:ring-[#28a745]/20 focus:border-[#28a745] bg-green-50/30'
                      : 'border-gray-300 focus:ring-[#28a745]/20 focus:border-[#28a745] hover:border-gray-400'
                  }`}
                  maxLength={11} // Account for space in formatting
                />
                {phone.length === 10 && !error && (
                  <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center">
                    <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-green-500" />
                  </div>
                )}
              </div>
              
              {/* Progress indicator - Mobile optimized */}
              <div className="mt-2 sm:mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span className="font-medium">{phone.length}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div 
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                      phone.length === 10 ? 'bg-green-500' : 'bg-[#28a745]'
                    }`}
                    style={{ width: `${(phone.length / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              {error && (
                <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl">
                  <p className="text-red-600 text-xs sm:text-sm font-medium flex items-start gap-2">
                    <span className="w-3 sm:w-4 h-3 sm:h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">!</span>
                    </span>
                    <span className="leading-tight">{error}</span>
                  </p>
                </div>
              )}

              {success && (
                <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl">
                  <p className="text-green-600 text-xs sm:text-sm font-medium flex items-start gap-2">
                    <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0 mt-0.5" />
                    <span className="leading-tight">{success}</span>
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={phone.length !== 10 || isLoading}
              className={`w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 focus:outline-none focus:ring-4 touch-manipulation ${
                phone.length === 10 && !isLoading
                  ? 'bg-gradient-to-r from-[#28a745] to-[#20c997] text-white shadow-lg hover:shadow-2xl active:scale-95 sm:hover:-translate-y-1 focus:ring-[#28a745]/30 sm:transform sm:hover:scale-[1.02]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
              }`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 sm:w-6 h-5 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Sending OTP...</span>
                  <span className="sm:hidden">Sending...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 sm:w-6 h-5 sm:h-6" />
                  <span className="hidden sm:inline">Send Secure OTP</span>
                  <span className="sm:hidden">Send OTP</span>
                  <ChevronRight className="w-5 sm:w-6 h-5 sm:h-6" />
                </>
              )}
            </button>

            {/* Security note - Mobile optimized */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mt-3 sm:mt-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-800 font-medium text-xs sm:text-sm">Secure & Fast</p>
                  <p className="text-blue-600 text-xs mt-1 leading-relaxed">
                    Your number is encrypted and we'll send you a 6-digit OTP for verification
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Mobile optimized */}
        <div className="mt-6 sm:mt-8 text-center px-2">
          <p className="text-xs text-gray-500 px-2 sm:px-4 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="#" className="font-semibold text-[#28a745] hover:underline hover:text-[#20c997] transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-semibold text-[#28a745] hover:underline hover:text-[#20c997] transition-colors">
              Privacy Policy
            </a>
          </p>
          
          <div className="mt-4 sm:mt-6 flex items-center justify-center gap-3 sm:gap-4 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1">
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs">Secure</span>
            </span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs">Fast OTP</span>
            </span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-purple-500 rounded-full"></div>
              <span className="text-xs">24/7 Support</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;