import {
  IndianRupee,
  Calendar,
  Truck,
  TrendingUp,
  Award,
  Target,
  BarChart3,
  History,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft
} from 'lucide-react';

interface ManageScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

// --- Data Structures ---

const keyMetrics = [
  {
    icon: IndianRupee,
    label: "Today's Earnings",
    value: '₹2,450',
    change: '+12%',
    changeType: 'increase',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    iconBg: 'bg-green-100',
  },
  {
    icon: Target,
    label: 'Jobs Today',
    value: '8',
    change: '+3',
    changeType: 'increase',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    iconBg: 'bg-green-100',
  },
  {
      icon: BarChart3,
      label: 'Weekly Avg.',
      value: '6.2',
      change: '-5%',
      changeType: 'decrease',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
    },
  {
    icon: Award,
    label: 'Rating',
    value: '4.8',
    change: '+0.1',
    changeType: 'increase',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    iconBg: 'bg-green-100',
  },
];

const managementTools = [
  {
    icon: TrendingUp,
    title: 'Earnings',
    subtitle: 'Income & reports',
    action: 'earnings',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    icon: History,
    title: 'Job History',
    subtitle: 'Review past jobs',
    action: 'history',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    icon: Calendar,
    title: 'Future Requests',
    subtitle: 'Scheduled pickups',
    action: 'future-requests',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    icon: Truck,
    title: 'My Vehicle',
    subtitle: 'Status & capacity',
    action: 'vehicle',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
];

// --- Sub-components ---

interface MetricCardProps {
    metric: typeof keyMetrics[0];
}

const MetricCard = ({ metric }: MetricCardProps) => {
    const Icon = metric.icon;
    const isIncrease = metric.changeType === 'increase';

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center ${metric.iconBg}`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${metric.color}`} />
                </div>
                <div className={`flex items-center text-xs sm:text-sm font-semibold px-2 py-1 rounded-full ${isIncrease ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {isIncrease ? <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> : <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
                    <span>{metric.change}</span>
                </div>
            </div>
            <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">{metric.label}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-800">{metric.value}</p>
            </div>
        </div>
    );
};

interface ToolCardProps {
    tool: typeof managementTools[0];
    onNavigate: (screen: string) => void;
}

const ToolCard = ({ tool, onNavigate }: ToolCardProps) => {
    const Icon = tool.icon;
    
    const handleClick = () => {
        try {
            onNavigate(tool.action);
        } catch (error) {
            console.error('Tool navigation error:', error);
        }
    };

    return (
        <button
            onClick={handleClick}
            className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95 shadow-lg border border-gray-100 w-full"
            aria-label={`Navigate to ${tool.title}`}
        >
            <div className="flex items-center gap-4 sm:gap-5">
                <div className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl ${tool.bgColor} ${tool.color} transition-all duration-300 group-hover:bg-green-600 group-hover:text-white flex-shrink-0`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-base sm:text-lg mb-1">{tool.title}</h3>
                    <p className="text-sm sm:text-base text-gray-500">{tool.subtitle}</p>
                </div>
            </div>
        </button>
    );
};


// --- Main Screen Component ---

const ManageScreen = ({ onBack, onNavigate }: ManageScreenProps) => {
  const handleToolNavigation = (action: string) => {
    try {
      onNavigate(action);
    } catch (error) {
      console.error('Navigation error:', error);
      // In a real app, you might show a toast or fallback
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] to-[#E8F5E8] pb-20">
      {/* Enhanced Header Section with integrated header */}
      <div className="bg-gradient-to-r from-[#28a745] to-[#20c997] px-4 sm:px-6 pt-4 pb-6 sm:pb-8 rounded-b-3xl shadow-lg">
        {/* Custom Header inside green background */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all active:scale-95 drop-shadow-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <h1 className="text-lg sm:text-xl font-bold text-white flex-1 text-center drop-shadow-sm">
            Manage
          </h1>
          
          <div className="w-10 flex justify-end">
            {/* Empty space for symmetry */}
          </div>
        </div>

        {/* Business Dashboard Content */}
        <div className="text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Business Dashboard</h2>
          <p className="text-green-100 text-sm sm:text-base opacity-90">
            Track your performance and manage your scrap collection business
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* Key Metrics Section */}
        <section>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Performance Today</h2>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {keyMetrics.map((metric, index) => (
              <div key={metric.label} style={{ animationDelay: `${index * 100}ms` }} className="animate-slide-in-up">
                <MetricCard metric={metric} />
              </div>
            ))}
          </div>
        </section>

        {/* Management Tools Section */}
        <section>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Business Tools</h2>
            <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {managementTools.length} tools
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {managementTools.map((tool, index) => (
              <div key={tool.title} style={{ animationDelay: `${index * 150}ms` }} className="animate-slide-in-up">
                <ToolCard tool={tool} onNavigate={handleToolNavigation} />
              </div>
            ))}
          </div>
        </section>


      </div>
    </div>
  );
};

export default ManageScreen;
