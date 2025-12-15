import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Animated,
  RefreshControl,
  Dimensions 
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface FutureRequestsScreenProps {
  onBack: () => void;
}

interface FutureRequest {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  customerName: string;
  customerPhone: string;
  scrapType: string;
  estimatedAmount: number;
  address: string;
  estimatedWeight: string;
  status: 'scheduled' | 'confirmed' | 'pending';
  priority: 'high' | 'medium' | 'low';
}

const futureRequests: FutureRequest[] = [
  {
    id: 'REQ001',
    scheduledDate: '2024-12-12',
    scheduledTime: '10:00 AM',
    customerName: 'Meera Gupta',
    customerPhone: '+91 98765 43210',
    scrapType: 'Electronics & Metal',
    estimatedAmount: 1500,
    address: 'HSR Layout, Bangalore',
    estimatedWeight: '20 kg',
    status: 'confirmed',
    priority: 'high'
  },
  {
    id: 'REQ002',
    scheduledDate: '2024-12-12',
    scheduledTime: '2:30 PM',
    customerName: 'Arjun Reddy',
    customerPhone: '+91 87654 32109',
    scrapType: 'Paper & Cardboard',
    estimatedAmount: 600,
    address: 'Jayanagar, Bangalore',
    estimatedWeight: '12 kg',
    status: 'scheduled',
    priority: 'medium'
  },
  {
    id: 'REQ003',
    scheduledDate: '2024-12-13',
    scheduledTime: '11:15 AM',
    customerName: 'Kavya Nair',
    customerPhone: '+91 76543 21098',
    scrapType: 'Mixed Scrap',
    estimatedAmount: 900,
    address: 'BTM Layout, Bangalore',
    estimatedWeight: '15 kg',
    status: 'pending',
    priority: 'medium'
  },
  {
    id: 'REQ004',
    scheduledDate: '2024-12-14',
    scheduledTime: '9:00 AM',
    customerName: 'Rohit Sharma',
    customerPhone: '+91 65432 10987',
    scrapType: 'Plastic & Glass',
    estimatedAmount: 400,
    address: 'Electronic City, Bangalore',
    estimatedWeight: '8 kg',
    status: 'scheduled',
    priority: 'low'
  },
];

