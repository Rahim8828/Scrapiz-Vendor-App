import {
  FileText,
  Calendar,
  Package,
  Phone,
  Wallet,
  Truck,
  Cog,
  LogOut,
  User,
  ChevronRight,
  LucideIcon
} from 'lucide-react';
import Header from './Header';

interface MoreMenuScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface MenuItem {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    action: () => void;
}

function MenuCard({ item }: { item: MenuItem }) {
    const Icon = item.icon;
    return (
        <button
            onClick={item.action}
            className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95 shadow-lg border border-gray-100"
            aria-label={`${item.title}: ${item.subtitle}`}
        >
            <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-100 text-green-600 mx-auto mb-3 sm:mb-4 transition-all duration-300 group-hover:bg-green-500 group-hover:text-white shadow-sm">
                <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm sm:text-base mb-1">{item.title}</h3>
            <p className="text-xs sm:text-sm text-gray-500">{item.subtitle}</p>
        </button>
    );
}

export default function MoreMenuScreen({ onBack, onNavigate, onShowToast }: MoreMenuScreenProps) {
  const menuItems: MenuItem[] = [
    {
      icon: Calendar,
      title: 'Future Requests',
      subtitle: 'Scheduled jobs',
      action: () => onNavigate('future-requests'),
    },
    {
      icon: Package,
      title: 'Materials',
      subtitle: 'Scrap rates',
      action: () => onNavigate('materials'),
    },
    {
      icon: Truck,
      title: 'My Vehicle',
      subtitle: 'Vehicle status',
      action: () => onNavigate('vehicle'),
    },
    {
      icon: Phone,
      title: 'Contacts',
      subtitle: 'Your customers',
      action: () => onNavigate('contacts'),
    },
    {
      icon: Wallet,
      title: 'Wallet',
      subtitle: 'Payments',
      action: () => onShowToast('Wallet feature coming soon!', 'info'),
    },
    {
      icon: FileText,
      title: 'Bills',
      subtitle: 'Manage invoices',
      action: () => onShowToast('Bills feature coming soon!', 'info'),
    },
  ];

  const handleLogout = () => {
      onShowToast("You have been logged out.", 'info');
      onBack(); 
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] to-[#E8F5E8] pb-20">
      <Header title="Menu" onBack={onBack} />

      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-green-400 to-green-600 flex items-center justify-center shadow-md flex-shrink-0">
                <User className="text-white w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">Scrapiz Vendor</h2>
                <p className="text-sm sm:text-base text-gray-500 truncate">vendor@scrapiz.com</p>
            </div>
            <button 
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                aria-label="View profile details"
            >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {menuItems.map((item, index) => (
            <MenuCard key={index} item={item} />
          ))}
        </div>
        
        {/* Settings and Logout */}
        <div className="space-y-3 sm:space-y-4">
            <button
                onClick={() => onNavigate('notifications')}
                className="w-full flex items-center p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 text-left transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95"
                aria-label="Open notification settings"
            >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <Cog className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <span className="font-medium text-gray-700 text-sm sm:text-base flex-1">Notification Settings</span>
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" />
            </button>
            <button
                onClick={handleLogout}
                className="w-full flex items-center p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 text-left transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95"
                aria-label="Logout from application"
            >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <LogOut className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                </div>
                <span className="font-medium text-red-500 text-sm sm:text-base flex-1">Logout</span>
            </button>
        </div>
      </div>
    </div>
  );
}