import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

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

  const handleConfirmRequest = (requestId: string) => {
    Alert.alert(
      'Confirm Request',
      'Are you sure you want to confirm this pickup request?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            Alert.alert('Success', 'Request confirmed successfully!');
          }
        }
      ]
    );
  };

  const handleCancelRequest = (requestId: string) => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this pickup request?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Cancelled', 'Request has been cancelled.');
          }
        }
      ]
    );
  };

  const handleCallCustomer = (phone: string) => {
    Alert.alert('Call Customer', `Calling ${phone}...`);
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

  const renderRequestCard = (request: FutureRequest) => (
    <View key={request.id} style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.requestIdContainer}>
          <Text style={styles.requestId}>{request.id}</Text>
          <View style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(request.priority) + '20' }
          ]}>
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
          <Text style={[
            styles.statusText,
            { color: getStatusColor(request.status) }
          ]}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.scheduleInfo}>
        <View style={styles.scheduleItem}>
          <MaterialIcons name="calendar-today" size={16} color="#28a745" />
          <Text style={styles.scheduleText}>
            {new Date(request.scheduledDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.scheduleItem}>
          <MaterialIcons name="access-time" size={16} color="#28a745" />
          <Text style={styles.scheduleText}>{request.scheduledTime}</Text>
        </View>
      </View>

      <View style={styles.customerInfo}>
        <View style={styles.customerRow}>
          <MaterialIcons name="person" size={16} color="#6c757d" />
          <Text style={styles.customerName}>{request.customerName}</Text>
          <TouchableOpacity 
            onPress={() => handleCallCustomer(request.customerPhone)}
            style={styles.callButton}
          >
            <MaterialIcons name="phone" size={16} color="#28a745" />
          </TouchableOpacity>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="location-on" size={16} color="#6c757d" />
          <Text style={styles.detailText}>{request.address}</Text>
        </View>
      </View>

      <View style={styles.requestDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="category" size={16} color="#6c757d" />
          <Text style={styles.detailText}>{request.scrapType}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="scale" size={16} color="#6c757d" />
          <Text style={styles.detailText}>{request.estimatedWeight}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="attach-money" size={16} color="#6c757d" />
          <Text style={styles.detailText}>₹{request.estimatedAmount} (est.)</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        {request.status === 'pending' && (
          <TouchableOpacity
            onPress={() => handleConfirmRequest(request.id)}
            style={[styles.actionButton, styles.confirmButton]}
          >
            <MaterialIcons name="check" size={16} color="white" />
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => handleCancelRequest(request.id)}
          style={[styles.actionButton, styles.cancelButton]}
        >
          <MaterialIcons name="close" size={16} color="#dc3545" />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredRequests = getFilteredRequests();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Future Requests</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'today', 'tomorrow', 'week'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setSelectedFilter(filter)}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.filterTabActive
            ]}
          >
            <Text style={[
              styles.filterTabText,
              selectedFilter === filter && styles.filterTabTextActive
            ]}>
              {filter === 'all' ? 'All' : 
               filter === 'today' ? 'Today' :
               filter === 'tomorrow' ? 'Tomorrow' : 'This Week'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{futureRequests.length}</Text>
          <Text style={styles.summaryLabel}>Total Requests</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {futureRequests.filter(r => r.status === 'confirmed').length}
          </Text>
          <Text style={styles.summaryLabel}>Confirmed</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            ₹{futureRequests.reduce((sum, r) => sum + r.estimatedAmount, 0)}
          </Text>
          <Text style={styles.summaryLabel}>Est. Earnings</Text>
        </View>
      </View>

      {/* Requests List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredRequests.length > 0 ? (
          filteredRequests.map(renderRequestCard)
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="schedule" size={48} color="#E0E0E0" />
            <Text style={styles.emptyStateText}>No requests found</Text>
            <Text style={styles.emptyStateSubtext}>
              {selectedFilter === 'all' 
                ? 'Your scheduled pickup requests will appear here'
                : `No requests scheduled for ${selectedFilter}`
              }
            </Text>
          </View>
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
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  filterTabActive: {
    backgroundColor: '#28a745',
  },
  filterTabText: {
    fontSize: 14,
    color: '#6c757d',
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
    paddingVertical: 12,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
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
  requestId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
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
});

export default FutureRequestsScreen;