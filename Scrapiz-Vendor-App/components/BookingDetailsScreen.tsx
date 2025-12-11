import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BookingRequest } from '../types';

interface BookingDetailsScreenProps {
  booking: BookingRequest;
  onBack: () => void;
  onAccept: () => void;
  onReject: () => void;
}

const BookingDetailsScreen = ({ booking, onBack, onAccept, onReject }: BookingDetailsScreenProps) => {
  const handleCall = () => {
    Linking.openURL(`tel:${booking.customerPhone}`);
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.address)}`;
    Linking.openURL(url);
  };

  const handleMessage = () => {
    Linking.openURL(`sms:${booking.customerPhone}`);
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Booking Details</Text>
        <TouchableOpacity style={styles.headerAction} onPress={handleCall} activeOpacity={0.7}>
          <MaterialIcons name="phone" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Enhanced Map Section */}
        <View style={styles.mapSection}>
          {/* Background Pattern */}
          <View style={styles.backgroundPattern}>
            <View style={styles.patternCircle1} />
            <View style={styles.patternCircle2} />
          </View>
          
          <View style={styles.mapHeader}>
            <View style={styles.distanceContainer}>
              <View style={styles.distanceIconContainer}>
                <MaterialIcons name="directions" size={18} color="white" />
              </View>
              <View>
                <Text style={styles.distanceText}>{booking.distance}</Text>
                <Text style={styles.distanceSubtext}>Away from you</Text>
              </View>
            </View>
            <View style={styles.newRequestBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.newRequestText}>Live</Text>
            </View>
          </View>
          
          <View style={styles.mapCenter}>
            <TouchableOpacity style={styles.locationIconContainer} onPress={handleNavigate} activeOpacity={0.8}>
              <MaterialIcons name="location-on" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.addressText} numberOfLines={3}>{booking.address}</Text>
            <TouchableOpacity style={styles.viewMapButton} onPress={handleNavigate} activeOpacity={0.8}>
              <MaterialIcons name="navigation" size={14} color="#1B7332" />
              <Text style={styles.viewMapText}>Navigate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.customerCard}>
              <View style={styles.customerAvatar}>
                <MaterialIcons name="person" size={24} color="white" />
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName} numberOfLines={1}>{booking.customerName}</Text>
                <TouchableOpacity style={styles.phoneContainer} onPress={handleCall} activeOpacity={0.7}>
                  <MaterialIcons name="phone" size={14} color="#1B7332" />
                  <Text style={styles.phoneNumber} numberOfLines={1}>{booking.customerPhone}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.customerActions}>
                <TouchableOpacity style={styles.quickActionBtn} onPress={handleMessage} activeOpacity={0.7}>
                  <MaterialIcons name="message" size={18} color="#1B7332" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickCallButton} onPress={handleCall} activeOpacity={0.7}>
                  <MaterialIcons name="call" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Job Details */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.jobDetailsCompact}>
              <View style={styles.detailRow}>
                <View style={styles.detailIconSmall}>
                  <MaterialIcons name="category" size={16} color="#1B7332" />
                </View>
                <Text style={styles.detailLabel}>Scrap Type</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{booking.scrapType}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailIconSmall}>
                  <MaterialIcons name="schedule" size={16} color="#1B7332" />
                </View>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{formatDate(booking.createdAt)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailIconSmall}>
                  <MaterialIcons name="payment" size={16} color="#1B7332" />
                </View>
                <Text style={styles.detailLabel}>Payment</Text>
                <View style={styles.paymentBadge}>
                  <Text style={styles.paymentText}>{booking.paymentMode}</Text>
                </View>
              </View>
            </View>
            
            {/* Enhanced Amount Section */}
            <View style={styles.amountSection}>
              <View style={styles.amountHeader}>
                <MaterialIcons name="account-balance-wallet" size={20} color="white" />
                <Text style={styles.amountTitle}>Estimated Earnings</Text>
              </View>
              <View style={styles.amountRow}>
                <Text style={styles.amountValue}>₹{booking.estimatedAmount.toLocaleString('en-IN')}</Text>
                <View style={styles.amountBadge}>
                  <MaterialIcons name="trending-up" size={14} color="#1B7332" />
                  <Text style={styles.amountBadgeText}>Est.</Text>
                </View>
              </View>
              <Text style={styles.amountNote}>
                <MaterialIcons name="info" size={10} color="rgba(40, 167, 69, 0.7)" />
                {' '}Final amount may vary based on weight
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <View style={styles.quickActions}>
            <TouchableOpacity style={[styles.actionButton, styles.callButton]} onPress={handleCall} activeOpacity={0.8}>
              <MaterialIcons name="phone" size={20} color="white" />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.navigateButton]} onPress={handleNavigate} activeOpacity={0.8}>
              <MaterialIcons name="navigation" size={20} color="white" />
              <Text style={styles.actionButtonText}>Navigate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Actions */}
      <View style={styles.bottomActions}>
        <View style={styles.mainActions}>
          <TouchableOpacity style={styles.rejectButton} onPress={onReject} activeOpacity={0.8}>
            <MaterialIcons name="close" size={18} color="#dc3545" />
            <Text style={styles.rejectButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptButton} onPress={onAccept} activeOpacity={0.9}>
            <MaterialIcons name="check" size={18} color="white" />
            <Text style={styles.acceptButtonText}>Accept Job</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#1B7332',
    paddingTop: 44,
    paddingBottom: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 12,
    borderRadius: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  headerAction: {
    padding: 12,
    borderRadius: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  mapSection: {
    backgroundColor: '#1B7332',
    minHeight: 180,
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  patternCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distanceIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 6,
  },
  distanceText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  distanceSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  newRequestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffd700',
  },
  newRequestText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  mapCenter: {
    alignItems: 'center',
    zIndex: 1,
  },
  locationIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 10,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  viewMapText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B7332',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(40, 167, 69, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  cardIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#E8F5E8',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  cardContent: {
    padding: 16,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fffe',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(40, 167, 69, 0.1)',
  },
  customerAvatar: {
    width: 44,
    height: 44,
    backgroundColor: '#1B7332',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  phoneNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1B7332',
  },
  customerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#E8F5E8',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickCallButton: {
    width: 36,
    height: 36,
    backgroundColor: '#1B7332',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  jobDetailsCompact: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fffe',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(40, 167, 69, 0.08)',
  },
  detailIconSmall: {
    width: 28,
    height: 28,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  paymentBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1B7332',
  },
  amountSection: {
    backgroundColor: '#1B7332',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  amountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  amountTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  amountValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
  amountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 3,
  },
  amountBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1B7332',
  },
  amountNote: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(40, 167, 69, 0.05)',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  callButton: {
    backgroundColor: '#1B7332',
  },
  navigateButton: {
    backgroundColor: '#17a2b8',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomActions: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 6,
  },
  mainActions: {
    flexDirection: 'row',
    gap: 10,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dc3545',
    gap: 6,
    minHeight: 48,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1B7332',
    gap: 6,
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    minHeight: 48,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default BookingDetailsScreen;