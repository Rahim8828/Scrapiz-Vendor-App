import { useState } from 'react';
import { Shield, Lock, MapPin, Phone, User } from 'lucide-react';
import Header from './Header';

interface PrivacyScreenProps {
  onBack: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const PrivacyScreen = ({ onBack, onShowToast }: PrivacyScreenProps) => {
  const [settings, setSettings] = useState({
    locationSharing: true,
    profileVisibility: true,
    phoneNumberVisible: false,
    dataCollection: true,
    analyticsSharing: false,
    thirdPartySharing: false,
    biometricAuth: false,
    twoFactorAuth: false
  });

  const handleToggle = (setting: keyof typeof settings, label: string) => {
    // Check if this is a required setting that's currently enabled
    const isRequired = privacyCategories
      .flatMap(cat => cat.items)
      .find(item => item.key === setting)?.required;
    
    if (isRequired && settings[setting]) {
      onShowToast('This setting is required and cannot be disabled', 'info');
      return;
    }

    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    onShowToast(`${label} ${!settings[setting] ? 'enabled' : 'disabled'}`, 'success');
  };

  const handleChangePassword = () => {
    onShowToast('Password change feature coming soon!', 'info');
  };

  const handleDataDownload = () => {
    onShowToast('Preparing your data for download...', 'info');
    setTimeout(() => {
      onShowToast('Data download link sent to your email!', 'success');
    }, 2000);
  };

  const handleDeleteAccount = () => {
    onShowToast('Account deletion requires verification. Contact support.', 'info');
  };

  const privacyCategories = [
    {
      title: 'Location & Visibility',
      items: [
        {
          key: 'locationSharing' as keyof typeof settings,
          label: 'Location Sharing',
          description: 'Share your location for job assignments',
          icon: MapPin,
          required: true
        },
        {
          key: 'profileVisibility' as keyof typeof settings,
          label: 'Profile Visibility',
          description: 'Make your profile visible to customers',
          icon: User
        },
        {
          key: 'phoneNumberVisible' as keyof typeof settings,
          label: 'Phone Number Visibility',
          description: 'Show phone number to customers',
          icon: Phone
        }
      ]
    },
    {
      title: 'Data & Analytics',
      items: [
        {
          key: 'dataCollection' as keyof typeof settings,
          label: 'Data Collection',
          description: 'Allow app to collect usage data',
          icon: Shield
        },
        {
          key: 'analyticsSharing' as keyof typeof settings,
          label: 'Analytics Sharing',
          description: 'Share anonymous analytics data',
          icon: Shield
        },
        {
          key: 'thirdPartySharing' as keyof typeof settings,
          label: 'Third-party Sharing',
          description: 'Share data with partner services',
          icon: Shield
        }
      ]
    },
    {
      title: 'Security',
      items: [
        {
          key: 'biometricAuth' as keyof typeof settings,
          label: 'Biometric Authentication',
          description: 'Use fingerprint or face unlock',
          icon: Lock
        },
        {
          key: 'twoFactorAuth' as keyof typeof settings,
          label: 'Two-Factor Authentication',
          description: 'Add extra security to your account',
          icon: Lock
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] to-[#E8F5E8] pb-20">
      <Header title="Privacy & Security" onBack={onBack} />

      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {privacyCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 border-b">
              <h3 className="font-semibold text-[#333333] text-sm sm:text-base">{category.title}</h3>
            </div>

            <div className="divide-y divide-gray-100">
              {category.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-full flex items-center justify-center flex-shrink-0 ${
                      settings[item.key] ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-[#333333] text-sm sm:text-base truncate">{item.label}</p>
                        {item.required && (
                          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full flex-shrink-0">Required</span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[#6c757d] truncate">{item.description}</p>
                    </div>

                    <button
                      onClick={() => handleToggle(item.key, item.label)}
                      disabled={item.required && settings[item.key]}
                      className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#28a745] focus:ring-offset-2 flex-shrink-0 ${
                        settings[item.key] ? 'bg-[#28a745]' : 'bg-gray-200'
                      } ${item.required && settings[item.key] ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          settings[item.key] ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Account Actions */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 border-b">
            <h3 className="font-semibold text-[#333333] text-sm sm:text-base">Account Actions</h3>
          </div>

          <div className="divide-y divide-gray-100">
            <button
              onClick={handleChangePassword}
              className="w-full p-3 sm:p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors active:scale-95"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-[#333333] text-sm sm:text-base truncate">Change Password</p>
                <p className="text-xs sm:text-sm text-[#6c757d] truncate">Update your account password</p>
              </div>
            </button>

            <button
              onClick={handleDataDownload}
              className="w-full p-3 sm:p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors active:scale-95"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-[#333333] text-sm sm:text-base truncate">Download My Data</p>
                <p className="text-xs sm:text-sm text-[#6c757d] truncate">Get a copy of your personal data</p>
              </div>
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full p-3 sm:p-4 flex items-center gap-3 hover:bg-red-50 transition-colors active:scale-95"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg sm:rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-red-600 text-sm sm:text-base truncate">Delete Account</p>
                <p className="text-xs sm:text-sm text-[#6c757d] truncate">Permanently delete your account</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyScreen;