import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BookingRequest } from '../../types';

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
      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>Booking Request</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>New Request</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}>
            <MaterialIcons name="more-vert" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Improved Location Section */}
        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <View style={styles.distanceInfo}>
              <View style={styles.distanceIconContainer}>
                <MaterialIcons name="near-me" size={20} color="#1B7332" />
              </View>
              <View style={styles.distanceDetails}>
                <Text style={styles.distanceText}>{booking.distance}</Text>
                <Text style={styles.etaText}>~15 mins away</Text>
              </View>
            </View>
            <View style={styles.urgencyBadge}>
              <MaterialIcons name="schedule" size={14} color="#ff6b35" />
              <Text style={styles.urgencyText}>Urgent</Text>
            </View>
          </View>
          
          <View style={styles.addressContainer}>
            <View style={styles.addressHeader}>
              <MaterialIcons name="location-on" size={20} color="#1B7332" />
              <Text style={styles.addressLabel}>Pickup Location</Text>
            </View>
            <Text style={styles.addressText}>{booking.address}</Text>
            <View style={styles.locationActions}>
              <TouchableOpacity style={styles.navigateBtn} onPress={handleNavigate} activeOpacity={0.8}>
                <MaterialIcons name="navigation" size={16} color="white" />
                <Text style={styles.navigateBtnText}>Navigate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareLocationBtn} activeOpacity={0.8}>
                <MaterialIcons name="share" size={16} color="#1B7332" />
                <Text style={styles.shareLocationText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Enhanced Customer Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <MaterialIcons name="person" size={24} color="#1B7332" />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Customer Details</Text>
              <Text style={styles.cardSubtitle}>Contact information</Text>
            </View>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.customerCard}>
              <View style={styles.customerAvatar}>
                <Text style={styles.avatarText}>{booking.customerName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.customerInfo}>
                <View style={styles.customerNameRow}>
                  <Text style={styles.customerName} numberOfLines={1}>{booking.customerName}</Text>
                  <View style={styles.ratingContainer}>
                    <MaterialIcons name="star" size={14} color="#ffd700" />
                    <Text style={styles.ratingText}>4.8</Text>
                  </View>
                </View>
                
                <View style={styles.contactDetails}>
                  <TouchableOpacity style={styles.contactItem} onPress={handleCall} activeOpacity={0.7}>
                    <View style={styles.contactIcon}>
                      <MaterialIcons name="phone" size={16} color="#1B7332" />
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactLabel}>Phone Number</Text>
                      <Text style={styles.contactValue}>
                        {booking.customerPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3')}
                      </Text>
                      <Text style={styles.contactHint}>Tap to reveal & call</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color="#6c757d" />
                  </TouchableOpacity>
                </View>

                <View style={styles.customerMeta}>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <MaterialIcons name="history" size={14} color="#6c757d" />
                      <Text style={styles.metaText}>3 previous orders</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MaterialIcons name="verified" size={14} color="#28a745" />
                      <Text style={styles.metaTextVerified}>Verified</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.quickContactActions}>
              <TouchableOpacity style={styles.contactActionBtn} onPress={handleCall} activeOpacity={0.8}>
                <MaterialIcons name="phone" size={18} color="white" />
                <Text style={styles.contactActionText}>Call Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactActionBtn2} onPress={handleMessage} activeOpacity={0.8}>
                <MaterialIcons name="message" size={18} color="#1B7332" />
                <Text style={styles.contactActionText2}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Enhanced Job Details */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            {/* Primary Job Info */}
            <View style={styles.primaryJobInfo}>
              <View style={styles.scrapTypeSection}>
                <View style={styles.scrapTypeHeader}>
                  <MaterialIcons name="category" size={20} color="#1B7332" />
                  <Text style={styles.scrapTypeTitle}>Scrap Material</Text>
                  <View style={styles.priorityBadge}>
                    <MaterialIcons name="priority-high" size={12} color="#ff6b35" />
                    <Text style={styles.priorityText}>High Priority</Text>
                  </View>
                </View>
                <Text style={styles.scrapTypeValue}>{booking.scrapType}</Text>
                <Text style={styles.estimatedWeight}>Est. Weight: 15-25 kg</Text>
              </View>
            </View>

            {/* Secondary Details */}
            <View style={styles.secondaryDetails}>
              <View style={styles.detailItem}>
                <MaterialIcons name="schedule" size={16} color="#6c757d" />
                <Text style={styles.detailSecondaryLabel}>Pickup Date</Text>
                <Text style={styles.detailSecondaryValue}>{formatDate(booking.createdAt)}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <MaterialIcons name="payment" size={16} color="#6c757d" />
                <Text style={styles.detailSecondaryLabel}>Payment Method</Text>
                <View style={styles.paymentBadge}>
                  <Text style={styles.paymentText}>{booking.paymentMode}</Text>
                </View>
              </View>
            </View>
            
            {/* Enhanced Amount Section */}
            <View style={styles.amountSection}>
              <View style={styles.amountHeader}>
                <MaterialIcons name="account-balance-wallet" size={18} color="white" />
                <Text style={styles.amountTitle}>Estimated Value</Text>
              </View>
              <View style={styles.amountRow}>
                <View style={styles.amountRange}>
                  <Text style={styles.amountValue}>₹{(booking.estimatedAmount * 0.8).toLocaleString('en-IN')} - ₹{(booking.estimatedAmount * 1.2).toLocaleString('en-IN')}</Text>
                  <Text style={styles.amountAverage}>Avg: ₹{booking.estimatedAmount.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.amountBadge}>
                  <MaterialIcons name="trending-up" size={12} color="#1B7332" />
                  <Text style={styles.amountBadgeText}>Est.</Text>
                </View>
              </View>
              <View style={styles.amountBreakdown}>
                <Text style={styles.breakdownItem}>• Material value: 85%</Text>
                <Text style={styles.breakdownItem}>• Your commission: 15%</Text>
              </View>
            </View>
          </View>
        </View>


      </ScrollView>

      {/* Accept/Reject Booking Section */}
      <View style={styles.bottomActions}>
        <View style={styles.actionsSummary}>
          <View style={styles.summaryHeader}>
            <MaterialIcons name="assignment" size={22} color="#1B7332" />
            <Text style={styles.summaryTitle}>Accept Booking Request</Text>
          </View>
          <Text style={styles.summaryDescription}>
            Review the details above and choose your action
          </Text>
          
          {/* Action Buttons */}
          <View style={styles.mainActions}>
            <TouchableOpacity style={styles.rejectButton} onPress={onReject} activeOpacity={0.8}>
              <MaterialIcons name="close" size={20} color="#dc3545" />
              <Text style={styles.rejectButtonText}>Decline Booking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={onAccept} activeOpacity={0.9}>
              <MaterialIcons name="check-circle" size={20} color="white" />
              <Text style={styles.acceptButtonText}>Accept Booking</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 10,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffd700',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  headerAction: {
    padding: 8,
    borderRadius: 10,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  locationSection: {
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(27, 115, 50, 0.1)',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  distanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  distanceIconContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 10,
    padding: 8,
  },
  distanceDetails: {
    gap: 2,
  },
  distanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  etaText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ff6b35',
  },
  addressContainer: {
    backgroundColor: '#f8fffe',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(27, 115, 50, 0.1)',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1B7332',
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  locationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  navigateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B7332',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  navigateBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  shareLocationBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#1B7332',
  },
  shareLocationText: {
    fontSize: 13,
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
    width: 48,
    height: 48,
    backgroundColor: '#1B7332',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  customerInfo: {
    flex: 1,
  },
  customerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#fff9e6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f39c12',
  },
  contactDetails: {
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(27, 115, 50, 0.1)',
    gap: 12,
  },
  contactIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  contactHint: {
    fontSize: 10,
    color: '#1B7332',
    fontStyle: 'italic',
  },
  customerMeta: {
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  metaText: {
    fontSize: 11,
    color: '#6c757d',
    fontWeight: '500',
  },
  metaTextVerified: {
    fontSize: 11,
    color: '#28a745',
    fontWeight: '600',
  },
  quickContactActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  contactActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B7332',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  contactActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  contactActionBtn2: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#1B7332',
  },
  contactActionText2: {
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
  primaryJobInfo: {
    marginBottom: 16,
  },
  scrapTypeSection: {
    backgroundColor: '#f8fffe',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(27, 115, 50, 0.1)',
  },
  scrapTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  scrapTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B7332',
    flex: 1,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ff6b35',
  },
  scrapTypeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  estimatedWeight: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  secondaryDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  detailSecondaryLabel: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '500',
    flex: 1,
  },
  detailSecondaryValue: {
    fontSize: 13,
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
    marginBottom: 12,
    gap: 6,
  },
  amountTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  amountRange: {
    flex: 1,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  amountAverage: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  amountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 2,
  },
  amountBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1B7332',
  },
  amountBreakdown: {
    gap: 2,
  },
  breakdownItem: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },

  bottomActions: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 6,
  },
  actionsSummary: {
    backgroundColor: '#f8fffe',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(27, 115, 50, 0.1)',
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B7332',
  },
  summaryDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
  mainActions: {
    flexDirection: 'row',
    gap: 12,
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
    backgroundColor: 'white',
    gap: 6,
    minHeight: 50,
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rejectButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1B7332',
    gap: 6,
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 50,
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default BookingDetailsScreen;