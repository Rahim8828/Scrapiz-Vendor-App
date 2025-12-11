import { useState, useMemo } from 'react';
import {
  Bell, Volume2, Smartphone, Briefcase, RefreshCw, CreditCard, Tag, Cog, AlertTriangle, Lock, LucideIcon
} from 'lucide-react';
import Header from './Header';

// Types and Initial Data
interface NotificationScreenProps {
  onBack: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface Setting {
  id: keyof typeof initialSettings;
  label: string;
  description: string;
  icon: LucideIcon;
  disabled?: boolean;
}

const initialSettings = {
  pushNotifications: true, soundEnabled: true, vibrationEnabled: false, newBookings: true,
  jobUpdates: true, paymentAlerts: true, promotions: false, systemUpdates: true, emergencyAlerts: true,
};

const notificationSections: { category: string; settings: Setting[] }[] = [
  {
    category: 'Primary Controls',
    settings: [
      { id: 'pushNotifications', label: 'Push Notifications', description: 'Receive all alerts on this device', icon: Bell },
      { id: 'soundEnabled', label: 'Sound', description: 'Play sound for new notifications', icon: Volume2 },
      { id: 'vibrationEnabled', label: 'Vibration', description: 'Vibrate device for new notifications', icon: Smartphone },
    ],
  },
  {
    category: 'Job & Payment Alerts',
    settings: [
      { id: 'newBookings', label: 'New Bookings', description: 'For new pickup requests', icon: Briefcase },
      { id: 'jobUpdates', label: 'Job Updates', description: 'For ongoing job status changes', icon: RefreshCw },
      { id: 'paymentAlerts', label: 'Payment Alerts', description: 'For payment confirmations', icon: CreditCard },
    ]
  },
  {
    category: 'General & System',
    settings: [
      { id: 'promotions', label: 'Promotions & Offers', description: 'Receive special deals & offers', icon: Tag },
      { id: 'systemUpdates', label: 'System Updates', description: 'App updates & maintenance notices', icon: Cog },
      { id: 'emergencyAlerts', label: 'Emergency Alerts', description: 'Critical safety information', icon: AlertTriangle, disabled: true },
    ]
  }
];

// Components
const ToggleSwitch = ({ enabled, onChange, disabled = false }: { enabled: boolean; onChange: () => void; disabled?: boolean }) => (
  <button
    type="button" role="switch" aria-checked={enabled} onClick={onChange} disabled={disabled}
    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${enabled ? 'bg-green-600' : 'bg-gray-300'}`}>
    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const NotificationRow = ({ setting, isEnabled, onToggle }: { setting: Setting; isEnabled: boolean; onToggle: () => void; }) => {
  const Icon = setting.icon;
  return (
    <div className={`flex items-center p-3 sm:p-4 gap-3 sm:gap-4 ${setting.disabled ? 'opacity-60' : ''}`}>
      <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-full ${isEnabled ? 'bg-green-100' : 'bg-gray-100'} flex-shrink-0`}>
        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${isEnabled ? 'text-green-600' : 'text-gray-500'}`} />
      </div>
      <div className="flex-grow min-w-0">
        <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{setting.label}</p>
        <p className="text-xs sm:text-sm text-gray-500 truncate">{setting.description}</p>
      </div>
      <div className="flex-shrink-0">
        {setting.disabled ? (
          <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        ) : (
          <ToggleSwitch enabled={isEnabled} onChange={onToggle} />
        )}
      </div>
    </div>
  );
};

const NotificationScreen = ({ onBack, onShowToast }: NotificationScreenProps) => {
  const [settings, setSettings] = useState(initialSettings);

  const handleToggle = (setting: Setting) => {
    if (setting.disabled) {
      onShowToast('This setting cannot be changed for security reasons', 'info');
      return;
    }
    const newValue = !settings[setting.id];
    setSettings(prev => ({ ...prev, [setting.id]: newValue }));
    onShowToast(`${setting.label} ${newValue ? 'Enabled' : 'Disabled'}`, 'success');
  };
  
  const allEnabled = useMemo(() => notificationSections.flatMap(s => s.settings).every(s => s.disabled || settings[s.id]), [settings]);

  const handleMasterToggle = () => {
    const newState = !allEnabled;
    const newSettings: typeof initialSettings = { ...settings };
    notificationSections.flatMap(s => s.settings).forEach(s => {
        if (!s.disabled) {
            newSettings[s.id] = newState;
        }
    });
    setSettings(newSettings);
    onShowToast(`All Notifications ${newState ? 'Enabled' : 'Disabled'}`, 'success');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] to-[#E8F5E8] font-sans pb-20">
      <Header title="Notification Settings" onBack={onBack} />
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6">
        {/* Master Toggle */}
        <div className="rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-full bg-green-100 flex-shrink-0">
                    <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div className="flex-grow min-w-0">
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">Enable All Notifications</p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{allEnabled ? 'All alerts are active' : 'Some alerts are disabled'}</p>
                </div>
                <div className="flex-shrink-0">
                    <ToggleSwitch enabled={allEnabled} onChange={handleMasterToggle} />
                </div>
            </div>
        </div>

        {/* Notification Sections */}
        {notificationSections.map((section) => (
          <div key={section.category}>
            <h2 className="px-1 pb-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500">{section.category}</h2>
            <div className="rounded-xl sm:rounded-2xl bg-white shadow-lg border border-gray-100 divide-y divide-gray-100">
              {section.settings.map(item => (
                <NotificationRow
                  key={item.id}
                  setting={item}
                  isEnabled={settings[item.id]}
                  onToggle={() => handleToggle(item)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationScreen;
