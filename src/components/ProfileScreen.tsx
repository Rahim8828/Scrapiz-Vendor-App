import { useState } from 'react';
import { User, LogOut, HelpCircle, Globe, Camera, Shield, Bell, ChevronRight, User as UserIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from './Header';

interface ProfileScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ProfileScreen = ({ onBack, onNavigate, onShowToast }: ProfileScreenProps) => {
  const { user, logout } = useAuth();
  const [profileData] = useState({
    name: user?.name || 'Nooroolhuda',
    phone: user?.phone || '+91 9967332092',
    email: 'nooroolhuda@example.com',
    address: 'Mumbai, Maharashtra'
  });

  const handleLogout = () => {
    onShowToast('Logging out...', 'info');
    setTimeout(() => {
      logout();
      onShowToast('Logged out successfully!', 'success');
    }, 1000);
  };

  const menuItems = [
    { 
      icon: UserIcon, 
      label: 'Edit Profile', 
      action: () => onNavigate('edit-profile'),
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      icon: Globe, 
      label: 'Choose Language', 
      action: () => onNavigate('language'),
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      icon: Bell, 
      label: 'Notifications', 
      action: () => onNavigate('notifications'),
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      icon: Shield, 
      label: 'Privacy & Security', 
      action: () => onNavigate('privacy'),
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      icon: HelpCircle, 
      label: 'Help & Support', 
      action: () => onNavigate('help-support'),
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] to-[#E8F5E8] pb-20">
      <Header title="My Profile" onBack={onBack} />

      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <button
                onClick={() => onShowToast('Edit profile picture', 'info')}
                className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-[#333333] mb-1 truncate">
                {profileData.name}
              </h2>
              <p className="text-[#6c757d] text-sm sm:text-base mb-1 truncate">{profileData.phone}</p>
              <p className="text-xs sm:text-sm text-[#6c757d] truncate">{profileData.email}</p>
            </div>
          </div>
        </div>




        {/* Menu Items */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.action}
                className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 transition-all duration-200 ${
                  index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                } active:bg-gray-100`}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-full flex items-center justify-center ${item.bgColor} flex-shrink-0`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
                </div>
                <span className="font-medium flex-1 text-left text-base sm:text-lg text-[#333333] min-w-0 truncate">
                  {item.label}
                </span>
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-red-50 transition-all duration-200 active:bg-red-100"
            >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-full flex items-center justify-center bg-red-100 flex-shrink-0">
                    <LogOut className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <span className="font-medium flex-1 text-left text-base sm:text-lg text-red-600 min-w-0">
                Logout
                </span>
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" />
            </button>
        </div>


        {/* App Version */}
        <div className="text-center py-4 pb-8">
          <p className="text-xs text-[#6c757d]">Scrapiz Vendor App v2.1.0</p>
          <p className="text-xs text-[#6c757d] opacity-60 mt-1">Build 2024.12.10</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;