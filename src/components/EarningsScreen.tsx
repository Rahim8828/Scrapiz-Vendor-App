import React, { useState, useMemo, useCallback } from 'react';
import { IndianRupee, Receipt, CheckCircle, Filter, Download, BarChart2, TrendingUp, ArrowLeft } from 'lucide-react';
import { EarningsData } from '../types';

interface EarningsScreenProps {
  onBack: () => void;
}

const EarningsScreen = ({ onBack }: EarningsScreenProps) => {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate API call with potential failure
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate occasional network error (5% chance)
            if (Math.random() < 0.05) {
              reject(new Error('Failed to load earnings data'));
            } else {
              resolve(true);
            }
          }, 600);
        });
        
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsLoading(false);
      }
    };

    loadData();
  }, [activeTab]);

  // Fixed data consistency issues - unique IDs and proper date distribution
  const mockEarningsData: Record<string, EarningsData> = {
    today: {
      totalEarnings: 2450,
      totalJobs: 8,
      transactions: [
        { id: 'today_1', jobId: 'J001', amount: 850, date: new Date(Date.now() - 3600000), status: 'completed' },
        { id: 'today_2', jobId: 'J002', amount: 420, date: new Date(Date.now() - 7200000), status: 'completed' },
        { id: 'today_3', jobId: 'J003', amount: 680, date: new Date(Date.now() - 10800000), status: 'completed' },
        { id: 'today_4', jobId: 'J004', amount: 500, date: new Date(Date.now() - 14400000), status: 'completed' }
      ]
    },
    week: {
      totalEarnings: 15680,
      totalJobs: 42,
      transactions: [
        { id: 'week_1', jobId: 'J045', amount: 1200, date: new Date(Date.now() - 86400000 * 1), status: 'completed' },
        { id: 'week_2', jobId: 'J044', amount: 950, date: new Date(Date.now() - 86400000 * 2), status: 'completed' },
        { id: 'week_3', jobId: 'J043', amount: 850, date: new Date(Date.now() - 86400000 * 3), status: 'completed' },
        { id: 'week_4', jobId: 'J042', amount: 420, date: new Date(Date.now() - 86400000 * 4), status: 'completed' },
        { id: 'week_5', jobId: 'J041', amount: 680, date: new Date(Date.now() - 86400000 * 5), status: 'completed' },
        { id: 'week_6', jobId: 'J040', amount: 500, date: new Date(Date.now() - 86400000 * 6), status: 'completed' }
      ]
    },
    month: {
      totalEarnings: 68500,
      totalJobs: 185,
      transactions: [
        { id: 'month_1', jobId: 'J185', amount: 2100, date: new Date(Date.now() - 604800000), status: 'completed' },
        { id: 'month_2', jobId: 'J184', amount: 1650, date: new Date(Date.now() - 1209600000), status: 'completed' },
        { id: 'month_3', jobId: 'J183', amount: 1200, date: new Date(Date.now() - 1814400000), status: 'completed' },
        { id: 'month_4', jobId: 'J182', amount: 950, date: new Date(Date.now() - 2419200000), status: 'completed' },
        { id: 'month_5', jobId: 'J181', amount: 800, date: new Date(Date.now() - 3024000000), status: 'completed' }
      ]
    }
  };

  const currentData = mockEarningsData[activeTab];

  const formatDate = (date: Date) => {
    try {
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };
  
  const formatTime = (date: Date) => {
    try {
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Time formatting error:', error);
      return 'Invalid Time';
    }
  };

  const handleRetry = () => {
    setError(null);
    setActiveTab(activeTab); // This will trigger the useEffect
  };

  const handleDownloadReport = useCallback(() => {
    try {
      // Simulate report generation
      const reportData = {
        period: activeTab,
        totalEarnings: currentData.totalEarnings,
        totalJobs: currentData.totalJobs,
        transactions: currentData.transactions,
        generatedAt: new Date().toISOString()
      };
      
      console.log('Generating report:', reportData);
      // In a real app, this would trigger a download or API call
      alert('Report generation started! You will be notified when ready.');
    } catch (error) {
      console.error('Report generation error:', error);
      alert('Failed to generate report. Please try again.');
    }
  }, [activeTab, currentData]);

  // Memoized calculations for better performance
  const earningsStats = useMemo(() => {
    if (!currentData || currentData.totalJobs === 0) {
      return {
        avgPerJob: 0,
        growthRate: 0,
        bestDay: 0
      };
    }

    const avgPerJob = currentData.totalEarnings / currentData.totalJobs;
    
    // Calculate growth rate (mock calculation)
    const previousPeriodEarnings = activeTab === 'today' ? 2200 : activeTab === 'week' ? 14500 : 65000;
    const growthRate = ((currentData.totalEarnings - previousPeriodEarnings) / previousPeriodEarnings) * 100;
    
    // Find best transaction amount
    const bestDay = Math.max(...currentData.transactions.map(t => t.amount));

    return {
      avgPerJob: Math.round(avgPerJob),
      growthRate: Math.round(growthRate * 10) / 10,
      bestDay
    };
  }, [currentData, activeTab]);

  const tabs = [
    { key: 'today' as const, label: 'Today' },
    { key: 'week' as const, label: 'This Week' },
    { key: 'month' as const, label: 'This Month' }
  ];
  
  const StatCard = ({ icon: Icon, label, value, color, isLoading }: { icon: React.ElementType, label: string, value: string | number, color: string, isLoading: boolean }) => (
    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-gray-100 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">
      {isLoading ? (
        <div className="w-full h-16 sm:h-20 bg-gray-200 rounded-xl animate-pulse"></div>
      ) : error ? (
        <div className="w-full h-16 sm:h-20 bg-red-50 rounded-xl flex items-center justify-center">
          <span className="text-red-500 text-xs sm:text-sm">Error loading</span>
        </div>
      ) : (
        <>
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl flex items-center justify-center ${color} flex-shrink-0 shadow-md`}>
            <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-lg sm:text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs sm:text-sm text-gray-600">{label}</p>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] to-[#E8F5E8] pb-20">
      {/* Earnings Summary Header with integrated header */}
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
            My Earnings
          </h1>
          
          <div className="w-10 flex justify-end">
            <button 
              onClick={handleDownloadReport}
              disabled={isLoading || error !== null}
              className="flex items-center gap-1 sm:gap-2 text-white bg-white bg-opacity-20 hover:bg-opacity-30 disabled:bg-opacity-10 disabled:cursor-not-allowed px-2 py-1 sm:px-3 sm:py-2 rounded-lg transition-colors active:scale-95 disabled:active:scale-100"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">Report</span>
            </button>
          </div>
        </div>
        {/* Earnings Content */}
        <div className="text-center text-white">
          <p className="text-sm sm:text-lg opacity-80 mb-2">Total Earnings ({activeTab})</p>
          {isLoading ? (
             <div className="h-12 sm:h-16 bg-white bg-opacity-20 rounded-xl w-40 sm:w-48 mx-auto animate-pulse"></div>
          ) : error ? (
            <div className="text-center py-4">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-red-100">Error Loading Data</h1>
              <button 
                onClick={handleRetry}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <h1 className="text-3xl sm:text-5xl font-bold mb-3 sm:mb-4">
              ₹{currentData.totalEarnings.toLocaleString('en-IN')}
            </h1>
          )}
          
          <div className="flex justify-center bg-black bg-opacity-10 rounded-full p-1 max-w-xs sm:max-w-sm mx-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                disabled={isLoading}
                className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-4 rounded-full font-medium text-xs sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  activeTab === tab.key
                    ? 'bg-white text-[#28a745] shadow-md'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <StatCard 
            icon={CheckCircle}
            label="Completed Jobs"
            value={error ? 'Error' : currentData.totalJobs}
            color="bg-gradient-to-r from-green-400 to-green-600"
            isLoading={isLoading}
          />
          <StatCard 
            icon={BarChart2}
            label="Avg. Per Job"
            value={error ? 'Error' : `₹${earningsStats.avgPerJob}`}
            color="bg-gradient-to-r from-green-500 to-green-700"
            isLoading={isLoading}
          />
        </div>

        {/* Additional Stats Row */}
        {!isLoading && !error && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
                <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 ${earningsStats.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-lg sm:text-xl font-bold ${earningsStats.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {earningsStats.growthRate >= 0 ? '+' : ''}{earningsStats.growthRate}%
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Growth Rate</p>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300">
              <div className="mb-1">
                <span className="text-lg sm:text-xl font-bold text-green-600">₹{earningsStats.bestDay}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Best Transaction</p>
            </div>
          </div>
        )}

        {/* Transaction List */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h3 className="font-bold text-lg sm:text-xl text-gray-800">
              Transaction History
            </h3>
            <button 
              disabled={isLoading || error !== null}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-green-600 font-medium hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed transition-colors"
            >
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
          
          {isLoading ? (
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 sm:gap-4 animate-pulse">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 sm:h-5 bg-gray-200 rounded w-12 sm:w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-8 sm:w-10"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block bg-red-100 p-4 sm:p-5 rounded-full mb-4 sm:mb-6">
                <Receipt className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Failed to Load Transactions</h3>
              <p className="text-gray-500 text-xs sm:text-sm max-w-xs mx-auto mb-4">
                {error}
              </p>
              <button 
                onClick={handleRetry}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors active:scale-95"
              >
                Try Again
              </button>
            </div>
          ) : currentData.transactions.length > 0 ? (
            <>
              <div className="space-y-1 sm:space-y-2">
                {currentData.transactions.map((transaction, index) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center p-2 sm:p-3 -mx-2 sm:-mx-3 rounded-lg hover:bg-gray-50 transition-colors animate-slide-in-up border-l-2 border-transparent hover:border-green-200"
                    style={{ animationDelay: `${index * 50}ms`}}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 shadow-sm">
                        <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">Job #{transaction.jobId}</p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {formatDate(transaction.date)} at {formatTime(transaction.date)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-bold text-sm sm:text-lg text-green-600">+₹{transaction.amount.toLocaleString()}</p>
                      <span className="text-xs text-gray-500 font-medium bg-green-50 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 sm:mt-6 bg-gray-100 text-gray-700 font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-gray-200 transition-colors active:scale-95 text-sm sm:text-base">
                View All Transactions
              </button>
            </>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block bg-gray-100 p-4 sm:p-5 rounded-full mb-4 sm:mb-6">
                <Receipt className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">No Transactions Found</h3>
              <p className="text-gray-500 text-xs sm:text-sm max-w-xs mx-auto">
                Looks like there are no transactions for this period. Complete jobs to see your earnings here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EarningsScreen;