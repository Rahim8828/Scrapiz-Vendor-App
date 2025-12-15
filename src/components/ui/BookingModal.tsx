import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  Alert, 
  ScrollView, 
  Animated,
  Dimensions,
  StatusBar,
  Linking
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import { BookingRequest } from '../../types';
import { creditService } from '../../services/creditService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface BookingModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline?: () => void;
  booking?: BookingRequest;
  currentCreditBalance?: number;
  onShowRechargeModal?: () => void;
  isAccepted?: boolean; // For jobs that are already accepted (manage tab)
}

const BookingModal = ({ 
  isVisible, 
  onClose, 
  onAccept, 
  onDecline, 
  booking, 
  currentCreditBalance = 0,
  onShowRechargeModal,
  isAccepted = false
}: BookingModalProps) => {
  const [countdown, setCountdown] = useState(60);
  const [creditBalance, setCreditBalance] = useState(currentCreditBalance);
  const [slideAnim] = useState(new Animated.Value(screenHeight));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  // Mock booking data if none provided
  const mockBooking: BookingRequest = {
    id: '1',
    scrapType: 'Mixed Scrap',
    distance: '2.5 km',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98765 43210',
    address: 'Shop No. 45, MG Road, Bangalore',
    paymentMode: 'Cash',
    estimatedAmount: 850,
    createdAt: new Date()
  };

  const currentBooking = booking || mockBooking;
  const requiredCredits = creditService.calculateRequiredCredits(currentBooking.estimatedAmount);
  const hasSufficientCredits = creditBalance >= requiredCredits;

  // Animations
  useEffect(() => {
    if (isVisible) {
      setCountdown(60);
      setCreditBalance(currentCreditBalance);
      setIsAccepting(false);
      setIsDeclining(false);
      
      // Slide up animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Slide down animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isVisible, currentCreditBalance]);

  // Countdown timer - only for new bookings
  useEffect(() => {
    if (isVisible && countdown > 0 && !isAccepted) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isAccepted && onDecline) {
      onDecline();
    }
  }, [isVisible, countdown, onDecline, isAccepted]);

  // Pulse animation for timer when low
  useEffect(() => {
    if (countdown <= 10 && countdown > 0) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [countdown]);

  const handleCall = async () => {
    try {
      if (Haptics?.impactAsync) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      const phoneNumber = currentBooking.customerPhone.replace(/\s+/g, '');
      await Linking.openURL(`tel:${phoneNumber}`);
    } catch (error) {
      Alert.alert('Error', 'Unable to make call');
    }
  };

  const handleAccept = () => {
    if (isAccepting) return;
    
    if (!hasSufficientCredits) {
      Alert.alert(
        '💳 Insufficient Credits',
        `You need ${requiredCredits} credits for this ₹${currentBooking.estimatedAmount} booking but only have ${creditBalance}.\n\nWould you like to recharge now?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: '⚡ Recharge Now', 
            onPress: () => {
              onClose();
              onShowRechargeModal?.();
            }
          }
        ]
      );
      return;
    }

    setIsAccepting(true);
    
    // Enhanced haptic feedback
    if (Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    // Improved animation feedback
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();

    setTimeout(() => {
      Alert.alert(
        '✅ Accept Booking',
        `Confirm acceptance of this booking?\n\n• Amount: ₹${currentBooking.estimatedAmount}\n• Credits: ${requiredCredits} will be deducted\n• Customer: ${currentBooking.customerName}`,
        [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: () => setIsAccepting(false)
          },
          { 
            text: '✅ Confirm Accept', 
            onPress: () => {
              onAccept();
              setIsAccepting(false);
            }
          }
        ]
      );
    }, 200);
  };

  const handleDecline = () => {
    if (isDeclining || !onDecline) return;
    
    setIsDeclining(true);
    
    Alert.alert(
      '❌ Decline Booking',
      `Are you sure you want to decline this booking from ${currentBooking.customerName}?\n\nThis action cannot be undone.`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => setIsDeclining(false)
        },
        { 
          text: '❌ Decline', 
          style: 'destructive',
          onPress: () => {
            onDecline();
            setIsDeclining(false);
          }
        }
      ]
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.8)" barStyle="light-content" />
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View 
          style={[
            styles.modal, 
            { 
              transform: [
                { translateY: slideAnim },
                { scale: pulseAnim }
              ] 
            }
          ]}
        >
          {/* Enhanced Header with Better Design */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.headerCenter}>
                <View style={styles.urgencyBadge}>
                  <MaterialIcons name="flash-on" size={16} color="#fff" />
                  <Text style={styles.urgencyText}>HIGH PRIORITY</Text>
                </View>
                
                {!isAccepted ? (
                  <Animated.View style={[styles.timerContainer, { transform: [{ scale: pulseAnim }] }]}>
                    <View style={[
                      styles.timerCircle, 
                      { 
                        borderColor: countdown <= 10 ? '#ff4757' : '#fff',
                        backgroundColor: countdown <= 10 ? 'rgba(255, 71, 87, 0.2)' : 'rgba(255, 255, 255, 0.1)'
                      }
                    ]}>
                      <Text style={[
                        styles.timerText, 
                        { color: countdown <= 10 ? '#ff4757' : '#fff' }
                      ]}>
                        {countdown}
                      </Text>
                    </View>
                    <Text style={styles.timerLabel}>seconds left</Text>
                  </Animated.View>
                ) : (
                  <View style={styles.timerContainer}>
                    <View style={[styles.timerCircle, { borderColor: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                      <MaterialIcons name="check-circle" size={32} color="#fff" />
                    </View>
                    <Text style={styles.timerLabel}>accepted</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.earningsPreview}>
                <Text style={styles.earningsLabel}>Earnings</Text>
                <Text style={styles.earningsAmount}>₹{currentBooking.estimatedAmount}</Text>
              </View>
            </View>
            
            <View style={styles.headerBottom}>
              <Text style={styles.headerTitle}>📍 Pickup Request Details</Text>
              <Text style={styles.headerSubtitle}>Review and respond to this booking</Text>
            </View>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Enhanced Customer Info Card */}
            <View style={styles.customerCard}>
              <View style={styles.customerHeader}>
                <View style={styles.customerAvatar}>
                  <Text style={styles.customerInitial}>
                    {currentBooking.customerName.charAt(0).toUpperCase()}
                  </Text>
                  {currentBooking.isVerified && (
                    <View style={styles.verificationBadge}>
                      <MaterialIcons name="verified" size={12} color="#1B7332" />
                    </View>
                  )}
                </View>
                <View style={styles.customerInfo}>
                  <View style={styles.customerNameRow}>
                    <Text style={styles.customerName}>{currentBooking.customerName}</Text>
                    {currentBooking.customerRating && (
                      <View style={styles.ratingContainer}>
                        <MaterialIcons name="star" size={16} color="#FFD700" />
                        <Text style={styles.ratingText}>{currentBooking.customerRating}</Text>
                      </View>
                    )}
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.phoneContainer}
                    onPress={handleCall}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="phone" size={16} color="#1B7332" />
                    <Text style={styles.customerPhone}>{currentBooking.customerPhone}</Text>
                    <MaterialIcons name="call" size={16} color="#1B7332" />
                  </TouchableOpacity>
                  
                  {currentBooking.customerReviews && (
                    <Text style={styles.reviewsText}>
                      {currentBooking.customerReviews} reviews • Verified customer
                    </Text>
                  )}
                </View>
              </View>
              
              <View style={styles.addressContainer}>
                <View style={styles.addressHeader}>
                  <MaterialIcons name="location-on" size={20} color="#1B7332" />
                  <Text style={styles.addressLabel}>Pickup Location</Text>
                  <TouchableOpacity style={styles.navigationBtn}>
                    <MaterialIcons name="navigation" size={16} color="#1B7332" />
                    <Text style={styles.navigationText}>Navigate</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.addressText}>{currentBooking.address}</Text>
                <View style={styles.distanceInfo}>
                  <MaterialIcons name="directions-car" size={16} color="#666" />
                  <Text style={styles.distanceText}>{currentBooking.distance} away</Text>
                  <Text style={styles.estimatedTime}>• {currentBooking.estimatedTime || '15 mins'}</Text>
                </View>
              </View>
            </View>

            {/* Enhanced Scrap Details Card */}
            <View style={styles.scrapDetailsCard}>
              <View style={styles.scrapHeader}>
                <MaterialIcons name="recycling" size={24} color="#1B7332" />
                <Text style={styles.scrapTitle}>Scrap Collection Details</Text>
              </View>
              
              <View style={styles.scrapInfo}>
                <View style={styles.scrapTypeSection}>
                  <Text style={styles.scrapTypeLabel}>Material Type</Text>
                  <Text style={styles.scrapTypeValue}>{currentBooking.scrapType}</Text>
                  {currentBooking.estimatedWeight && (
                    <Text style={styles.weightText}>Estimated: {currentBooking.estimatedWeight}</Text>
                  )}
                </View>
                
                <View style={styles.paymentInfo}>
                  <MaterialIcons name="payment" size={20} color="#1B7332" />
                  <Text style={styles.paymentMode}>{currentBooking.paymentMode}</Text>
                </View>
              </View>
              
              {/* Enhanced Earnings Breakdown */}
              <View style={styles.earningsBreakdown}>
                <Text style={styles.breakdownTitle}>💰 Earnings Breakdown</Text>
                
                {currentBooking.baseRate && currentBooking.distanceBonus ? (
                  <View style={styles.breakdownDetails}>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Base Rate</Text>
                      <Text style={styles.breakdownValue}>₹{currentBooking.baseRate}</Text>
                    </View>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Distance Bonus</Text>
                      <Text style={styles.breakdownValue}>₹{currentBooking.distanceBonus}</Text>
                    </View>
                    <View style={styles.breakdownDivider} />
                    <View style={styles.breakdownRow}>
                      <Text style={styles.totalLabel}>Total Earnings</Text>
                      <Text style={styles.totalValue}>₹{currentBooking.estimatedAmount}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.simpleEarnings}>
                    <MaterialIcons name="account-balance-wallet" size={32} color="#1B7332" />
                    <View style={styles.earningsInfo}>
                      <Text style={styles.earningsBreakdownLabel}>Total Earnings</Text>
                      <Text style={styles.earningsValue}>₹{currentBooking.estimatedAmount}</Text>
                    </View>
                    <MaterialIcons name="trending-up" size={24} color="#1B7332" />
                  </View>
                )}
              </View>
            </View>

            {/* Credit Requirements */}
            <View style={styles.creditSection}>
              <View style={[
                styles.creditCard,
                { backgroundColor: hasSufficientCredits ? '#E8F5E8' : '#FFF3E0' }
              ]}>
                <View style={styles.creditHeader}>
                  <MaterialIcons 
                    name="stars" 
                    size={24} 
                    color={hasSufficientCredits ? "#1B7332" : "#FF9800"} 
                  />
                  <Text style={styles.creditTitle}>Credit Requirements</Text>
                </View>
                
                <View style={styles.creditDetails}>
                  <View style={styles.creditRow}>
                    <Text style={styles.creditLabel}>Required:</Text>
                    <Text style={[
                      styles.creditValue, 
                      { color: hasSufficientCredits ? "#1B7332" : "#FF9800" }
                    ]}>
                      {requiredCredits} credits
                    </Text>
                  </View>
                  
                  <View style={styles.creditRow}>
                    <Text style={styles.creditLabel}>Your Balance:</Text>
                    <Text style={[
                      styles.creditBalance,
                      { color: hasSufficientCredits ? "#1B7332" : "#dc3545" }
                    ]}>
                      {creditBalance} credits
                    </Text>
                  </View>
                  
                  {!hasSufficientCredits && (
                    <View style={styles.warningContainer}>
                      <MaterialIcons name="warning" size={16} color="#dc3545" />
                      <Text style={styles.creditWarning}>
                        Need {requiredCredits - creditBalance} more credits
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Redesigned Action Section - Matching Image Style */}
          <View style={styles.actionSection}>
            {/* Action Header */}
            <View style={styles.actionHeader}>
              <View style={styles.actionHeaderIcon}>
                <MaterialIcons 
                  name={isAccepted ? "check-circle" : "assignment"} 
                  size={24} 
                  color="#1B7332" 
                />
              </View>
              <View style={styles.actionHeaderText}>
                <Text style={styles.actionTitle}>
                  {isAccepted ? "Job Details" : "Accept Booking Request"}
                </Text>
                <Text style={styles.actionSubtitle}>
                  {isAccepted 
                    ? "View job details and manage your booking"
                    : "Review the details above and choose your action"
                  }
                </Text>
              </View>
            </View>

            {/* Credit Status Bar - Only show for new bookings */}
            {!isAccepted && !hasSufficientCredits && (
              <View style={styles.creditStatusBar}>
                <View style={styles.creditStatusIcon}>
                  <MaterialIcons name="warning" size={20} color="#FF9800" />
                </View>
                <View style={styles.creditStatusText}>
                  <Text style={styles.creditStatusTitle}>Insufficient Credits</Text>
                  <Text style={styles.creditStatusSubtitle}>
                    Need {requiredCredits - creditBalance} more credits to accept this booking
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.rechargeQuickBtn}
                  onPress={() => {
                    onClose();
                    onShowRechargeModal?.();
                  }}
                >
                  <MaterialIcons name="flash-on" size={16} color="#FF9800" />
                  <Text style={styles.rechargeQuickText}>Recharge</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Accepted Job Status Bar */}
            {isAccepted && (
              <View style={[styles.creditStatusBar, { backgroundColor: '#E8F5E8', borderLeftColor: '#1B7332' }]}>
                <View style={styles.creditStatusIcon}>
                  <MaterialIcons name="check-circle" size={20} color="#1B7332" />
                </View>
                <View style={styles.creditStatusText}>
                  <Text style={[styles.creditStatusTitle, { color: '#1B7332' }]}>Job Accepted</Text>
                  <Text style={styles.creditStatusSubtitle}>
                    This job is already in your queue. Use quick actions below to manage it.
                  </Text>
                </View>
              </View>
            )}

            {/* Main Action Buttons - Different for accepted jobs */}
            {isAccepted ? (
              <View style={styles.mainActionButtons}>
                {/* Close Button for accepted jobs */}
                <TouchableOpacity 
                  style={[styles.newAcceptButton, { backgroundColor: '#1B7332' }]}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="check" size={20} color="#fff" />
                  <Text style={styles.newAcceptText}>Close Details</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.mainActionButtons}>
                {/* Decline Button - New Design */}
                <TouchableOpacity 
                  style={[
                    styles.newDeclineButton,
                    isDeclining && styles.buttonPressed
                  ]} 
                  onPress={handleDecline}
                  disabled={isDeclining}
                  activeOpacity={0.8}
                >
                  <MaterialIcons 
                    name={isDeclining ? "hourglass-empty" : "close"} 
                    size={20} 
                    color="#dc3545" 
                  />
                  <Text style={styles.newDeclineText}>
                    {isDeclining ? "Declining..." : "Decline Booking"}
                  </Text>
                </TouchableOpacity>
                
                {/* Accept Button - New Design */}
                <TouchableOpacity 
                  style={[
                    styles.newAcceptButton,
                    !hasSufficientCredits && styles.newAcceptButtonDisabled,
                    isAccepting && styles.buttonPressed
                  ]} 
                  onPress={handleAccept}
                  disabled={isAccepting || !hasSufficientCredits}
                  activeOpacity={0.8}
                >
                  <MaterialIcons 
                    name={
                      isAccepting ? "hourglass-empty" :
                      hasSufficientCredits ? "check-circle" : "lock"
                    } 
                    size={20} 
                    color="#fff" 
                  />
                  <Text style={styles.newAcceptText}>
                    {isAccepting ? "Processing..." :
                     hasSufficientCredits ? "Accept Booking" : "Insufficient Credits"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Quick Actions Row */}
            <View style={styles.quickActionsContainer}>
              <Text style={styles.quickActionsLabel}>Quick Actions</Text>
              <View style={styles.quickActionsRow}>
                <TouchableOpacity style={styles.quickActionButton} onPress={handleCall}>
                  <MaterialIcons name="phone" size={20} color="#1B7332" />
                  <Text style={styles.quickActionLabel}>Call</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.quickActionButton}>
                  <MaterialIcons name="message" size={20} color="#1B7332" />
                  <Text style={styles.quickActionLabel}>Message</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.quickActionButton}>
                  <MaterialIcons name="navigation" size={20} color="#1B7332" />
                  <Text style={styles.quickActionLabel}>Navigate</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.quickActionButton}>
                  <MaterialIcons name="share" size={20} color="#1B7332" />
                  <Text style={styles.quickActionLabel}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Info Strip */}
            <View style={styles.bottomInfoStrip}>
              <View style={styles.infoStripItem}>
                <MaterialIcons name={isAccepted ? "check-circle" : "schedule"} size={14} color={isAccepted ? "#1B7332" : "#666"} />
                <Text style={[styles.infoStripText, isAccepted && { color: "#1B7332" }]}>
                  {isAccepted ? "Accepted" : `${countdown}s left`}
                </Text>
              </View>
              <View style={styles.infoStripDivider} />
              <View style={styles.infoStripItem}>
                <MaterialIcons name="account-balance-wallet" size={14} color="#1B7332" />
                <Text style={styles.infoStripText}>{creditBalance} credits</Text>
              </View>
              <View style={styles.infoStripDivider} />
              <View style={styles.infoStripItem}>
                <MaterialIcons name="attach-money" size={14} color="#FF9800" />
                <Text style={styles.infoStripText}>₹{currentBooking.estimatedAmount}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    width: screenWidth,
    maxHeight: screenHeight * 0.95,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  header: {
    backgroundColor: '#1B7332',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4757',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 12,
  },
  
  urgencyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  timerContainer: {
    alignItems: 'center',
  },
  
  earningsPreview: {
    alignItems: 'flex-end',
  },
  
  earningsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  
  earningsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  
  headerBottom: {
    alignItems: 'center',
  },
  timerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  timerLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  customerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#1B7332',
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1B7332',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  
  customerInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  
  verificationBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1B7332',
  },
  
  customerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  
  reviewsText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(27, 115, 50, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(27, 115, 50, 0.2)',
  },
  customerPhone: {
    fontSize: 14,
    color: '#1B7332',
    fontWeight: '600',
    flex: 1,
  },
  priorityBadge: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addressContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B7332',
    flex: 1,
    marginLeft: 8,
  },
  
  navigationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 115, 50, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  
  navigationText: {
    fontSize: 12,
    color: '#1B7332',
    fontWeight: '600',
  },
  
  addressText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  
  distanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  distanceText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  
  estimatedTime: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  scrapDetailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  scrapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  
  scrapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  
  scrapInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  
  scrapTypeSection: {
    flex: 1,
  },
  
  scrapTypeLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  
  scrapTypeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  
  weightText: {
    fontSize: 12,
    color: '#1B7332',
    fontWeight: '600',
  },
  
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 115, 50, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  
  paymentMode: {
    fontSize: 14,
    color: '#1B7332',
    fontWeight: '600',
  },
  
  earningsBreakdown: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  
  breakdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  
  breakdownDetails: {
    gap: 8,
  },
  
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  breakdownLabel: {
    fontSize: 14,
    color: '#666',
  },
  
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  
  breakdownDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B7332',
  },
  
  simpleEarnings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  earningsInfo: {
    flex: 1,
  },
  
  earningsBreakdownLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  
  earningsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B7332',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  amountSection: {
    marginBottom: 20,
  },
  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  amountInfo: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B7332',
  },
  earningsIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1B7332',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditSection: {
    marginBottom: 20,
  },
  creditCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(27, 115, 50, 0.2)',
  },
  creditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  creditTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  creditDetails: {
    gap: 8,
  },
  creditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creditLabel: {
    fontSize: 14,
    color: '#666',
  },
  creditValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  creditBalance: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 8,
  },
  creditWarning: {
    fontSize: 12,
    color: '#dc3545',
    fontWeight: '600',
    flex: 1,
  },
  // Redesigned Action Section - Matching Image Style
  actionSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Action Header
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  actionHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  actionHeaderText: {
    flex: 1,
  },
  
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  // Credit Status Bar
  creditStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  
  creditStatusIcon: {
    marginRight: 12,
  },
  
  creditStatusText: {
    flex: 1,
  },
  
  creditStatusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 2,
  },
  
  creditStatusSubtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  
  rechargeQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  
  rechargeQuickText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Main Action Buttons - New Design
  mainActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  
  newDeclineButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#dc3545',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 56,
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  newDeclineText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  
  newAcceptButton: {
    flex: 1,
    backgroundColor: '#1B7332',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 56,
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  
  newAcceptButtonDisabled: {
    backgroundColor: '#ccc',
    shadowColor: '#ccc',
  },
  
  newAcceptText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  
  // Quick Actions Container
  quickActionsContainer: {
    marginBottom: 20,
  },
  
  quickActionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 60,
  },
  
  quickActionLabel: {
    fontSize: 11,
    color: '#1B7332',
    fontWeight: '600',
    marginTop: 4,
  },
  
  // Bottom Info Strip
  bottomInfoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  
  infoStripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  
  infoStripText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  
  infoStripDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
  },
});

export default BookingModal;