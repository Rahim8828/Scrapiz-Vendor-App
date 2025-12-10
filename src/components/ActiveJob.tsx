import { useState } from 'react';
import { Phone, Navigation, MapPin, User, Tag, CheckCircle } from 'lucide-react';
import { ActiveJob as ActiveJobType } from '../types';
import Header from './Header';

interface ActiveJobProps {
  job: ActiveJobType;
  onStatusUpdate: (status: ActiveJobType['status']) => void;
  onCompleteJob: () => void;
  onBack: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ActiveJob = ({ job, onStatusUpdate, onCompleteJob, onBack, onShowToast }: ActiveJobProps) => {
  const [currentStatus, setCurrentStatus] = useState<ActiveJobType['status']>(job.status || 'on-the-way');
  const [isLoading, setIsLoading] = useState(false);

  const statusTimeline = [
    { value: 'on-the-way', label: 'On the Way' },
    { value: 'arrived', label: 'Arrived' },
    { value: 'in-progress', label: 'Weighing' },
    { value: 'completed', label: 'Completed' },
  ];

  const currentStatusIndex = statusTimeline.findIndex(s => s.value === currentStatus);

  const handleStatusChange = async (status: ActiveJobType['status']) => {
    try {
      setIsLoading(true);
      setCurrentStatus(status);
      onStatusUpdate(status);
      const statusLabel = statusTimeline.find(s => s.value === status)?.label;
      onShowToast(`Status updated to: ${statusLabel}!`, 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      onShowToast('Failed to update status. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = () => {
    try {
      window.location.href = `tel:${job.customerPhone}`;
    } catch (error) {
      console.error('Error making call:', error);
      onShowToast('Unable to make call. Please try again.', 'error');
    }
  };

  const handleNavigate = () => {
    try {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.address)}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening navigation:', error);
      onShowToast('Unable to open navigation. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] to-[#E8F5E8] pb-20">
      <Header title={`Job #${job.id}`} onBack={onBack} />

      <main className="px-4 sm:px-6 py-4 sm:py-6 pb-32 space-y-4 sm:space-y-6">
        {/* Map & Actions */}
        <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="h-32 sm:h-40 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center p-4 sm:p-6 text-white relative">
                <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-white/50"/>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="z-10 text-center">
                    <h2 className="font-bold text-base sm:text-lg mb-1">{job.distance} away</h2>
                    <p className="text-xs sm:text-sm opacity-90 max-w-xs mx-auto px-2">{job.address}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 bg-white">
                <ActionButton icon={Phone} label="Call Customer" onClick={handleCall} />
                <ActionButton icon={Navigation} label="Navigate" onClick={handleNavigate} isPrimary />
            </div>
        </div>

        {/* Customer & Job Info */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 space-y-4 sm:space-y-5 hover:shadow-xl transition-all duration-300">
            <InfoRow icon={User} label="Customer" value={job.customerName} />
            <InfoRow icon={Tag} label="Scrap Type" value={job.scrapType} />
            <InfoRow icon={Phone} label="Phone" value={job.customerPhone} />
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
            <h3 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6 text-gray-800">Job Progress</h3>
            <div className="space-y-3 sm:space-y-4">
                {statusTimeline.map((status, index) => (
                    <div key={status.value} className="flex items-center gap-3 sm:gap-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                            index <= currentStatusIndex ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                            {index < currentStatusIndex ? (
                                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6"/>
                            ) : (
                                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                                    index === currentStatusIndex ? 'bg-white' : 'bg-gray-400'
                                }`}></div>
                            )}
                        </div>
                        <button 
                            onClick={() => handleStatusChange(status.value as any)}
                            disabled={index < currentStatusIndex || isLoading}
                            className={`flex-1 text-left font-medium text-sm sm:text-base py-2 px-3 rounded-lg transition-all duration-200 ${
                                index <= currentStatusIndex ? 'text-gray-800' : 'text-gray-500'
                            } ${
                                index < currentStatusIndex ? 'line-through opacity-60' : ''
                            } ${
                                index > currentStatusIndex ? 'hover:bg-gray-50 active:bg-gray-100' : ''
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                            aria-label={`Update status to ${status.label}`}
                        >
                            {status.label}
                        </button>
                    </div>
                ))}
            </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200 safe-area-inset-bottom">
        <button
          onClick={onCompleteJob}
          disabled={currentStatus !== 'completed' || isLoading}
          className="w-full bg-green-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold hover:bg-green-700 transition-all active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
          aria-label="Proceed to weight entry and complete job"
        >
          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          <span>Proceed to Weight Entry</span>
        </button>
      </div>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, onClick, isPrimary = false }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 transition-all duration-200 active:scale-95 ${
      isPrimary 
        ? 'bg-green-50 text-green-600 hover:bg-green-100 border-r border-gray-200' 
        : 'hover:bg-gray-50 text-gray-700'
    }`}
    aria-label={label}
  >
    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
    <span className="font-medium text-xs sm:text-sm">{label}</span>
  </button>
);

const InfoRow = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1">{label}</p>
            <p className="font-semibold text-sm sm:text-base text-gray-800 break-words">{value}</p>
        </div>
    </div>
);

export default ActiveJob;