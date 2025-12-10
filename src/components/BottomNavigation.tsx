import { Home, IndianRupee, Clock, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'earnings', label: 'Earnings', icon: IndianRupee },
    { key: 'manage', label: 'Manage', icon: Clock },
    { key: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 ease-in-out min-w-0 flex-1 max-w-20
                ${isActive 
                  ? 'bg-green-50 text-green-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-200 ${isActive ? 'text-green-600' : ''}`} />
              <span className={`text-xs font-medium mt-1 transition-all duration-200 truncate ${
                isActive ? 'text-green-600' : 'text-gray-500'
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-green-600 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;