import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

interface JobHistoryScreenProps {
  onBack: () => void;
}

interface JobRecord {
  id: string;
  date: string;
  customerName: string;
  scrapType: string;
  amount: number;
  status: 'completed' | 'cancelled';
  rating?: number;
  address: string;
  weight: string;
}

const jobHistory: JobRecord[] = [
  {
    id: 'JOB001',
    date: '2024-12-11',
    customerName: 'Priya Sharma',
    scrapType: 'Mixed Scrap',
    amount: 850,
    status: 'completed',
    rating: 5,
    address: 'MG Road, Bangalore',
    weight: '15 kg'
  },
  {
    id: 'JOB002',
    date: '2024-12-10',
    customerName: 'Rajesh Kumar',
    scrapType: 'Paper & Cardboard',
    amount: 420,
    status: 'completed',
    rating: 4,
    address: 'Koramangala, Bangalore',
    weight: '8 kg'
  },
  {
    id: 'JOB003',
    date: '2024-12-10',
    customerName: 'Anita Singh',
    scrapType: 'Metal Scrap',
    amount: 1200,
    status: 'completed',
    rating: 5,
    address: 'Indiranagar, Bangalore',
    weight: '12 kg'
  },
  {
    id: 'JOB004',
    date: '2024-12-09',
    customerName: 'Vikram Patel',
    scrapType: 'Electronics',
    amount: 0,
    status: 'cancelled',
    address: 'Whitefield, Bangalore',
    weight: '0 kg'
  },
];

const JobHistoryScreen = ({ onBack }: JobHistoryScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'cancelled'>('all');

  const filteredJobs = jobHistory.filter(job => {
    const matchesSearch = job.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.scrapType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={14}
            color={star <= rating ? '#FFD700' : '#E0E0E0'}
          />
        ))}
      </View>
    );
  };

  const renderJobCard = (job: JobRecord) => (
    <View key={job.id} style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={styles.jobIdContainer}>
          <Text style={styles.jobId}>{job.id}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: job.status === 'completed' ? '#E8F5E8' : '#FFEBEE' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: job.status === 'completed' ? '#28a745' : '#dc3545' }
            ]}>
              {job.status === 'completed' ? 'Completed' : 'Cancelled'}
            </Text>
          </View>
        </View>
        <Text style={styles.jobDate}>{new Date(job.date).toLocaleDateString()}</Text>
      </View>

      <View style={styles.jobContent}>
        <View style={styles.customerInfo}>
          <MaterialIcons name="person" size={16} color="#6c757d" />
          <Text style={styles.customerName}>{job.customerName}</Text>
        </View>

        <View style={styles.jobDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="category" size={16} color="#6c757d" />
            <Text style={styles.detailText}>{job.scrapType}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={16} color="#6c757d" />
            <Text style={styles.detailText}>{job.address}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="scale" size={16} color="#6c757d" />
            <Text style={styles.detailText}>{job.weight}</Text>
          </View>
        </View>

        <View style={styles.jobFooter}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount:</Text>
            <Text style={[
              styles.amountValue,
              { color: job.status === 'completed' ? '#28a745' : '#6c757d' }
            ]}>
              {job.status === 'completed' ? `₹${job.amount}` : 'N/A'}
            </Text>
          </View>
          {job.rating && renderStars(job.rating)}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={20} color="#6c757d" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.filterContainer}>
          {(['all', 'completed', 'cancelled'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setFilterStatus(status)}
              style={[
                styles.filterButton,
                filterStatus === status && styles.filterButtonActive
              ]}
            >
              <Text style={[
                styles.filterButtonText,
                filterStatus === status && styles.filterButtonTextActive
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Job List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{jobHistory.filter(j => j.status === 'completed').length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₹{jobHistory.filter(j => j.status === 'completed').reduce((sum, j) => sum + j.amount, 0)}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{jobHistory.filter(j => j.status === 'cancelled').length}</Text>
            <Text style={styles.statLabel}>Cancelled</Text>
          </View>
        </View>

        <View style={styles.jobsList}>
          {filteredJobs.length > 0 ? (
            filteredJobs.map(renderJobCard)
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="history" size={48} color="#E0E0E0" />
              <Text style={styles.emptyStateText}>No jobs found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? 'Try adjusting your search' : 'Your job history will appear here'}
              </Text>
            </View>
          )}
        </View>
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
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
  },
  jobsList: {
    paddingHorizontal: 16,
  },
  jobCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jobId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
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
  jobDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  jobContent: {
    gap: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  jobDetails: {
    gap: 8,
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
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
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
  },
});

export default JobHistoryScreen;