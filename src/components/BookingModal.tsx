import { useState, useEffect } from 'react';
import { X, MapPin, IndianRupee, User, Check } from 'lucide-react';
import { BookingRequest } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
}

const BookingModal = ({ isOpen, onClose, onAccept, onReject }: BookingModalProps) => {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(60);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onReject();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onReject]);

  if (!isOpen) return null;

  const mockBooking: BookingRequest = {
    id: '1',
    scrapType: 'Mixed Scrap',
    distance: '1.8 km away',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98765 43210',
    address: 'Shop No. 45, MG Road, Bangalore',
    paymentMode: 'Cash',
    estimatedAmount: 850,
    createdAt: new Date()
  };

  const progress = (countdown / 60) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm mx-auto transform transition-all duration-300 scale-95 animate-scale-in">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-green-600 to-green-700 rounded-t-2xl sm:rounded-t-3xl p-4 sm:p-6 text-center overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/5 rounded-full"></div>
          
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-green-200 hover:text-white transition-colors z-10 p-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle className="text-white/10" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
              <circle
                className="text-white transition-all duration-1000 ease-linear"
                strokeWidth="8"
                strokeDasharray={`${(progress * 282.7) / 100}, 282.7`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="45" cx="50" cy="50"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white text-2xl sm:text-3xl font-bold">{countdown}</span>
                <span className="text-green-100 text-xs">secs</span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
            New Pickup Request
          </h2>
          <p className="text-green-100 text-sm sm:text-base">A new job is available near you!</p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            <div>
                <h3 className="text-xs text-gray-400 uppercase font-semibold mb-2 sm:mb-3">Customer Details</h3>
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-600"/>
                    </div>
                    <p className="font-medium text-sm sm:text-base text-gray-800 truncate">{mockBooking.customerName}</p>
                </div>
            </div>

            <div>
                 <h3 className="text-xs text-gray-400 uppercase font-semibold mb-2 sm:mb-3">Location</h3>
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base text-gray-800 break-words">{mockBooking.address}</p>
                      <p className="text-xs sm:text-sm text-green-600 font-semibold mt-1">{mockBooking.distance}</p>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100"></div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 rounded-lg sm:rounded-xl">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"/>
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm text-green-800 font-medium">Estimated Amount</p>
                        <p className="font-bold text-lg sm:text-xl text-green-700">₹{mockBooking.estimatedAmount}</p>
                    </div>
                </div>
                <div className="text-left sm:text-right">
                    <p className="text-xs sm:text-sm text-gray-500">Payment via</p>
                    <p className="font-semibold text-sm sm:text-base text-gray-800">{mockBooking.paymentMode}</p>
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-5 bg-gray-50 rounded-b-2xl sm:rounded-b-3xl">
            <button
              onClick={onReject}
              className="w-full py-3 sm:py-4 bg-white border-2 border-gray-200 text-gray-600 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base
                         hover:bg-red-50 hover:border-red-200 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200
                         flex items-center justify-center gap-2 active:scale-95"
              aria-label="Decline booking request"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5"/>
              <span>Decline</span>
            </button>
            <button
              onClick={onAccept}
              className="w-full py-3 sm:py-4 bg-green-500 text-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base
                         hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 transition-all duration-200
                         flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-95"
              aria-label="Accept booking request"
            >
              <Check className="w-4 h-4 sm:w-5 sm:h-5"/>
              <span>Accept</span>
            </button>
          </div>
      </div>
    </div>
  );
};

export default BookingModal;