import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Auth Screens
import { SimpleLogin as LoginScreen } from './src/screens/auth';

// Main Screens
import { Dashboard, EarningsScreen, ManageScreen } from './src/screens/main';

// Profile Screens
import { ProfileScreen, PersonalInfoScreen, EditProfileScreen } from './src/screens/profile';

// Settings Screens
import { 
  PaymentSettingsScreen, 
  NotificationsScreen, 
  HelpSupportScreen, 
  AboutScreen,
  AppSettingsScreen,
  LanguageScreen,
  ContactsScreen,
  PrivacyScreen,
  MoreMenuScreen
} from './src/screens/settings';

// Job Screens
import { 
  JobHistoryScreen, 
  FutureRequestsScreen, 
  BookingDetailsScreen, 
  ActiveJob, 
  JobCompletion 
} from './src/screens/jobs';
// Navigation & Common Components
import { BottomNavigation } from './src/components/navigation';
import { ErrorBoundary } from './src/components/common';
import { BookingRequest, ActiveJob as ActiveJobType } from './src/types';

const AppContent = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [showJobCompletion, setShowJobCompletion] = useState(false);
  const [activeJob, setActiveJob] = useState<ActiveJobType | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    Alert.alert(
      type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
      message
    );
  };

  const handleBookingSelect = (booking: BookingRequest) => {
    setSelectedBooking(booking);
    setActiveTab('booking-details');
  };

  const handleShowNotification = () => {
    Alert.alert('Notifications', 'You have 3 new notifications!');
  };

  const handleBackToHome = () => {
    setActiveTab('home');
    setSelectedBooking(null);
    setShowJobCompletion(false);
  };

  const handleBackToManage = () => {
    setActiveTab('manage');
  };

  const handleBackToProfile = () => {
    setActiveTab('profile');
  };

  const handleNavigate = (screen: string) => {
    setActiveTab(screen);
  };

  if (!user) {
    return <LoginScreen />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Dashboard
            onBookingSelect={handleBookingSelect}
            onShowNotification={handleShowNotification}
            onShowToast={showToast}
            onNavigate={handleNavigate}
          />
        );
      case 'earnings':
        return <EarningsScreen onBack={handleBackToHome} />;
      case 'manage':
        return <ManageScreen onBack={handleBackToHome} onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfileScreen onBack={handleBackToHome} onNavigate={handleNavigate} />;
      case 'personal-info':
        return <PersonalInfoScreen onBack={handleBackToProfile} />;

      case 'payment-settings':
        return <PaymentSettingsScreen onBack={handleBackToProfile} />;
      case 'notifications':
        return <NotificationsScreen onBack={handleBackToProfile} />;
      case 'help-support':
        return <HelpSupportScreen onBack={handleBackToProfile} />;
      case 'about':
        return <AboutScreen onBack={handleBackToProfile} />;
      // Manage tab sub-screens
      case 'history':
        return <JobHistoryScreen onBack={handleBackToManage} />;
      case 'active-jobs':
        return <JobHistoryScreen onBack={handleBackToManage} />;
      case 'future-requests':
        return <FutureRequestsScreen onBack={handleBackToManage} />;

      case 'booking-details':
        return selectedBooking ? (
          <BookingDetailsScreen
            booking={selectedBooking}
            onBack={handleBackToHome}
            onAccept={() => {
              // Convert booking to active job
              const newActiveJob: ActiveJobType = {
                ...selectedBooking,
                status: 'on-the-way',
                customerLocation: {
                  lat: 19.0760, // Default Mumbai coordinates
                  lng: 72.8777
                }
              };
              setActiveJob(newActiveJob);
              setActiveTab('active-job');
              showToast('Booking accepted successfully!', 'success');
            }}
            onReject={() => {
              showToast('Booking rejected', 'info');
              handleBackToHome();
            }}
          />
        ) : null;
      case 'active-job':
        return activeJob ? (
          <ActiveJob
            job={activeJob}
            onStatusUpdate={(status) => {
              setActiveJob(prev => prev ? { ...prev, status } : null);
            }}
            onCompleteJob={() => {
              setShowJobCompletion(true);
              setActiveTab('job-completion');
            }}
            onBack={handleBackToHome}
            onShowToast={showToast}
          />
        ) : null;
      case 'job-completion':
        return (
          <JobCompletion
            onJobComplete={(totalAmount) => {
              showToast(`Job completed! ₹${totalAmount} earned`, 'success');
              setActiveJob(null);
              setShowJobCompletion(false);
              handleBackToHome();
            }}
            onBack={() => {
              setActiveTab('active-job');
            }}
            onShowToast={showToast}
          />
        );
      case 'edit-profile':
        return (
          <EditProfileScreen
            onBack={handleBackToProfile}
            onShowToast={showToast}
          />
        );
      case 'app-settings':
        return (
          <AppSettingsScreen
            onBack={handleBackToProfile}
            onShowToast={showToast}
          />
        );
      case 'contacts':
        return (
          <ContactsScreen
            onBack={handleBackToProfile}
          />
        );
      case 'language':
        return (
          <LanguageScreen
            onBack={handleBackToProfile}
            onShowToast={showToast}
          />
        );
      case 'privacy':
        return (
          <PrivacyScreen
            onBack={handleBackToProfile}
          />
        );
      case 'more-menu':
        return (
          <MoreMenuScreen
            onBack={handleBackToProfile}
            onNavigate={handleNavigate}
          />
        );
      default:
        return (
          <Dashboard
            onBookingSelect={handleBookingSelect}
            onShowNotification={handleShowNotification}
            onShowToast={showToast}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
      
      {/* Show bottom navigation except on active job and completion screens */}
      {activeTab !== 'active-job' && activeTab !== 'job-completion' && !showJobCompletion && (
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