const FutureRequestsScreen = ({ onBack }: FutureRequestsScreenProps) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'tomorrow' | 'week'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Animation effect
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Refreshed', 'Future requests updated!');
    }, 2000);
  }, []);

  const handleConfirmRequest = (requestId: string) => {
    Alert.alert(
      '✅ Confirm Request',
      'Are you sure you want to confirm this pickup request?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: '✅ Confirm', 
          onPress: () => {
            Alert.alert('🎉 Success', 'Request confirmed successfully!');
          }
        }
      ]
    );
  };

  const handleCancelRequest = (requestId: string) => {
    Alert.alert(
      '❌ Cancel Request',
      'Are you sure you want to cancel this pickup request?\n\nThis action cannot be undone.',
      [
        { text: 'Keep Request', style: 'cancel' },
        { 
          text: '❌ Cancel Request', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('🗑️ Cancelled', 'Request has been cancelled successfully.');
          }
        }
      ]
    );
  };

  const handleCallCustomer = (phone: string, customerName: string) => {
    Alert.alert(
      '📞 Call Customer', 
      `Call ${customerName} at ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '📞 Call Now', onPress: () => Alert.alert('Calling...', `Dialing ${phone}`) }
      ]
    );
  };

  const handleReschedule = (requestId: string) => {
    Alert.alert(
      '📅 Reschedule Request',
      'Would you like to reschedule this pickup?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '📅 Reschedule', onPress: () => Alert.alert('Reschedule', 'Reschedule feature coming soon!') }
      ]
    );
  };

  const getFilteredRequests = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return futureRequests.filter(request => {
      const requestDate = new Date(request.scheduledDate);
      
      switch (selectedFilter) {
        case 'today':
          return requestDate.toDateString() === today.toDateString();
        case 'tomorrow':
          return requestDate.toDateString() === tomorrow.toDateString();
        case 'week':
          return requestDate <= nextWeek;
        default:
          return true;
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#28a745';
      case 'scheduled': return '#007bff';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const renderRequestCard = (request: FutureRequest, index: number) => (
    <Animated.View 
      key={request.id} 
      style={[
        styles.requestCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      {/* Enhanced Header with Gradient Effect */}
      <View style={styles.requestHeader}>
        <View style={styles.requestIdContainer}>
          <View style={styles.requestIdBadge}>
            <MaterialIcons name="receipt" size={14} color="#1B7332" />
            <Text style={styles.requestId}>{request.id}</Text>
          </View>
          <View style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(request.priority) + '20' }
          ]}>
            <MaterialIcons 
              name={request.priority === 'high' ? 'priority-high' : 'flag'} 
              size={12} 
              color={getPriorityColor(request.priority)} 
            />
            <Text style={[
              styles.priorityText,
              { color: getPriorityColor(request.priority) }
            ]}>
              {request.priority.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(request.status) + '20' }
        ]}>
          <MaterialIcons 
            name={
              request.status === 'confirmed' ? 'check-circle' :
              request.status === 'scheduled' ? 'schedule' : 'pending'
            } 
            size={12} 
            color={getStatusColor(request.status)} 
          />
          <Text style={[
            styles.statusText,
            { color: getStatusColor(request.status) }
          ]}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Enhanced Schedule Info */}
      <View style={styles.scheduleInfo}>
        <View style={styles.scheduleCard}>
          <MaterialIcons name="calendar-today" size={18} color="#1B7332" />
          <View>
            <Text style={styles.scheduleLabel}>Date</Text>
            <Text style={styles.scheduleText}>
              {new Date(request.scheduledDate).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              })}
            </Text>
          </View>
        </View>
        <View style={styles.scheduleCard}>
          <MaterialIcons name="access-time" size={18} color="#1B7332" />
          <View>
            <Text style={styles.scheduleLabel}>Time</Text>
            <Text style={styles.scheduleText}>{request.scheduledTime}</Text>
          </View>
        </View>
      </View>

      {/* Enhanced Customer Info */}
      <View style={styles.customerInfo}>
        <View style={styles.customerHeader}>
          <View style={styles.customerAvatar}>
            <MaterialIcons name="person" size={20} color="#1B7332" />
          </View>
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{request.customerName}</Text>
            <Text style={styles.customerPhone}>{request.customerPhone}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => handleCallCustomer(request.customerPhone, request.customerName)}
            style={styles.callButton}
          >
            <MaterialIcons name="phone" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.addressContainer}>
          <MaterialIcons name="location-on" size={16} color="#1B7332" />
          <Text style={styles.addressText}>{request.address}</Text>
        </View>
      </View>

      {/* Enhanced Request Details */}
      <View style={styles.requestDetails}>
        <View style={styles.detailGrid}>
          <View style={styles.detailCard}>
            <MaterialIcons name="category" size={20} color="#1B7332" />
            <View>
              <Text style={styles.detailLabel}>Scrap Type</Text>
              <Text style={styles.detailValue}>{request.scrapType}</Text>
            </View>
          </View>
          <View style={styles.detailCard}>
            <MaterialIcons name="scale" size={20} color="#1B7332" />
            <View>
              <Text style={styles.detailLabel}>Weight</Text>
              <Text style={styles.detailValue}>{request.estimatedWeight}</Text>
            </View>
          </View>
        </View>
        <View style={styles.earningsCard}>
          <MaterialIcons name="attach-money" size={24} color="#1B7332" />
          <View style={styles.earningsInfo}>
            <Text style={styles.earningsLabel}>Estimated Earnings</Text>
            <Text style={styles.earningsValue}>₹{request.estimatedAmount}</Text>
          </View>
          <View style={styles.earningsIndicator}>
            <MaterialIcons name="trending-up" size={16} color="#1B7332" />
          </View>
        </View>
      </View>

      {/* Enhanced Action Buttons */}
      <View style={styles.actionButtons}>
        {request.status === 'pending' && (
          <TouchableOpacity
            onPress={() => handleConfirmRequest(request.id)}
            style={[styles.actionButton, styles.confirmButton]}
            activeOpacity={0.8}
          >
            <MaterialIcons name="check-circle" size={18} color="white" />
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          onPress={() => handleReschedule(request.id)}
          style={[styles.actionButton, styles.rescheduleButton]}
          activeOpacity={0.8}
        >
          <MaterialIcons name="schedule" size={16} color="#FF9800" />
          <Text style={styles.rescheduleButtonText}>Reschedule</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handleCancelRequest(request.id)}
          style={[styles.actionButton, styles.cancelButton]}
          activeOpacity={0.8}
        >
          <MaterialIcons name="cancel" size={16} color="#dc3545" />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const filteredRequests = getFilteredRequests();

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📅 Future Requests</Text>
          <Text style={styles.headerSubtitle}>Manage your scheduled pickups</Text>
        </View>
        <TouchableOpacity style={styles.refreshHeaderButton} onPress={onRefresh}>
          <MaterialIcons name="refresh" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Enhanced Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          {(['all', 'today', 'tomorrow', 'week'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filterTab,
                selectedFilter === filter && styles.filterTabActive
              ]}
            >
              <MaterialIcons 
                name={
                  filter === 'all' ? 'view-list' :
                  filter === 'today' ? 'today' :
                  filter === 'tomorrow' ? 'event' : 'date-range'
                } 
                size={16} 
                color={selectedFilter === filter ? 'white' : '#1B7332'} 
              />
              <Text style={[
                styles.filterTabText,
                selectedFilter === filter && styles.filterTabTextActive
              ]}>
                {filter === 'all' ? 'All Requests' : 
                 filter === 'today' ? 'Today' :
                 filter === 'tomorrow' ? 'Tomorrow' : 'This Week'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Enhanced Summary Stats */}
      <Animated.View style={[styles.summaryContainer, { opacity: fadeAnim }]}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <MaterialIcons name="assignment" size={20} color="#1B7332" />
          </View>
          <Text style={styles.summaryValue}>{futureRequests.length}</Text>
          <Text style={styles.summaryLabel}>Total Requests</Text>
        </View>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <MaterialIcons name="check-circle" size={20} color="#28a745" />
          </View>
          <Text style={styles.summaryValue}>
            {futureRequests.filter(r => r.status === 'confirmed').length}
          </Text>
          <Text style={styles.summaryLabel}>Confirmed</Text>
        </View>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <MaterialIcons name="account-balance-wallet" size={20} color="#FF9800" />
          </View>
          <Text style={styles.summaryValue}>
            ₹{futureRequests.reduce((sum, r) => sum + r.estimatedAmount, 0)}
          </Text>
          <Text style={styles.summaryLabel}>Est. Earnings</Text>
        </View>
      </Animated.View>

      {/* Enhanced Requests List */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1B7332']}
            tintColor="#1B7332"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request, index) => renderRequestCard(request, index))
        ) : (
          <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
            <View style={styles.emptyIcon}>
              <MaterialIcons name="schedule" size={48} color="#1B7332" />
            </View>
            <Text style={styles.emptyStateText}>No requests found</Text>
            <Text style={styles.emptyStateSubtext}>
              {selectedFilter === 'all' 
                ? 'Your scheduled pickup requests will appear here'
                : `No requests scheduled for ${selectedFilter}`
              }
            </Text>
            <TouchableOpacity style={styles.emptyActionButton} onPress={onRefresh}>
              <MaterialIcons name="refresh" size={16} color="white" />
              <Text style={styles.emptyActionText}>Refresh</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    backgroundColor: '#1B7332',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  refreshHeaderButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#1B7332',
    backgroundColor: 'white',
    gap: 6,
    minWidth: 100,
  },
  filterTabActive: {
    backgroundColor: '#1B7332',
    borderColor: '#1B7332',
  },
  filterTabText: {
    fontSize: 12,
    color: '#1B7332',
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: 'white',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(27, 115, 50, 0.1)',
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(27, 115, 50, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B7332',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6c757d',
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(27, 115, 50, 0.1)',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 115, 50, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  requestId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1B7332',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  customerInfo: {
    marginBottom: 12,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  callButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
  },
  requestDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6c757d',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  confirmButton: {
    backgroundColor: '#28a745',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  cancelButtonText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6c757d',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  // Enhanced styles for new UI components
  scheduleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  scheduleLabel: {
    fontSize: 10,
    color: '#6c757d',
    fontWeight: '600',
    marginBottom: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(27, 115, 50, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  customerDetails: {
    flex: 1,
  },
  customerPhone: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  addressText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
    lineHeight: 18,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  detailCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  detailLabel: {
    fontSize: 10,
    color: '#6c757d',
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  earningsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 115, 50, 0.05)',
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  earningsInfo: {
    flex: 1,
  },
  earningsLabel: {
    fontSize: 11,
    color: '#6c757d',
    fontWeight: '600',
    marginBottom: 2,
  },
  earningsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B7332',
  },
  earningsIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1B7332',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescheduleButton: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  rescheduleButtonText: {
    color: '#FF9800',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(27, 115, 50, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B7332',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    marginTop: 16,
  },
  emptyActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FutureRequestsScreen;