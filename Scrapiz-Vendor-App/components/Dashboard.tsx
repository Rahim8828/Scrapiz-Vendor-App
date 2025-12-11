import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Animated
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { BookingRequest } from '../types';

interface DashboardProps {
  onBookingSelect: (booking: BookingRequest) => void;
  onShowNotification: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onNavigate: (screen: string) => void;
}

export default function Dashboard({ onBookingSelect, onShowNotification, onShowToast, onNavigate }: DashboardProps) {
  const { user, toggleOnlineStatus } = useAuth();
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [notificationCount, setNotificationCount] = useState(3);

  const [fadeAnim] = useState(new Animated.Value(0));


  
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
      createdAt: new Date(),
      priority: 'high',
      estimatedTime: '15 mins'
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
      createdAt: new Date(),
      priority: 'medium',
      estimatedTime: '12 mins'
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
      createdAt: new Date(),
      priority: 'high',
      estimatedTime: '18 mins'
    }
  ]);





  // Sync with user online status from auth
  useEffect(() => {
    if (user) {
      setIsOnline(user.isOnline);
    }
  }, [user]);



  // Fade in animation for cards
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleToggleOnline = () => {
    try {
      const newStatus = !isOnline;
      setIsOnline(newStatus);
      toggleOnlineStatus(); // Sync with auth context
      onShowToast(
        newStatus ? 'You are now online and ready to receive bookings!' : 'You are now offline',
        'success'
      );
    } catch (error) {
      console.error('Error toggling online status:', error);
      onShowToast('Failed to update status. Please try again.', 'error');
    }
  };

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      await new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onShowToast(`Failed to refresh: ${errorMessage}`, 'error');
    } finally {
      setIsRefreshing(false);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }, [isRefreshing, onShowToast]);

  const handleNotificationClick = () => {
    try {
      // Show available booking requests
      if (bookings.length > 0) {
        onShowNotification(); // Show notifications screen
        setNotificationCount(0);
      } else {
        onShowToast('No new booking requests available', 'info');
      }
    } catch (error) {
      console.error('Error opening booking request:', error);
      onShowToast('Failed to open booking request', 'error');
    }
  };

  const handleBookingAction = (bookingId: string, action: 'accept' | 'decline' | 'view') => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    switch (action) {
      case 'accept':
        onShowToast(`Booking accepted! Navigating to ${booking.customerName}`, 'success');
        break;
      case 'decline':
        onShowToast('Booking declined', 'info');
        break;
      case 'view':
        onBookingSelect(booking);
        break;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#1B7332';
      default: return '#6c757d';
    }
  };

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);







  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greeting}>
                  {getGreeting()}, {user?.name || 'Vendor'}!
                </Text>
              </View>
              <Text style={styles.readyText}>Ready to collect scrap today?</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={handleNotificationClick}
              >
                <View style={styles.notificationContent}>
                  <MaterialIcons name="notifications" size={18} color="white" />
                  <Text style={styles.notificationText}>Requests</Text>
                </View>
                {notificationCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationCount}>
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Online/Offline Toggle */}
          <View style={styles.statusContainer}>
            <View style={styles.statusLeft}>
              <View 
                style={[
                  styles.statusIconContainer, 
                  { backgroundColor: isOnline ? '#E8F5E8' : '#f8f9fa' }
                ]}
              >
                <MaterialIcons 
                  name={isOnline ? 'wifi' : 'wifi-off'} 
                  size={18} 
                  color={isOnline ? '#1B7332' : '#6c757d'} 
                />
                {isOnline && (
                  <View style={styles.onlineIndicator} />
                )}
              </View>
              <View style={styles.statusTextContainer}>
                <View style={styles.statusTitleRow}>
                  <Text style={styles.statusTitle}>
                    {isOnline ? 'Online' : 'Offline'}
                  </Text>
                  {isOnline && <View style={styles.liveDot} />}
                </View>
                <Text style={styles.statusSubtitle}>
                  {isOnline ? 'Receiving new bookings' : 'Not receiving bookings'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.toggleButton, 
                isOnline ? styles.toggleButtonOffline : styles.toggleButtonOnline
              ]}
              onPress={handleToggleOnline}
            >
              <MaterialIcons 
                name={isOnline ? 'pause' : 'play-arrow'} 
                size={14} 
                color="white" 
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.toggleButtonText, isOnline ? styles.toggleTextOffline : styles.toggleTextOnline]}>
                {isOnline ? 'Go Offline' : 'Go Online'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>




          {/* Enhanced Booking Requests */}
          <Animated.View style={[styles.bookingsContainer, styles.enhancedBookingsContainer, { opacity: fadeAnim }]}>
            <View style={styles.bookingsHeader}>
              <View style={styles.bookingsHeaderLeft}>
                <View style={styles.bookingsIconContainer}>
                  <MaterialIcons name="flash-on" size={20} color="#1B7332" />
                </View>
                <View>
                  <Text style={styles.bookingsTitle}>New Booking Requests</Text>
                  <Text style={styles.bookingsSubtitle}>{bookings.length} requests available</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefresh}
                disabled={isRefreshing}
              >
                <MaterialIcons name="refresh" size={16} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.bookingsList}>
              {isRefreshing ? (
                <View style={styles.loadingContainer}>
                  {[1, 2, 3].map((i) => (
                    <Animated.View key={i} style={[styles.loadingCard, styles.shimmerCard]}>
                      <View style={styles.loadingPriorityIndicator} />
                      <View style={styles.loadingIconPlaceholder} />
                      <View style={styles.loadingContent}>
                        <View style={[styles.loadingTitle, styles.shimmer]} />
                        <View style={[styles.loadingSubtitle, styles.shimmer]} />
                        <View style={[styles.loadingMetrics, styles.shimmer]} />
                      </View>
                      <View style={styles.loadingRight}>
                        <View style={[styles.loadingAmount, styles.shimmer]} />
                        <View style={[styles.loadingRoute, styles.shimmer]} />
                      </View>
                    </Animated.View>
                  ))}
                </View>
              ) : bookings.length > 0 ? (
                bookings.map((booking) => (
                  <View key={booking.id} style={[styles.bookingCard, styles.enhancedBookingCard]}>
                    <View style={[
                      styles.priorityIndicator, 
                      { backgroundColor: getPriorityColor(booking.priority || 'medium') }
                    ]} />
                    
                    <View style={styles.bookingHeader}>
                      <View style={styles.bookingLeft}>
                        <View style={styles.bookingTitleRow}>
                          <Text style={styles.bookingTitle}>{booking.scrapType}</Text>
                          <View style={[
                            styles.priorityBadge,
                            { backgroundColor: `${getPriorityColor(booking.priority || 'medium')}20` }
                          ]}>
                            <Text style={[
                              styles.priorityText,
                              { color: getPriorityColor(booking.priority || 'medium') }
                            ]}>
                              {booking.priority?.toUpperCase() || 'MEDIUM'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.customerName}>{booking.customerName}</Text>
                        <View style={styles.bookingMetrics}>
                          <View style={styles.metricItem}>
                            <MaterialIcons name="location-on" size={12} color="#6c757d" />
                            <Text style={styles.metricText}>{booking.distance}</Text>
                          </View>
                          <View style={styles.metricItem}>
                            <MaterialIcons name="access-time" size={12} color="#6c757d" />
                            <Text style={styles.metricText}>{booking.estimatedTime || '15 mins'}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.bookingRight}>
                        <Text style={styles.bookingAmount}>₹{booking.estimatedAmount}</Text>
                        <View style={styles.routePreview}>
                          <MaterialIcons name="navigation" size={16} color="#1B7332" />
                          <Text style={styles.routeText}>View Route</Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.bookingFooter}>
                      <View style={styles.timeAgoContainer}>
                        <MaterialIcons name="access-time" size={12} color="#6c757d" style={styles.clockIcon} />
                        <Text style={styles.timeAgo}>Just now</Text>
                      </View>
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.declineButton}
                          onPress={() => handleBookingAction(booking.id, 'decline')}
                        >
                          <MaterialIcons name="close" size={14} color="#dc3545" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.viewButton}
                          onPress={() => handleBookingAction(booking.id, 'view')}
                        >
                          <MaterialIcons name="visibility" size={14} color="white" />
                          <Text style={styles.viewButtonText}>View</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.acceptButton}
                          onPress={() => handleBookingAction(booking.id, 'accept')}
                        >
                          <MaterialIcons name="check" size={14} color="white" />
                          <Text style={styles.acceptButtonText}>Accept</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIcon}>
                    <MaterialIcons name="schedule" size={32} color="#6c757d" />
                  </View>
                  <Text style={styles.emptyTitle}>No new bookings right now</Text>
                  <Text style={styles.emptySubtitle}>
                    We'll notify you when new pickup requests arrive!
                  </Text>
                  <View style={styles.emptyActions}>
                    <TouchableOpacity
                      style={styles.refreshEmptyButton}
                      onPress={handleRefresh}
                      disabled={isRefreshing}
                    >
                      <MaterialIcons name="refresh" size={16} color="white" style={{ marginRight: 6 }} />
                      <Text style={styles.refreshEmptyButtonText}>
                        {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.historyButton}
                      onPress={() => onNavigate('JobHistoryScreen')}
                    >
                      <MaterialIcons name="history" size={16} color="#1B7332" style={{ marginRight: 6 }} />
                      <Text style={styles.historyButtonText}>View History</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.emptySuggestions}>
                    <Text style={styles.suggestionsTitle}>While you wait:</Text>
                    <View style={styles.suggestionsList}>
                      <TouchableOpacity style={styles.suggestionItem} onPress={() => onNavigate('ProfileScreen')}>
                        <MaterialIcons name="person" size={16} color="#1B7332" />
                        <Text style={styles.suggestionText}>Update your profile</Text>
                      </TouchableOpacity>

                    </View>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Extra space for bottom navigation
  },
  header: {
    backgroundColor: '#1B7332',
    paddingHorizontal: 16,
    paddingTop: 44, // Safe area for status bar
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  greetingContainer: {
    marginBottom: 8,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  locationWeatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#E8F5E8',
    fontWeight: '500',
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weatherText: {
    fontSize: 12,
    color: '#E8F5E8',
    fontWeight: '500',
  },
  readyText: {
    fontSize: 14,
    color: '#E8F5E8',
    fontWeight: '500',
  },
  notificationButton: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 80,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notificationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#dc3545',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  notificationCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1B7332',
    borderWidth: 1,
    borderColor: 'white',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00ff00',
  },
  statusSubtitle: {
    fontSize: 11,
    color: '#E8F5E8',
    marginTop: 2,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonOnline: {
    backgroundColor: 'white',
  },
  toggleButtonOffline: {
    backgroundColor: '#dc3545',
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  toggleTextOnline: {
    color: '#1B7332',
  },
  toggleTextOffline: {
    color: 'white',
  },
  content: {
    padding: 16, // Reduced from 20
  },



  bookingsContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  enhancedBookingsContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
    transform: [{ translateY: -2 }],
  },
  bookingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16, // Reduced from 20
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  bookingsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookingsIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookingsTitle: {
    fontSize: 16, // Reduced from 18
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  bookingsSubtitle: {
    fontSize: 11, // Reduced from 12
    color: '#6c757d',
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#1B7332',
    borderRadius: 10, // Reduced from 12
    padding: 10, // Reduced from 12
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },

  bookingsList: {
    padding: 16, // Reduced from 20
  },
  loadingContainer: {
    gap: 16,
  },
  loadingCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  shimmerCard: {
    backgroundColor: '#f8f9fa',
  },
  shimmer: {
    backgroundColor: '#e9ecef',
  },
  loadingPriorityIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#e9ecef',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  loadingRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  loadingMetrics: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    width: '60%',
    marginTop: 4,
  },
  loadingRoute: {
    height: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    width: 60,
  },
  loadingIconPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
  },
  loadingContent: {
    flex: 1,
    gap: 6,
  },
  loadingTitle: {
    height: 14,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    width: '70%',
  },
  loadingSubtitle: {
    height: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    width: '50%',
  },
  loadingAmount: {
    height: 18,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    width: 50,
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(40, 167, 69, 0.08)',
    position: 'relative',
  },
  priorityIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  enhancedBookingCard: {
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    borderColor: 'rgba(40, 167, 69, 0.12)',
    backgroundColor: '#fafffe',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12, // Reduced from 16
  },
  bookingLeft: {
    flex: 1,
    paddingRight: 10, // Reduced from 12
  },
  bookingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 8,
    fontWeight: '700',
  },
  bookingMetrics: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 11,
    color: '#6c757d',
    fontWeight: '500',
  },
  bookingTitle: {
    fontSize: 15, // Reduced from 16
    fontWeight: 'bold',
    color: '#333',
    marginRight: 6, // Reduced from 8
  },

  customerName: {
    fontSize: 13, // Reduced from 14
    color: '#6c757d',
    fontWeight: '600',
  },
  bookingRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  routePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  routeText: {
    fontSize: 10,
    color: '#1B7332',
    fontWeight: '600',
  },
  bookingAmount: {
    fontSize: 20, // Reduced from 22
    fontWeight: 'bold',
    color: '#1B7332',
    marginBottom: 2, // Reduced from 4
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 4,
  },
  distanceText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeAgoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    marginRight: 4,
  },
  timeAgo: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  declineButton: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.2)',
  },
  viewButton: {
    backgroundColor: '#6c757d',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  acceptButton: {
    backgroundColor: '#1B7332',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  arrowIcon: {
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32, // Reduced from 40
  },
  emptyIcon: {
    width: 64, // Reduced from 80
    height: 64, // Reduced from 80
    backgroundColor: '#f8f9fa',
    borderRadius: 32, // Reduced from 40
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12, // Reduced from 16
    borderWidth: 2,
    borderColor: '#e9ecef',
  },

  emptyTitle: {
    fontSize: 16, // Reduced from 18
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6, // Reduced from 8
  },
  emptySubtitle: {
    fontSize: 13, // Reduced from 14
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 16, // Reduced from 20
    paddingHorizontal: 16, // Reduced from 20
    lineHeight: 18, // Reduced from 20
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  refreshEmptyButton: {
    backgroundColor: '#1B7332',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  refreshEmptyButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyButton: {
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(40, 167, 69, 0.2)',
  },
  historyButtonText: {
    color: '#1B7332',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptySuggestions: {
    alignItems: 'center',
    gap: 12,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(40, 167, 69, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  suggestionText: {
    fontSize: 12,
    color: '#1B7332',
    fontWeight: '500',
  },
});