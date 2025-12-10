import { useState } from 'react';
import { Check, Globe } from 'lucide-react';
import Header from './Header';

interface LanguageScreenProps {
  onBack: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const LanguageScreen = ({ onBack, onShowToast }: LanguageScreenProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  const languages = [
    { code: 'english', name: 'English', nativeName: 'English' },
    { code: 'hindi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'marathi', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'gujarati', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'tamil', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'telugu', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'kannada', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'bengali', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'punjabi', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'malayalam', name: 'Malayalam', nativeName: 'മലയാളം' },
  ];

  const handleSave = () => {
    if (!selectedLanguage) {
      onShowToast('Please select a language', 'error');
      return;
    }
    
    const languageName = languages.find(l => l.code === selectedLanguage)?.name || 'English';
    onShowToast(`Language changed to ${languageName}`, 'success');
    
    // Here you would typically save to localStorage or API
    try {
      localStorage.setItem('selectedLanguage', selectedLanguage);
    } catch (error) {
      console.warn('Could not save language preference');
    }
    
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] to-[#E8F5E8] pb-24">
      <Header title="Select Language" onBack={onBack} />

      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center gap-2 sm:gap-3 bg-white/80 p-3 sm:p-4 rounded-xl shadow-lg border border-gray-100 mb-4 sm:mb-6">
            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-[#28a745] flex-shrink-0" />
            <p className="font-medium text-gray-700 text-sm sm:text-base">Choose the language for your app experience.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => setSelectedLanguage(language.code)}
              className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 transform hover:-translate-y-1 ${ 
                selectedLanguage === language.code 
                ? 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-500' 
                : 'bg-white text-gray-800 hover:bg-green-50'
              }`}
            >
              {selectedLanguage === language.code && (
                  <div className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  </div>
              )}
              <p className={`text-lg sm:text-2xl font-bold mb-1 ${selectedLanguage === language.code ? 'text-white' : 'text-gray-600'} text-center leading-tight`}>
                {language.nativeName}
              </p>
              <p className={`font-semibold text-xs sm:text-sm ${selectedLanguage === language.code ? 'text-green-100' : 'text-gray-800'} text-center`}>
                {language.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="fixed bottom-16 sm:bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSave}
            className="w-full bg-[#28a745] text-white py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold hover:bg-[#218838] transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageScreen;