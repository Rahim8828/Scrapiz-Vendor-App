import { useState, useMemo } from 'react';
import { Search, Calendar, Clock, ChevronRight } from 'lucide-react';
import { FutureRequest } from '../types';
import Header from './Header';

interface FutureRequestsScreenProps {
  onBack: () => void;
  onRequestSelect: (request: FutureRequest) => void;
}

const FutureRequestsScreen = ({ onBack, onRequestSelect }: FutureRequestsScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [futureRequests] = useState<FutureRequest[]>([
    {
      id: '1',
      scrapType: 'Mixed Scrap',
      distance: '2.1 km',
      customerName: 'Manjiri Mad',
      customerPhone: '+91 98765 43210',
      address: 'E3-101 MM Landmark CHSL, Jogeshwari East, Mumbai 400093',
      paymentMode: 'Cash',
      estimatedAmount: 650,
      createdAt: new Date(),
      scheduledDate: new Date(Date.now() + 86400000), // Tomorrow
      scheduledTime: '10:00 AM',
      isConfirmed: false
    },
    {
      id: '2',
      scrapType: 'Paper & Electronics',
      distance: '3.5 km',
      customerName: 'Farzeen Kochhar',
      customerPhone: '+91 87654 32109',
      address: '103, 1st floor, Sai Krishna Kunj, Andheri West, Mumbai',
      paymentMode: 'Digital',
      estimatedAmount: 890,
      createdAt: new Date(),
      scheduledDate: new Date(Date.now() + 172800000), // 2 days from now
      scheduledTime: '2:30 PM',
      isConfirmed: true
    },
    {
        id: '3',
        scrapType: 'Metals',
        distance: '1.2 km',
        customerName: 'Aarav Sharma',
        customerPhone: '+91 99887 76655',
        address: 'B- Wing, Flat 502, Green Meadows, Lokhandwala, Andheri West',
        paymentMode: 'Cash',
        estimatedAmount: 1200,
        createdAt: new Date(),
        scheduledDate: new Date(Date.now() + 172800000), // 2 days from now
        scheduledTime: '11:00 AM',
        isConfirmed: false
      },
  ]);

  const filteredRequests = useMemo(() => futureRequests.filter(request =>
    request.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.scrapType.toLowerCase().includes(searchQuery.toLowerCase())
  ), [futureRequests, searchQuery]);

  const groupedRequests = useMemo(() => {
    return filteredRequests.reduce((acc, request) => {
      const date = request.scheduledDate.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(request);
      return acc;
    }, {} as Record<string, FutureRequest[]>);
  }, [filteredRequests]);

  const sortedGroupedRequests = Object.keys(groupedRequests).sort();

  const formatDate = (date: Date, format: 'full' | 'short') => {
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    
    if (format === 'short') {
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    }
    
    return date.toLocaleDateString('en-IN', options);
  };

  const RequestCard = ({ request }: { request: FutureRequest }) => (
    <button 
      onClick={() => onRequestSelect(request)} 
      className="w-full bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-gray-100 hover:shadow-xl hover:border-green-300 transition-all duration-300 ease-in-out transform hover:-translate-y-1 active:scale-[0.98]"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${
          request.isConfirmed ? 'bg-green-100' : 'bg-yellow-100'
        }`}>
            <span className="text-xs sm:text-sm font-bold text-gray-700">{formatDate(request.scheduledDate, 'short').split(' ')[1]}</span>
            <span className="text-sm sm:text-lg font-bold text-green-700">{formatDate(request.scheduledDate, 'short').split(' ')[0]}</span>
        </div>
        
        <div className="flex-1 text-left min-w-0">
            <div className="flex items-start justify-between mb-1">
                <h3 className="font-bold text-gray-800 text-sm sm:text-lg truncate pr-2">{request.customerName}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                  request.isConfirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                    {request.isConfirmed ? 'Confirmed' : 'Pending'}
                </span>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-500 mb-2 truncate">{request.address}</p>
            <p className="text-xs text-gray-400 mb-2">{request.scrapType}</p>
            
            <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{request.scheduledTime}</span>
                </div>
                <span className="font-bold text-sm sm:text-lg text-green-600">₹{request.estimatedAmount.toLocaleString()}</span>
            </div>
        </div>
        <div className="flex items-center h-full flex-shrink-0">
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"/>
        </div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] to-[#E8F5E8] pb-20">
      <Header title="Future Requests" onBack={onBack} />

      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="relative mb-4 sm:mb-6">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, address, or scrap type"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl sm:rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow shadow-lg text-sm sm:text-base"
          />
        </div>

        {filteredRequests.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {sortedGroupedRequests.map(date => (
                <div key={date}>
                    <h2 className="font-bold text-lg sm:text-xl text-gray-700 mb-2 sm:mb-3">{formatDate(new Date(date), 'full')}</h2>
                    <div className="space-y-2 sm:space-y-3">
                        {groupedRequests[date].map(request => (
                            <RequestCard key={request.id} request={request} />
                        ))}
                    </div>
                </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4">
            <div className="inline-block bg-green-100 p-5 rounded-full">
                <Calendar className="w-16 h-16 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mt-6">No Future Requests Found</h3>
            <p className="text-gray-500 mt-2">
              {searchQuery ? `No requests match "${searchQuery}"` : 'New scheduled pickups will appear here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FutureRequestsScreen;