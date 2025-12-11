import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, Clock, Calendar, Search } from 'lucide-react';
import { BookingRequest } from '../types';
import Header from './Header';

interface HistoryScreenProps {
  onBack: () => void;
}

const HistoryScreen = ({ onBack }: HistoryScreenProps) => {
    const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
    const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [filter, searchQuery]);

  const mockHistory: (BookingRequest & { status: 'completed' | 'cancelled'; completedAt: Date; totalAmount: number })[] = [
    {
        id: '1',
        scrapType: 'Mixed Scrap',
        distance: '2.5 km',
        customerName: 'Priya Sharma',
        customerPhone: '+91 98765 43210',
        address: 'Shop No. 45, MG Road, Bangalore',
        paymentMode: 'Cash',
        estimatedAmount: 850,
        createdAt: new Date(Date.now() - 86400000),
        status: 'completed',
        completedAt: new Date(Date.now() - 82800000),
        totalAmount: 850
      },
      {
        id: '2',
        scrapType: 'Paper & Cardboard',
        distance: '1.8 km',
        customerName: 'Amit Patel',
        customerPhone: '+91 87654 32109',
        address: 'House No. 123, Sector 15, Noida',
        paymentMode: 'Digital',
        estimatedAmount: 420,
        createdAt: new Date(Date.now() - 172800000),
        status: 'completed',
        completedAt: new Date(Date.now() - 169200000),
        totalAmount: 420
      },
      {
        id: '3',
        scrapType: 'Electronic Waste',
        distance: '3.2 km',
        customerName: 'Sunita Reddy',
        customerPhone: '+91 76543 21098',
        address: 'Flat 501, Green Valley, Hyderabad',
        paymentMode: 'Cash',
        estimatedAmount: 1200,
        createdAt: new Date(Date.now() - 259200000),
        status: 'cancelled',
        completedAt: new Date(Date.now() - 255600000),
        totalAmount: 0
      }
  ];

  const filteredHistory = useMemo(() => mockHistory
    .filter(job => filter === 'all' || job.status === filter)
    .filter(job => 
        job.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.scrapType.toLowerCase().includes(searchQuery.toLowerCase())
    ), [filter, searchQuery]);

    const formatDate = (date: Date) => date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const JobCard = ({ job }: { job: (typeof mockHistory)[0] }) => (
    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`mt-1 w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-lg sm:rounded-full flex items-center justify-center ${
          job.status === 'completed' ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {job.status === 'completed' 
            ? <CheckCircle className="w-5 h-5 sm:w-7 sm:h-7 text-green-600" /> 
            : <XCircle className="w-5 h-5 sm:w-7 sm:h-7 text-red-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-gray-800 text-sm sm:text-lg truncate pr-2">{job.customerName}</h3>
            <span className={`font-bold text-sm sm:text-lg flex-shrink-0 ${
              job.status === 'completed' ? 'text-green-600' : 'text-red-600'
            }`}>
              {job.status === 'completed' ? `₹${job.totalAmount.toLocaleString()}` : 'Cancelled'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 truncate mb-2">{job.address}</p>
          <p className="text-xs text-gray-400 mb-2">{job.scrapType}</p>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-1 sm:gap-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"/>
                <span className="truncate">{formatDate(job.completedAt)}</span>
            </div>
            <span className="font-medium text-gray-500 flex-shrink-0">#{job.id}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] to-[#E8F5E8] pb-20">
      <Header title="Job History" onBack={onBack} />

      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="relative mb-4 sm:mb-6">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, address, or scrap..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl sm:rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow shadow-lg text-sm sm:text-base"
          />
        </div>

        <div className="flex bg-gray-100 rounded-xl sm:rounded-full p-1 mb-4 sm:mb-6 shadow-sm">
          {[
            { key: 'all' as const, label: 'All' },
            { key: 'completed' as const, label: 'Completed' },
            { key: 'cancelled' as const, label: 'Cancelled' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { 
                setFilter(tab.key); 
                setIsLoading(true); 
              }}
              className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg sm:rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 ${
                filter === tab.key 
                  ? 'bg-green-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 w-12 h-12 rounded-full bg-gray-200"></div>
                        <div className="flex-1">
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-px bg-gray-100 w-full mb-3"></div>
                            <div className="flex justify-between">
                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
          </div>
        ) : filteredHistory.length > 0 ? (
          <div className="space-y-4 pb-20">
            {filteredHistory.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        ) : (
          <div className="text-center py-20 px-4">
            <div className="inline-block bg-gray-200 p-5 rounded-full">
                <Clock className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mt-6">No Job History</h3>
            <p className="text-gray-500 mt-2">
              {searchQuery ? `No jobs match \"${searchQuery}\"` : 'Completed or cancelled jobs will appear here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryScreen;
