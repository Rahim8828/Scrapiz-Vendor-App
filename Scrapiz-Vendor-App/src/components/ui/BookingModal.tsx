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
  StatusBar
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BookingRequest } from '../../types';
import { creditService } from '../../services/creditService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface BookingModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
  booking?: BookingRequest;
  currentCreditBalance?: number;
  onShowRechargeModal?: () => void;
}

const BookingModal = ({ 
  isVisible, 
  onClose, 
  onAccept, 
  onDecline, 
  booking, 
  currentCreditBalance = 0,
  onShowRechargeModal 
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

  // Countdown timer
  useEffect(() => {
    if (isVisible && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      onDecline();
    }
  }, [isVisible, countdown, onDecline]);

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
    
    // Haptic feedback simulation with animation
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
    if (isDeclining) return;
    
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
          {/* Enhanced Header with Gradient Effect */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.urgencyBadge}>
              <MaterialIcons name="flash-on" size={16} color="#fff" />
              <Text style={styles.urgencyText}>URGENT</Text>
            </View>
            
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
            
            <Text style={styles.headerTitle}>🚛 New Pickup Request</Text>
            <Text style={styles.headerSubtitle}>Respond quickly to secure this booking</Text>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Customer Info Card */}
            <View style={styles.customerCard}>
              <View style={styles.customerHeader}>
                <View style={styles.customerAvatar}>
                  <MaterialIcons name="person" size={24} color="#1B7332" />
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{currentBooking.customerName}</Text>
                  <View style={styles.phoneContainer}>
                    <MaterialIcons name="phone" size={14} color="#666" />
                    <Text style={styles.customerPhone}>{currentBooking.customerPhone}</Text>
                  </View>
                </View>
                <View style={styles.priorityBadge}>
                  <Text style={styles.priorityText}>HIGH</Text>
                </View>
              </View>
              
              <View style={styles.addressContainer}>
                <MaterialIcons name="location-on" size={18} color="#1B7332" />
                <Text style={styles.addressText}>{currentBooking.address}</Text>
              </View>
            </View>

            {/* Booking Details Card */}
            <View style={styles.detailsCard}>
              <Text style={styles.cardTitle}>📋 Booking Details</Text>
              
              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <MaterialIcons name="recycling" size={20} color="#1B7332" />
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Scrap Type</Text>
                    <Text style={styles.detailValue}>{currentBooking.scrapType}</Text>
                  </View>
                </View>
                
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <MaterialIcons name="navigation" size={20} color="#1B7332" />
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Distance</Text>
                    <Text style={styles.detailValue}>{currentBooking.distance}</Text>
                  </View>
                </View>
              </View>
              
              {/* Amount Section */}
              <View style={styles.amountSection}>
                <View style={styles.amountCard}>
                  <MaterialIcons name="attach-money" size={28} color="#1B7332" />
                  <View style={styles.amountInfo}>
                    <Text style={styles.amountLabel}>Estimated Earnings</Text>
                    <Text style={styles.amountValue}>₹{currentBooking.estimatedAmount}</Text>
                  </View>
                  <View style={styles.earningsIndicator}>
                    <MaterialIcons name="trending-up" size={16} color="#1B7332" />
                  </View>
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
            </View>
          </ScrollView>

          {/* Enhanced Sticky Action Buttons */}
          <View style={styles.stickyActions}>
            <View style={styles.actionGradient}>
              <TouchableOpacity 
                style={[
                  styles.declineButton,
                  isDeclining && styles.buttonPressed
                ]} 
                onPress={handleDecline}
                disabled={isDeclining}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  <MaterialIcons 
                    name={isDeclining ? "hourglass-empty" : "close"} 
                    size={22} 
                    color="#dc3545" 
                  />
                  <Text style={styles.declineText}>
                    {isDeclining ? "Declining..." : "Decline"}
                  </Text>
                </View>
                {isDeclining && <View style={styles.loadingOverlay} />}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.acceptButton,
                  !hasSufficientCredits && styles.acceptButtonRecharge,
                  isAccepting && styles.buttonPressed
                ]} 
                onPress={handleAccept}
                disabled={isAccepting}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  <MaterialIcons 
                    name={
                      isAccepting ? "hourglass-empty" :
                      hasSufficientCredits ? "check-circle" : "credit-card"
                    } 
                    size={22} 
                    color="#fff" 
                  />
                  <Text style={styles.acceptText}>
                    {isAccepting ? "Processing..." :
                     hasSufficientCredits ? "Accept Booking" : "Recharge & Accept"}
                  </Text>
                </View>
                {isAccepting && <View style={styles.loadingOverlay} />}
              </TouchableOpacity>
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
    paddingBottom: 25,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  urgencyBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  urgencyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 15,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  stickyActions: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  actionGradient: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#dc3545',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  acceptButton: {
    flex: 1.5,
    backgroundColor: '#1B7332',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  acceptButtonRecharge: {
    backgroundColor: '#FF9800',
    shadowColor: '#FF9800',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  declineText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  acceptText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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