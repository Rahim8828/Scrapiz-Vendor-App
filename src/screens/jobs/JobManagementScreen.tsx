import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  Linking,
  Alert,
  StatusBar
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { bookingStateService, AcceptedBooking } from '../../services/bookingStateService';
import { BookingModal } from '../../components/ui';
import { BookingRequest } from '../../types';

interface Job {
  id: string;
  customerName: string;
  location: string;
  time: string;
  date: string;
  status: 'upcoming' | 'pending' | 'followup' | 'completed' | 'cancelled';
  isRepeat?: boolean;
  scrapType: string;
  estimatedAmount: number;
  customerPhone: string;
  jobEndedReason?: string;
  originalBookingId?: string; // For accepted bookings
}

interface JobManagementScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

const JobManagementScreen = ({ onBack }: JobManagementScreenProps) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'pending' | 'followup' | 'completed' | 'cancelled'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [acceptedBookings, setAcceptedBookings] = useState<AcceptedBooking[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);

  // Mock data - replace with actual API calls
  const [jobs] = useState<Job[]>([
    {
      id: '1',
      customerName: 'Rajesh Kumar',
      location: 'MG Road, Bangalore',
      time: '10:00 am',
      date: 'Today',
      status: 'upcoming',
      isRepeat: true,
      scrapType: 'Mixed Scrap',
      estimatedAmount: 450,
      customerPhone: '+91 9876543210'
    },
    {
      id: '2',
      customerName: 'Priya Sharma',
      location: 'Koramangala, Bangalore',
      time: '11:20 am',
      date: 'Today',
      status: 'completed',
      scrapType: 'Paper & Cardboard',
      estimatedAmount: 320,
      customerPhone: '+91 9876543211',
      jobEndedReason: 'Job ended'
    },
    {
      id: '3',
      customerName: 'Amit Patel',
      location: 'Electronic City, Bangalore',
      time: '1:05 pm',
      date: 'Today',
      status: 'pending',
      scrapType: 'Electronic Waste',
      estimatedAmount: 680,
      customerPhone: '+91 9876543212'
    },
    {
      id: '4',
      customerName: 'Sweta Kochar',
      location: 'Royal Classic, Andheri (West), Mumbai',
      time: '11:20 am',
      date: 'Yesterday',
      status: 'upcoming',
      scrapType: 'Mixed Scrap',
      estimatedAmount: 550,
      customerPhone: '+91 9876543213'
    },
    {
      id: '5',
      customerName: 'Abhay Kamath',
      location: 'Mumbai, Mahatma Jyotiba Phule Nagar',
      time: '10:00 am',
      date: 'Yesterday',
      status: 'completed',
      scrapType: 'Metal Scrap',
      estimatedAmount: 750,
      customerPhone: '+91 9876543214'
    },
    {
      id: '6',
      customerName: 'Sayali Naman',
      location: 'Habitat Wing_a, Dhakoji Sethpada, Ambol',
      time: '8:50 am',
      date: 'Yesterday',
      status: 'cancelled',
      scrapType: 'Paper Waste',
      estimatedAmount: 200,
      customerPhone: '+91 9876543215',
      jobEndedReason: 'Cancelled by customer'
    }
  ]);

  useEffect(() => {
    // Load accepted bookings
    const loadAcceptedBookings = () => {
      const bookings = bookingStateService.getAcceptedBookings();
      setAcceptedBookings(bookings);
    };

    loadAcceptedBookings();
    
    // Subscribe to booking updates
    const unsubscribe = bookingStateService.subscribe(loadAcceptedBookings);
    
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    return unsubscribe;
  }, []);

  const handleCall = (phone: string, customerName: string) => {
    Alert.alert(
      '📞 Call Customer',
      `Call ${customerName} at ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: '📞 Call Now', 
          onPress: () => {
            try {
              Linking.openURL(`tel:${phone}`);
            } catch (error) {
              Alert.alert('Error', 'Unable to make call');
            }
          }
        }
      ]
    );
  };

  const handleNavigate = (location: string) => {
    try {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`;
      Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Unable to open navigation');
    }
  };

  const handleJobCardPress = (job: Job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const convertJobToBookingRequest = (job: Job): BookingRequest => {
    return {
      id: job.id,
      customerName: job.customerName,
      customerPhone: job.customerPhone,
      address: job.location,
      scrapType: job.scrapType,
      estimatedAmount: job.estimatedAmount,
      distance: '2.5 km', // Default distance
      paymentMode: 'Cash',
      createdAt: new Date(),
      priority: 'medium',
      customerRating: 4.5,
      isVerified: true
    };
  };

  const getFilteredJobs = () => {
    // Get accepted bookings IDs to avoid duplicates
    const acceptedBookingIds = acceptedBookings.map(b => b.id);
    
    // Filter mock jobs to exclude accepted bookings
    const filteredMockJobs = jobs.filter(job => 
      job.status === activeTab && !acceptedBookingIds.includes(job.id)
    );
    
    // Get accepted bookings for current tab
    const acceptedJobsForTab = acceptedBookings
      .filter(booking => {
        if (activeTab === 'upcoming') return booking.status === 'accepted';
        if (activeTab === 'pending') return booking.status === 'in-progress';
        if (activeTab === 'completed') return booking.status === 'completed';
        return false;
      })
      .map(booking => ({
        id: `accepted_${booking.id}`, // Unique prefix to avoid conflicts
        customerName: booking.customerName,
        location: booking.address,
        time: new Date(booking.acceptedAt).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        date: 'Today',
        status: activeTab,
        scrapType: booking.scrapType,
        estimatedAmount: booking.estimatedAmount,
        customerPhone: booking.customerPhone,
        isRepeat: false,
        originalBookingId: booking.id // Keep original ID for status updates
      })) as Job[];

    return [...filteredMockJobs, ...acceptedJobsForTab];
  };

  const groupJobsByDate = (jobs: Job[]) => {
    const grouped: { [key: string]: Job[] } = {};
    jobs.forEach(job => {
      if (!grouped[job.date]) {
        grouped[job.date] = [];
      }
      grouped[job.date].push(job);
    });
    return grouped;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#1B7332';
      case 'pending': return '#FF9800';
      case 'followup': return '#2196F3';
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return 'schedule';
      case 'pending': return 'hourglass-empty';
      case 'followup': return 'follow-the-signs';
      case 'completed': return 'check-circle';
      case 'cancelled': return 'cancel';
      default: return 'help';
    }
  };

  const renderJobCard = (job: Job) => (
    <TouchableOpacity
      key={job.id}
      style={[
        styles.compactJobCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          borderLeftColor: getStatusColor(job.status)
        }
      ]}
      onPress={() => handleJobCardPress(job)}
      activeOpacity={0.7}
    >
      {/* Status Strip */}
      <View style={[styles.statusStrip, { backgroundColor: getStatusColor(job.status) }]} />
      
      {/* Compact Card Content */}
      <View style={styles.compactCardContent}>
        {/* Top Row - Status & Time */}
        <View style={styles.topRow}>
          <View style={styles.statusBadge}>
            <MaterialIcons 
              name={getStatusIcon(job.status)} 
              size={12} 
              color={getStatusColor(job.status)} 
            />
            <Text style={[styles.statusBadgeText, { color: getStatusColor(job.status) }]}>
              {job.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.timeText}>{job.time}</Text>
        </View>

        {/* Main Content Row */}
        <View style={styles.mainRow}>
          <View style={styles.leftContent}>
            <View style={styles.customerRow}>
              <View style={styles.customerAvatar}>
                <Text style={styles.customerInitial}>
                  {job.customerName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{job.customerName}</Text>
                <Text style={styles.scrapType}>{job.scrapType}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.rightContent}>
            <Text style={styles.earningsAmount}>₹{job.estimatedAmount}</Text>
            <MaterialIcons name="chevron-right" size={20} color="#ccc" />
          </View>
        </View>

        {/* Bottom Row - Location */}
        <View style={styles.bottomRow}>
          <MaterialIcons name="location-on" size={14} color="#666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {job.location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const filteredJobs = getFilteredJobs();
  const groupedJobs = groupJobsByDate(filteredJobs);

  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
      <MaterialIcons 
        name={
          activeTab === 'upcoming' ? 'schedule' :
          activeTab === 'pending' ? 'pending-actions' :
          activeTab === 'followup' ? 'follow-the-signs' :
          activeTab === 'completed' ? 'check-circle' : 'cancel'
        } 
        size={64} 
        color="#e0e0e0" 
      />
      <Text style={styles.emptyTitle}>
        {activeTab === 'followup' 
          ? "You don't have any jobs to follow up on"
          : `You don't have any ${activeTab} job${activeTab === 'pending' ? '' : 's'}`
        }
      </Text>
    </Animated.View>
  );

  const tabs = [
    { key: 'upcoming', label: 'Upcoming', count: getFilteredJobs().length },
    { key: 'pending', label: 'In Progress', count: 0 },
    { key: 'followup', label: 'Follow Up', count: 0 },
    { key: 'completed', label: 'Completed', count: 0 },
    { key: 'cancelled', label: 'Cancelled', count: 0 }
  ];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1B7332" barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Job Management</Text>
          <Text style={styles.headerSubtitle}>Track all your pickups</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Enhanced Tab Navigation */}
      <View style={styles.enhancedTabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.enhancedTab,
                activeTab === tab.key && styles.enhancedActiveTab
              ]}
              onPress={() => setActiveTab(tab.key as any)}
              activeOpacity={0.7}
            >
              <View style={styles.tabHeader}>
                <MaterialIcons 
                  name={
                    tab.key === 'upcoming' ? 'schedule' :
                    tab.key === 'pending' ? 'hourglass-empty' :
                    tab.key === 'followup' ? 'follow-the-signs' :
                    tab.key === 'completed' ? 'check-circle' : 'cancel'
                  }
                  size={14} 
                  color={activeTab === tab.key ? '#fff' : '#1B7332'} 
                />
                <Text style={[
                  styles.enhancedTabText,
                  activeTab === tab.key && styles.enhancedActiveTabText
                ]}>
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View style={[
                    styles.enhancedTabBadge,
                    activeTab === tab.key && styles.enhancedActiveTabBadge
                  ]}>
                    <Text style={[
                      styles.enhancedTabBadgeText,
                      activeTab === tab.key && styles.enhancedActiveTabBadgeText
                    ]}>
                      {tab.count}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {}} />
        }
      >
        {filteredJobs.length === 0 ? (
          renderEmptyState()
        ) : (
          Object.entries(groupedJobs).map(([date, dateJobs]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{date}</Text>
              {dateJobs.map(renderJobCard)}
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Help Button */}
      <TouchableOpacity style={styles.helpButton}>
        <MaterialIcons name="help" size={24} color="white" />
        <Text style={styles.helpText}>Help</Text>
      </TouchableOpacity>

      {/* Booking Modal */}
      {selectedJob && (
        <BookingModal
          isVisible={showJobModal}
          booking={convertJobToBookingRequest(selectedJob)}
          onClose={() => {
            setShowJobModal(false);
            setSelectedJob(null);
          }}
          onAccept={() => {
            // Job is already accepted, just close modal
            setShowJobModal(false);
            setSelectedJob(null);
          }}
          isAccepted={true} // Jobs in manage tab are already accepted
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B7332', // Match header color to avoid gaps
  },
  header: {
    backgroundColor: '#1B7332',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginTop: -6, // Ensure no gap at top
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerSpacer: {
    width: 40,
  },
  
  // Enhanced Tab Navigation
  enhancedTabContainer: {
    backgroundColor: 'white',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  tabScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  
  enhancedTab: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 90,
    borderWidth: 1,
    borderColor: 'rgba(27, 115, 50, 0.15)',
  },
  
  enhancedActiveTab: {
    backgroundColor: '#1B7332',
    borderColor: '#1B7332',
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  
  tabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  enhancedTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1B7332',
  },
  
  enhancedActiveTabText: {
    color: 'white',
  },
  

  
  enhancedTabBadge: {
    backgroundColor: '#dc3545',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  
  enhancedActiveTabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  
  enhancedTabBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  enhancedActiveTabBadgeText: {
    color: 'white',
  },

  // Content
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Content background
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 160,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },

  // Compact Job Card
  compactJobCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    overflow: 'hidden',
    position: 'relative',
  },

  compactCardContent: {
    padding: 12,
    paddingLeft: 16,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  leftContent: {
    flex: 1,
  },

  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  statusStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 115, 50, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
    alignSelf: 'flex-start',
  },
  
  statusBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  
  customerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1B7332',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  customerInitial: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  
  customerInfo: {
    flex: 1,
  },
  
  customerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 1,
  },

  scrapType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  
  earningsAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B7332',
  },
  
  locationText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },

  // Floating Help Button
  helpButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1B7332',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  helpText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
});

export default JobManagementScreen;