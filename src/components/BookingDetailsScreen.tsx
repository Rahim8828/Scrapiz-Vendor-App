import { Phone, Navigation, MapPin, IndianRupee, Clock, User, Star, Calendar, MessageCircle } from 'lucide-react';
import { BookingRequest } from '../types';
import Header from './Header';

interface BookingDetailsScreenProps {
  booking: BookingRequest;
  onBack: () => void;
  onAccept: () => void;
  onReject: () => void;
}

const BookingDetailsScreen = ({ booking, onBack, onAccept, onReject }: BookingDetailsScreenProps) => {
  const handleCall = () => {
    window.location.href = `tel:${booking.customerPhone}`;
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.address)}`;
    window.open(url, '_blank');
  };

  const handleMessage = () => {
    window.location.href = `sms:${booking.customerPhone}`;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const bookingDate = new Date(date);
    
    if (bookingDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (bookingDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    return bookingDate.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] to-[#E8F5E8] pb-20">
      <Header title="Booking Details" onBack={onBack} />

      {/* Enhanced Map Section */}
      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-green-500 to-green-600 flex flex-col justify-between p-4 sm:p-6 text-white shadow-lg overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-20 h-20 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-4 right-4 w-16 h-16 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{booking.distance}</h2>
            <p className="text-sm opacity-90">Away from you</p>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
            <Star size={16} className="text-white" />
            <span className="text-sm font-medium">New Request</span>
          </div>
        </div>
        
        <div className="relative z-10 text-center">
          <MapPin className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 opacity-80" />
          <p className="font-semibold text-base sm:text-lg line-clamp-2">{booking.address}</p>
          <p className="text-xs sm:text-sm opacity-90 mt-1">Customer Location</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Customer Details */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100">
          <h3 className="font-bold text-lg sm:text-xl text-[#333333] mb-4 flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            Customer Information
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-[#6c757d] text-sm sm:text-base">Name</span>
              <span className="font-semibold text-[#333333] text-sm sm:text-base">{booking.customerName}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#6c757d] text-sm sm:text-base">Phone</span>
              <button 
                onClick={handleCall}
                className="font-semibold text-green-600 hover:text-green-700 transition-colors text-sm sm:text-base underline decoration-dotted"
                aria-label={`Call ${booking.customerName}`}
              >
                {booking.customerPhone}
              </button>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100">
          <h3 className="font-bold text-lg sm:text-xl text-[#333333] mb-4 flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            Job Details
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-[#6c757d] text-sm sm:text-base">Scrap Type</span>
              <span className="font-semibold text-[#333333] text-sm sm:text-base capitalize">{booking.scrapType}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-[#6c757d] text-sm sm:text-base">Date</span>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="font-semibold text-[#333333] text-sm sm:text-base">
                  {formatDate(booking.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-[#6c757d] text-sm sm:text-base">Payment</span>
              <span className="font-semibold text-[#333333] text-sm sm:text-base capitalize">{booking.paymentMode}</span>
            </div>
            
            {/* Highlighted Amount Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-green-700 font-medium text-sm sm:text-base">Estimated Amount</span>
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  <span className="font-bold text-xl sm:text-2xl text-green-600">₹{booking.estimatedAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <p className="text-xs text-green-600 mt-1 opacity-80">Final amount may vary based on actual weight</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <button
            onClick={handleCall}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 bg-green-500 text-white py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:bg-green-600 transition-all active:scale-95"
            aria-label={`Call ${booking.customerName}`}
          >
            <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Call</span>
          </button>
          <button
            onClick={handleMessage}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 bg-green-600 text-white py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:bg-green-700 transition-all active:scale-95"
            aria-label={`Message ${booking.customerName}`}
          >
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Message</span>
          </button>
          <button
            onClick={handleNavigate}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 bg-green-700 text-white py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:bg-green-800 transition-all active:scale-95"
            aria-label="Navigate to customer location"
          >
            <Navigation className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Navigate</span>
          </button>
        </div>

        {/* Accept/Reject Action Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6">
          <button
            onClick={onReject}
            className="py-4 sm:py-5 border-2 border-gray-300 text-gray-600 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-50 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Reject this booking request"
          >
            Reject
          </button>
          <button
            onClick={onAccept}
            className="py-4 sm:py-5 bg-green-500 text-white rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:bg-green-600 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-300"
            aria-label="Accept this booking request"
          >
            Accept Job
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsScreen;