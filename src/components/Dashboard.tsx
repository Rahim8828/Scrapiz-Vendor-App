import React, { useState, useEffect, useCallback } from 'react';
import { Bell, MapPin, Clock, IndianRupee, TrendingUp, RefreshCw, Zap, Award, Target, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { BookingRequest } from '../types';

interface DashboardProps {
  onBookingSelect: (booking: BookingRequest) => void;
  onShowNotification: () => void;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBookingSelect, onShowNotification, onShowToast }) => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationCount, setNotificationCount] = useState(3);
  const [bookings] = useState<BookingRequest[]>([
    {
      id: '1',
      scrapType: 'Mixed Scrap',
      distance: '2.5 km',
      customerName: 'Rajesh Kumar',
      customerPhone: '+91 9876543210',
      address: '123 MG Road, Bangalore',
      paymentMode: 'Cash',
      estimatedAmount: 450,
      createdAt: new Date()
    },
    {
      id: '2',
      scrapType: 'Paper & Cardboard',
      distance: '1.8 km',
      customerName: 'Priya Sharma',
      customerPhone: '+91 9876543211',
      address: '456 Brigade Road, Bangalore',
      paymentMode: 'UPI',
      estimatedAmount: 320,
      createdAt: new Date()
    },
    {
      id: '3',
      scrapType: 'Electronic Waste',
      distance: '3.2 km',
      customerName: 'Amit Patel',
      customerPhone: '+91 9876543212',
      address: '789 Koramangala, Bangalore',
      paymentMode: 'Digital',
      estimatedAmount: 680,
      createdAt: new Date()
    }
  ]);

  const todaysEarnings = 2850;
  const todaysJobs = 8;
  const weeklyTarget = 15000;
  const currentWeekEarnings = 12400;

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleOnline = () => {
    try {
      setIsOnline(!isOnline);
      onShowToast(
        isOnline ? 'You are now offline' : 'You are now online and ready to receive bookings!',
        'success'
      );
    } catch (error) {
      console.error('Error toggling online status:', error);
      onShowToast('Failed to update status. Please try again.', 'error');
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes
    
    setIsRefreshing(true);
    try {
      // Simulate API call with potential failure
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate occasional network error (5% chance)
          if (Math.random() < 0.05) {
            reject(new Error('Network error'));
          } else {
            resolve(true);
          }
        }, 1500);
      });
      
      onShowToast('Bookings refreshed!', 'success');
    } catch (error) {
      console.error('Error refreshing bookings:', error);
      onShowToast('Failed to refresh bookings. Please check your connection.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleNotificationClick = () => {
    try {
      onShowNotification();
      // Reset notification count when opened
      setNotificationCount(0);
    } catch (error) {
      console.error('Error opening notifications:', error);
      onShowToast('Failed to open notifications', 'error');
    }
  };

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const formatTime = useCallback((date: Date) => {
    try {
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Time';
    }
  }, []);

  const progressPercentage = weeklyTarget > 0 ? Math.min((currentWeekEarnings / weeklyTarget) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] to-[#E8F5E8] pb-20">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-r from-[#28a745] to-[#20c997] shadow-lg px-4 sm:px-6 py-6 sm:py-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex-1 pr-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 leading-tight">
              {getGreeting()}, {user?.name || 'Vendor'}! 👋
            </h1>
            <p className="text-green-100 text-xs sm:text-sm flex items-center gap-2 flex-wrap">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>{formatTime(currentTime)}</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-xs sm:text-sm">Ready to collect scrap today?</span>
            </p>
          </div>
          <button
            onClick={handleNotificationClick}
            className="relative p-2 sm:p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all active:scale-95 flex-shrink-0"
            aria-label={`Notifications ${notificationCount > 0 ? `(${notificationCount} new)` : ''}`}
          >
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            {notificationCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">{notificationCount > 9 ? '9+' : notificationCount}</span>
              </div>
            )}
          </button>
        </div>

        {/* Enhanced Online/Offline Toggle */}
        <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-white border-opacity-20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${isOnline ? 'bg-yellow-300' : 'bg-gray-300'} animate-pulse flex-shrink-0`} />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-white text-base sm:text-lg block">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                <p className="text-green-100 text-xs sm:text-sm truncate">
                  {isOnline ? 'Receiving new bookings' : 'Not receiving bookings'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleOnline}
              className={`px-3 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 active:scale-95 flex-shrink-0 ${
                isOnline
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
                  : 'bg-white text-[#28a745] hover:bg-gray-50 shadow-lg'
              }`}
              aria-label={isOnline ? 'Go offline to stop receiving bookings' : 'Go online to start receiving bookings'}
            >
              {isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-0">
                <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-[#6c757d] font-medium">Today's Earnings</p>
                <p className="text-lg sm:text-2xl font-bold text-[#28a745]">₹{todaysEarnings.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              <span className="text-xs sm:text-sm text-green-600 font-medium">+12% from yesterday</span>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-0">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-[#6c757d] font-medium">Completed Jobs</p>
                <p className="text-lg sm:text-2xl font-bold text-[#333333]">{todaysJobs}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Award className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              <span className="text-xs sm:text-sm text-green-600 font-medium">Great performance!</span>
            </div>
          </div>
        </div>

        {/* Weekly Progress Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold">Weekly Target</h3>
              <p className="text-green-100 text-sm sm:text-base truncate">₹{currentWeekEarnings.toLocaleString()} / ₹{weeklyTarget.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 ml-3">
              <span className="text-lg sm:text-2xl font-bold">{Math.round(progressPercentage)}%</span>
            </div>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2 sm:h-3 mb-2">
            <div 
              className="bg-white h-2 sm:h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs sm:text-sm text-green-100">₹{(weeklyTarget - currentWeekEarnings).toLocaleString()} more to reach your target!</p>
        </div>

        {/* Enhanced Booking Requests */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-[#333333] flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#28a745] flex-shrink-0" />
                <span className="truncate">New Booking Requests</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#6c757d]">{bookings.length} requests available</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 sm:p-3 bg-[#28a745] rounded-lg sm:rounded-xl hover:bg-[#218838] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ml-3"
              aria-label={isRefreshing ? 'Refreshing bookings...' : 'Refresh booking requests'}
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {isRefreshing ? (
              <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 animate-pulse">
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <div className="flex-1">
                        <div className="h-4 sm:h-5 bg-gray-200 rounded w-24 sm:w-32 mb-2"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-24"></div>
                      </div>
                      <div className="h-5 sm:h-6 bg-gray-200 rounded w-12 sm:w-16"></div>
                    </div>
                    <div className="h-8 sm:h-10 bg-gray-200 rounded w-20 sm:w-24 mt-2 sm:mt-3"></div>
                  </div>
                ))}
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {bookings.map((booking, index) => (
                  <div 
                    key={booking.id} 
                    className="bg-gradient-to-r from-white to-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold text-[#333333] text-base sm:text-lg truncate">{booking.scrapType}</h3>
                          <span className="text-xs bg-[#28a745] bg-opacity-10 text-[#28a745] px-2 py-1 rounded-full font-medium flex-shrink-0">
                            {booking.paymentMode}
                          </span>
                        </div>
                        <p className="text-[#6c757d] font-medium text-sm sm:text-base truncate">{booking.customerName}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg sm:text-2xl font-bold text-[#28a745]">₹{booking.estimatedAmount}</p>
                        <div className="flex items-center gap-1 text-[#6c757d] text-xs sm:text-sm justify-end">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{booking.distance}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-[#6c757d]">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Just now</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onBookingSelect(booking)}
                        className="bg-[#28a745] text-white px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:bg-[#218838] transition-all duration-200 active:scale-95 flex items-center gap-1 sm:gap-2 shadow-lg flex-shrink-0"
                        aria-label={`View details for ${booking.scrapType} booking from ${booking.customerName}`}
                      >
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">View</span>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-[#6c757d]" />
                </div>
                <h3 className="font-bold text-[#333333] mb-2 text-base sm:text-lg">No new bookings right now</h3>
                <p className="text-[#6c757d] text-sm sm:text-base px-4">We'll notify you when new pickup requests arrive!</p>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="mt-3 sm:mt-4 bg-[#28a745] text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base hover:bg-[#218838] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Refresh to check for new booking requests"
                >
                  {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
                </button>
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

export default Dashboard;