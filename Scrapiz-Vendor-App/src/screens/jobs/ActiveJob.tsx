import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ActiveJob as ActiveJobType } from '../../types';

interface ActiveJobProps {
  job: ActiveJobType;
  onStatusUpdate: (status: ActiveJobType['status']) => void;
  onCompleteJob: () => void;
  onBack: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ActiveJob = ({ job, onStatusUpdate, onCompleteJob, onBack, onShowToast }: ActiveJobProps) => {
  const [currentStatus, setCurrentStatus] = useState<ActiveJobType['status']>(job.status || 'on-the-way');
  const [isLoading, setIsLoading] = useState(false);

  const statusTimeline = [
    { value: 'on-the-way', label: 'On the Way' },
    { value: 'arrived', label: 'Arrived' },
    { value: 'in-progress', label: 'Weighing' },
    { value: 'completed', label: 'Completed' },
  ];

  const currentStatusIndex = statusTimeline.findIndex(s => s.value === currentStatus);

  const handleStatusChange = async (status: ActiveJobType['status']) => {
    try {
      setIsLoading(true);
      setCurrentStatus(status);
      onStatusUpdate(status);
      const statusLabel = statusTimeline.find(s => s.value === status)?.label;
      onShowToast(`Status updated to: ${statusLabel}!`, 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      onShowToast('Failed to update status. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = () => {
    try {
      Linking.openURL(`tel:${job.customerPhone}`);
    } catch (error) {
      console.error('Error making call:', error);
      onShowToast('Unable to make call. Please try again.', 'error');
    }
  };

  const handleNavigate = () => {
    try {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.address)}`;
      Linking.openURL(url);
    } catch (error) {
      console.error('Error opening navigation:', error);
      onShowToast('Unable to open navigation. Please try again.', 'error');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job #{job.id}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Map & Actions */}
        <View style={styles.mapCard}>
          <View style={styles.mapSection}>
            <MaterialIcons name="location-on" size={48} color="rgba(255,255,255,0.5)" />
            <View style={styles.mapContent}>
              <Text style={styles.distanceText}>{job.distance} away</Text>
              <Text style={styles.addressText}>{job.address}</Text>
            </View>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <MaterialIcons name="phone" size={20} color="#28a745" />
              <Text style={styles.actionButtonText}>Call Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.primaryAction]} onPress={handleNavigate}>
              <MaterialIcons name="navigation" size={20} color="#28a745" />
              <Text style={styles.actionButtonText}>Navigate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Customer & Job Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialIcons name="person" size={20} color="#28a745" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Customer</Text>
              <Text style={styles.infoValue}>{job.customerName}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialIcons name="local-offer" size={20} color="#28a745" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Scrap Type</Text>
              <Text style={styles.infoValue}>{job.scrapType}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialIcons name="phone" size={20} color="#28a745" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{job.customerPhone}</Text>
            </View>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Job Progress</Text>
          <View style={styles.statusTimeline}>
            {statusTimeline.map((status, index) => (
              <View key={status.value} style={styles.statusItem}>
                <View style={[
                  styles.statusIndicator,
                  index <= currentStatusIndex ? styles.statusActive : styles.statusInactive
                ]}>
                  {index < currentStatusIndex ? (
                    <MaterialIcons name="check" size={16} color="white" />
                  ) : (
                    <View style={[
                      styles.statusDot,
                      index === currentStatusIndex ? styles.statusCurrentDot : styles.statusInactiveDot
                    ]} />
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.statusButton}
                  onPress={() => handleStatusChange(status.value as any)}
                  disabled={index < currentStatusIndex || isLoading}
                >
                  <Text style={[
                    styles.statusText,
                    index <= currentStatusIndex ? styles.statusActiveText : styles.statusInactiveText,
                    index < currentStatusIndex ? styles.statusCompletedText : {}
                  ]}>
                    {status.label}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.floatingButton}>
        <TouchableOpacity
          style={[
            styles.completeButton,
            (currentStatus !== 'completed' || isLoading) ? styles.completeButtonDisabled : {}
          ]}
          onPress={onCompleteJob}
          disabled={currentStatus !== 'completed' || isLoading}
        >
          <MaterialIcons name="check-circle" size={20} color="white" />
          <Text style={styles.completeButtonText}>Proceed to Weight Entry</Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  mapCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  mapSection: {
    backgroundColor: '#28a745',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapContent: {
    alignItems: 'center',
    marginTop: 12,
  },
  distanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    backgroundColor: 'white',
  },
  primaryAction: {
    backgroundColor: '#E8F5E8',
    borderLeftWidth: 1,
    borderLeftColor: '#e9ecef',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#E8F5E8',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f8f9fa',
    marginVertical: 4,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  statusTimeline: {
    gap: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusActive: {
    backgroundColor: '#28a745',
  },
  statusInactive: {
    backgroundColor: '#e9ecef',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusCurrentDot: {
    backgroundColor: 'white',
  },
  statusInactiveDot: {
    backgroundColor: '#6c757d',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusActiveText: {
    color: '#333',
  },
  statusInactiveText: {
    color: '#6c757d',
  },
  statusCompletedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  completeButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  completeButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ActiveJob;