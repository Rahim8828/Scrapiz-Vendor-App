import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { creditAccessibilityLabels, creditAccessibilityRoles } from '../../utils/creditAccessibility';

interface CreditBalanceProps {
  balance: number;
  onPress: () => void;
  showWarning?: boolean;
}

function CreditBalance({ balance, onPress, showWarning }: CreditBalanceProps) {
  // Memoize computed values for performance
  const { displayWarning, containerStyle, textStyle, labelStyle } = useMemo(() => {
    const isLow = balance < 5;
    const warning = showWarning || isLow;
    
    return {
      displayWarning: warning,
      containerStyle: [
        styles.container,
        warning && styles.warningContainer
      ],
      textStyle: [
        styles.balanceText,
        warning && styles.warningText
      ],
      labelStyle: [
        styles.labelText,
        warning && styles.warningLabelText
      ]
    };
  }, [balance, showWarning]);

  return (
    <TouchableOpacity 
      style={containerStyle} 
      onPress={onPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole={creditAccessibilityRoles.button}
      accessibilityLabel={creditAccessibilityLabels.balance(balance, displayWarning)}
      accessibilityHint={creditAccessibilityLabels.balanceHint}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons 
            name="account-balance-wallet" 
            size={16} 
            color={displayWarning ? '#dc3545' : 'white'} 
          />
          {displayWarning && (
            <View style={styles.warningIndicator}>
              <MaterialIcons name="warning" size={6} color="white" />
            </View>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text 
            style={textStyle}
            accessibilityLabel={`${balance} credits`}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {balance}
          </Text>
          <Text 
            style={labelStyle}
            accessibilityElementsHidden={true}
            numberOfLines={1}
          >
            Credits
          </Text>
        </View>
      </View>
      <View style={styles.addButton}>
        <MaterialIcons 
          name="add" 
          size={12} 
          color={displayWarning ? '#dc3545' : 'white'} 
        />
      </View>
    </TouchableOpacity>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(CreditBalance);

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningContainer: {
    backgroundColor: 'rgba(220, 53, 69, 0.15)',
    borderColor: 'rgba(220, 53, 69, 0.4)',
    borderWidth: 1,
  },
  content: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconContainer: {
    position: 'relative',
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  warningIndicator: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 10,
    height: 10,
    backgroundColor: '#dc3545',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    lineHeight: 20,
    textAlign: 'center',
  },
  warningText: {
    color: '#dc3545',
  },
  labelText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    lineHeight: 13,
    textAlign: 'center',
    marginTop: 1,
  },
  warningLabelText: {
    color: 'rgba(220, 53, 69, 0.8)',
  },
  addButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
});