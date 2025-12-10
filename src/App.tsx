import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import BookingDetailsScreen from './components/BookingDetailsScreen';
import ActiveJob from './components/ActiveJob';
import JobCompletion from './components/JobCompletion';
import ManageScreen from './components/ManageScreen';
import EarningsScreen from './components/EarningsScreen';
import HistoryScreen from './components/HistoryScreen';
import FutureRequestsScreen from './components/FutureRequestsScreen';
import VehicleScreen from './components/VehicleScreen';
import MoreMenuScreen from './components/MoreMenuScreen';
import MaterialsScreen from './components/MaterialsScreen';
import ContactsScreen from './components/ContactsScreen';
import ProfileScreen from './components/ProfileScreen';
import EditProfileScreen from './components/EditProfileScreen';
import LanguageScreen from './components/LanguageScreen';
import NotificationScreen from './components/NotificationScreen';
import PrivacyScreen from './components/PrivacyScreen';
import AppSettingsScreen from './components/AppSettingsScreen';
import HelpSupportScreen from './components/HelpSupportScreen';
import BottomNavigation from './components/BottomNavigation';
import BookingModal from './components/BookingModal';
import Toast from './components/Toast';
import { BookingRequest, ActiveJob as ActiveJobType, FutureRequest } from './types';

const AppContent = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeJob, setActiveJob] = useState<ActiveJobType | null>(null);
  const [showJobCompletion, setShowJobCompletion] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleBookingSelect = (booking: BookingRequest) => {
    setSelectedBooking(booking);
    setActiveTab('booking-details');
  };

  const handleShowNotification = () => {
    setShowBookingModal(true);
  };

  const handleAcceptBooking = (booking?: BookingRequest) => {
    const bookingToAccept = booking || selectedBooking || {
      id: 'new-' + Date.now(),
      scrapType: 'Mixed Scrap',
      distance: '1.8 km away',
      customerName: 'Priya Sharma',
      customerPhone: '+91 98765 43210',
      address: 'Shop No. 45, MG Road, Bangalore',
      paymentMode: 'Cash',
      estimatedAmount: 850,
      createdAt: new Date()
    };
    
    const job: ActiveJobType = {
      ...bookingToAccept,
      status: 'on-the-way',
      customerLocation: { lat: 12.9716, lng: 77.5946 }
    };
    
    setActiveJob(job);
    setSelectedBooking(null);
    setShowBookingModal(false);
    setActiveTab('active-job');
    showToast('Booking accepted successfully!', 'success');
  };

  const handleRejectBooking = () => {
    setSelectedBooking(null);
    setShowBookingModal(false);
    setActiveTab('home');
    showToast('Booking rejected', 'info');
  };

  const handleStatusUpdate = (status: ActiveJobType['status']) => {
    if (activeJob) {
      setActiveJob({ ...activeJob, status });
    }
  };

  const handleCompleteJob = () => {
    setShowJobCompletion(true);
  };

  const handleJobComplete = (totalAmount: number) => {
    setShowJobCompletion(false);
    setActiveJob(null);
    setActiveTab('home');
    showToast(`Job completed! ₹${totalAmount} earned`, 'success');
  };

  const handleBackToHome = () => {
    setActiveTab('home');
    setSelectedBooking(null);
    setActiveJob(null);
    setShowJobCompletion(false);
  };

  const handleNavigate = (screen: string) => {
    setActiveTab(screen);
  };

  const handleFutureRequestSelect = (request: FutureRequest) => {
    // Convert FutureRequest to BookingRequest for compatibility
    const booking: BookingRequest = {
      id: request.id,
      scrapType: request.scrapType,
      distance: request.distance,
      customerName: request.customerName,
      customerPhone: request.customerPhone,
      address: request.address,
      paymentMode: request.paymentMode,
      estimatedAmount: request.estimatedAmount,
      createdAt: request.createdAt
    };
    setSelectedBooking(booking);
    setActiveTab('booking-details');
  };

  if (!user) {
    return <LoginScreen />;
  }

  const renderContent = () => {
    if (showJobCompletion) {
      return (
        <JobCompletion 
          onJobComplete={handleJobComplete} 
          onBack={() => setShowJobCompletion(false)}
          onShowToast={showToast}
        />
      );
    }

    if (activeTab === 'active-job' && activeJob) {
      return (
        <ActiveJob
          job={activeJob}
          onStatusUpdate={handleStatusUpdate}
          onCompleteJob={handleCompleteJob}
          onBack={handleBackToHome}
          onShowToast={showToast}
        />
      );
    }

    if (activeTab === 'booking-details' && selectedBooking) {
      return (
        <BookingDetailsScreen
          booking={selectedBooking}
          onBack={handleBackToHome}
          onAccept={() => handleAcceptBooking(selectedBooking)}
          onReject={handleRejectBooking}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <Dashboard
            onBookingSelect={handleBookingSelect}
            onShowNotification={handleShowNotification}
            onShowToast={showToast}
          />
        );
      case 'manage':
        return <ManageScreen onBack={handleBackToHome} onNavigate={handleNavigate} />;
      case 'earnings':
        return <EarningsScreen onBack={handleBackToHome} />;
      case 'history':
        return <HistoryScreen onBack={handleBackToHome} />;
      case 'future-requests':
        return <FutureRequestsScreen onBack={handleBackToHome} onRequestSelect={handleFutureRequestSelect} />;
      case 'vehicle':
        return <VehicleScreen onBack={handleBackToHome} onShowToast={showToast} />;
      case 'more':
        return <MoreMenuScreen onBack={handleBackToHome} onNavigate={handleNavigate} onShowToast={showToast} />;
      case 'materials':
        return <MaterialsScreen onBack={handleBackToHome} />;
      case 'contacts':
        return <ContactsScreen onBack={handleBackToHome} />;
      case 'profile':
        return <ProfileScreen onBack={handleBackToHome} onNavigate={handleNavigate} onShowToast={showToast} />;
      case 'edit-profile':
        return <EditProfileScreen onBack={handleBackToHome} onShowToast={showToast} />;
      case 'language':
        return <LanguageScreen onBack={handleBackToHome} onShowToast={showToast} />;
      case 'notifications':
        return <NotificationScreen onBack={handleBackToHome} onShowToast={showToast} />;
      case 'privacy':
        return <PrivacyScreen onBack={handleBackToHome} onShowToast={showToast} />;
      case 'app-settings':
        return <AppSettingsScreen onBack={handleBackToHome} onShowToast={showToast} />;
      case 'help-support':
        return <HelpSupportScreen onBack={handleBackToHome} onShowToast={showToast} />;
      default:
        return (
          <Dashboard
            onBookingSelect={handleBookingSelect}
            onShowNotification={handleShowNotification}
            onShowToast={showToast}
          />
        );
    }
  };

  return (
    <div className="relative">
      {renderContent()}
      
      {/* Show bottom navigation except on active job and completion screens */}
      {activeTab !== 'active-job' && !showJobCompletion && (
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
      
      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={handleRejectBooking}
        onAccept={() => handleAcceptBooking()}
        onReject={handleRejectBooking}
      />
      
      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;