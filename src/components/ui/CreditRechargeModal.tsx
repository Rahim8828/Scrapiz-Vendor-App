import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { CreditPackage, PaymentMethod } from '../../types';
import { creditRechargeService, CreditRechargeResult } from '../../services/creditRechargeService';

interface CreditRechargeModalProps {
  visible: boolean;
  onClose: () => void;
  onRechargeSuccess: (result: CreditRechargeResult) => void;
  onRechargeError: (error: string) => void;
  currentBalance: number;
  onNavigateToCredit?: () => void;
}

const PREDEFINED_PACKAGES: CreditPackage[] = [
  {
    id: 'package_10',
    credits: 10,
    price: 100,
    description: '10 Credits',
  },
  {
    id: 'package_25',
    credits: 25,
    price: 250,
    description: '25 Credits',
    popular: true,
  },
  {
    id: 'package_50',
    credits: 50,
    price: 500,
    description: '50 Credits',
  },
  {
    id: 'package_100',
    credits: 100,
    price: 1000,
    description: '100 Credits',
    bonus: 10,
  },
];

export const CreditRechargeModal: React.FC<CreditRechargeModalProps> = ({
  visible,
  onClose,
  onRechargeSuccess,
  onRechargeError,
  currentBalance,
  onNavigateToCredit,
}) => {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [customCredits, setCustomCredits] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load payment methods on component mount
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await creditRechargeService.getPaymentMethods();
      setPaymentMethods(methods);
      // Set default payment method
      const defaultMethod = methods.find(m => m.isDefault) || methods[0];
      setSelectedPaymentMethod(defaultMethod);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      // Fallback to default methods
      const fallbackMethods: PaymentMethod[] = [
        { id: 'upi', name: 'UPI', type: 'upi', isDefault: true },
        { id: 'card', name: 'Credit/Debit Card', type: 'card' },
      ];
      setPaymentMethods(fallbackMethods);
      setSelectedPaymentMethod(fallbackMethods[0]);
    }
  };

  const calculateCost = (credits: number): number => {
    return creditRechargeService.calculateCreditCost(credits);
  };

  const getSelectedCredits = (): number => {
    if (isCustomMode) {
      return parseInt(customCredits) || 0;
    }
    return selectedPackage?.credits || 0;
  };

  const getSelectedCost = (): number => {
    const credits = getSelectedCredits();
    if (selectedPackage?.bonus && !isCustomMode) {
      return selectedPackage.price;
    }
    return calculateCost(credits);
  };

  const handleRecharge = async () => {
    const credits = getSelectedCredits();
    const cost = getSelectedCost();

    // Validate credit purchase
    const validation = creditRechargeService.validateCreditPurchase(credits);
    if (!validation.valid) {
      Alert.alert('Invalid Purchase', validation.error || 'Invalid credit amount');
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert('Payment Method Required', 'Please select a payment method');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Process recharge through service
      const result = await creditRechargeService.processRecharge(cost, credits);
      
      if (result.success) {
        onRechargeSuccess(result);
        resetForm();
        onClose();
        // Navigate to credit screen after successful recharge
        if (onNavigateToCredit) {
          onNavigateToCredit();
        }
      } else {
        onRechargeError(result.error || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Recharge error:', error);
      onRechargeError('Unable to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedPackage(null);
    setCustomCredits('');
    setIsCustomMode(false);
    const defaultMethod = paymentMethods.find(m => m.isDefault) || paymentMethods[0];
    setSelectedPaymentMethod(defaultMethod);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recharge Credits</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Current Balance */}
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceValue}>{currentBalance} Credits</Text>
          </View>

          {/* Package Selection Toggle */}
          <View style={styles.toggleSection}>
            <TouchableOpacity
              style={[styles.toggleButton, !isCustomMode && styles.toggleButtonActive]}
              onPress={() => setIsCustomMode(false)}
            >
              <Text style={[styles.toggleText, !isCustomMode && styles.toggleTextActive]}>
                Packages
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, isCustomMode && styles.toggleButtonActive]}
              onPress={() => setIsCustomMode(true)}
            >
              <Text style={[styles.toggleText, isCustomMode && styles.toggleTextActive]}>
                Custom
              </Text>
            </TouchableOpacity>
          </View>

          {/* Predefined Packages */}
          {!isCustomMode && (
            <View style={styles.packagesSection}>
              <Text style={styles.sectionTitle}>Select Package</Text>
              {PREDEFINED_PACKAGES.map((pkg) => (
                <TouchableOpacity
                  key={pkg.id}
                  style={[
                    styles.packageCard,
                    selectedPackage?.id === pkg.id && styles.packageCardSelected,
                    pkg.popular && styles.packageCardPopular,
                  ]}
                  onPress={() => setSelectedPackage(pkg)}
                >
                  <View style={styles.packageHeader}>
                    <Text style={styles.packageCredits}>{pkg.credits} Credits</Text>
                    {pkg.popular && <Text style={styles.popularBadge}>POPULAR</Text>}
                  </View>
                  <Text style={styles.packagePrice}>₹{pkg.price}</Text>
                  {pkg.bonus && (
                    <Text style={styles.bonusText}>+ {pkg.bonus} Bonus Credits</Text>
                  )}
                  <Text style={styles.packageRate}>₹{(pkg.price / pkg.credits).toFixed(1)} per credit</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Custom Amount */}
          {isCustomMode && (
            <View style={styles.customSection}>
              <Text style={styles.sectionTitle}>Enter Credits</Text>
              <TextInput
                style={styles.customInput}
                placeholder="Enter number of credits"
                value={customCredits}
                onChangeText={setCustomCredits}
                keyboardType="numeric"
                maxLength={4}
              />
              {customCredits && (
                <Text style={styles.customCost}>
                  Cost: ₹{calculateCost(parseInt(customCredits) || 0)}
                </Text>
              )}
            </View>
          )}

          {/* Payment Method Selection */}
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedPaymentMethod?.id === method.id && styles.paymentMethodSelected,
                ]}
                onPress={() => setSelectedPaymentMethod(method)}
              >
                <Text style={styles.paymentMethodText}>{method.name}</Text>
                {method.isDefault && <Text style={styles.defaultBadge}>DEFAULT</Text>}
              </TouchableOpacity>
            ))}
          </View>

          {/* Summary */}
          {(selectedPackage || (isCustomMode && customCredits)) && (
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Credits:</Text>
                <Text style={styles.summaryValue}>{getSelectedCredits()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount:</Text>
                <Text style={styles.summaryValue}>₹{getSelectedCost()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>New Balance:</Text>
                <Text style={styles.summaryValue}>{currentBalance + getSelectedCredits()}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.rechargeButton,
              (!selectedPackage && !customCredits) && styles.rechargeButtonDisabled,
            ]}
            onPress={handleRecharge}
            disabled={(!selectedPackage && !customCredits) || !selectedPaymentMethod || isProcessing}
          >
            <Text style={styles.rechargeButtonText}>
              {isProcessing ? 'Processing...' : `Pay ₹${getSelectedCost()}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  balanceSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2196F3',
  },
  toggleSection: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  toggleTextActive: {
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  packagesSection: {
    marginBottom: 24,
  },
  packageCard: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  packageCardSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#f3f8ff',
  },
  packageCardPopular: {
    borderColor: '#4CAF50',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageCredits: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  popularBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CAF50',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 4,
  },
  bonusText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 4,
  },
  packageRate: {
    fontSize: 12,
    color: '#666',
  },
  customSection: {
    marginBottom: 24,
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  customCost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    textAlign: 'center',
  },
  paymentSection: {
    marginBottom: 24,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  paymentMethodSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#f3f8ff',
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#333',
  },
  defaultBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  summarySection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  rechargeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  rechargeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  rechargeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});