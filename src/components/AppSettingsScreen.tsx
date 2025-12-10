import { useState } from 'react';
import { Settings, Moon, Sun, Wifi, WifiOff, Download, Trash2, Bell, Volume2, ChevronRight } from 'lucide-react';
import Header from './Header';

interface AppSettingsScreenProps {
  onBack: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const AppSettingsScreen = ({ onBack, onShowToast }: AppSettingsScreenProps) => {
  const [settings, setSettings] = useState({
    darkMode: false,
    autoSync: true,
    offlineMode: false,
    autoUpdate: true,
    crashReporting: true,
    hapticFeedback: true,
    soundEffects: true,
    dataCompression: true
  });

  const handleToggle = (setting: keyof typeof settings, label: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    onShowToast(`${label} ${!settings[setting] ? 'enabled' : 'disabled'}`, 'success');
  };

  const handleClearCache = () => {
    onShowToast('Clearing app cache...', 'info');
    setTimeout(() => {
      onShowToast('Cache cleared successfully!', 'success');
    }, 1500);
  };

  const handleResetSettings = () => {
    // In a real app, you'd show a confirmation dialog
    const confirmed = window.confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.');
    
    if (confirmed) {
      setSettings({
        darkMode: false,
        autoSync: true,
        offlineMode: false,
        autoUpdate: true,
        crashReporting: true,
        hapticFeedback: true,
        soundEffects: true,
        dataCompression: true
      });
      onShowToast('Settings reset to default values', 'success');
    }
  };

  const settingsCategories = [
    {
      title: 'Appearance',
      items: [
        {
          key: 'darkMode' as keyof typeof settings,
          label: 'Dark Mode',
          description: 'Use dark theme throughout the app',
          icon: settings.darkMode ? Moon : Sun
        }
      ]
    },
    {
      title: 'Data & Sync',
      items: [
        {
          key: 'autoSync' as keyof typeof settings,
          label: 'Auto Sync',
          description: 'Automatically sync data when connected',
          icon: Wifi
        },
        {
          key: 'offlineMode' as keyof typeof settings,
          label: 'Offline Mode',
          description: 'Enable offline functionality',
          icon: settings.offlineMode ? WifiOff : Wifi
        },
        {
          key: 'dataCompression' as keyof typeof settings,
          label: 'Data Compression',
          description: 'Compress data to save bandwidth',
          icon: Download
        }
      ]
    },
    {
      title: 'App Behavior',
      items: [
        {
          key: 'autoUpdate' as keyof typeof settings,
          label: 'Auto Updates',
          description: 'Automatically update the app',
          icon: Download
        },
        {
          key: 'crashReporting' as keyof typeof settings,
          label: 'Crash Reporting',
          description: 'Send crash reports to improve the app',
          icon: Settings
        },
        {
          key: 'hapticFeedback' as keyof typeof settings,
          label: 'Haptic Feedback',
          description: 'Vibrate on button presses',
          icon: Bell
        },
        {
          key: 'soundEffects' as keyof typeof settings,
          label: 'Sound Effects',
          description: 'Play sounds for app interactions',
          icon: Volume2
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] to-[#E8F5E8]">
      <Header title="App Settings" onBack={onBack} />

      <div className="px-4 sm:px-6 py-6 space-y-8">
        {settingsCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all hover:scale-[1.02] duration-300">
            <div className="px-6 py-4 bg-gray-50 border-b-2 border-gray-100">
              <h3 className="font-bold text-lg text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>{category.title}</h3>
            </div>

            <div className="divide-y divide-gray-100">
              {category.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                        settings[item.key] ? 'bg-gradient-to-r from-[#28a745] to-[#20c997] text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div>
                        <p className="font-semibold text-gray-800">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggle(item.key, item.label)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#28a745] focus:ring-offset-2 ${
                        settings[item.key] ? 'bg-gradient-to-r from-[#28a745] to-[#20c997]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                          settings[item.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* App Actions */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all hover:scale-[1.02] duration-300">
           <div className="px-6 py-4 bg-gray-50 border-b-2 border-gray-100">
              <h3 className="font-bold text-lg text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>App Maintenance</h3>
            </div>

          <div className="divide-y divide-gray-100">
            <button
              onClick={handleClearCache}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 active:scale-95"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Trash2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">Clear Cache</p>
                        <p className="text-sm text-gray-500">Free up storage space</p>
                    </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400" />
            </button>

            <button
              onClick={handleResetSettings}
              className="w-full p-4 flex items-center justify-between hover:bg-red-50 transition-colors duration-200 active:scale-95"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <Settings className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-red-600">Reset Settings</p>
                        <p className="text-sm text-gray-500">Reset all settings to default</p>
                    </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center py-4">
            <p className="text-sm text-gray-500">Scrapiz Vendor App</p>
            <p className="text-lg font-semibold text-gray-700">Version 2.1.0</p>
            <p className="text-xs text-gray-400">Build 2024.01.15</p>
        </div>
      </div>
    </div>
  );
};

export default AppSettingsScreen;