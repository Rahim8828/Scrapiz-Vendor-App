import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CreditLoadingStateProps {
  type: 'balance' | 'transactions' | 'full';
  message?: string;
}

export default function CreditLoadingState({ type, message }: CreditLoadingStateProps) {
  const renderBalanceLoader = () => (
    <View style={styles.balanceLoader}>
      <View style={styles.balanceLoaderContent}>
        <View style={styles.balanceLoaderIcon}>
          <ActivityIndicator size="small" color="#4CAF50" />
        </View>
        <View style={styles.balanceLoaderText}>
          <View style={styles.shimmerLine} />
          <View style={[styles.shimmerLine, styles.shimmerLineSmall]} />
        </View>
      </View>
    </View>
  );

  const renderTransactionLoader = () => (
    <View style={styles.transactionLoader}>
      {[...Array(5)].map((_, index) => (
        <View key={index} style={styles.transactionLoaderItem}>
          <View style={styles.transactionLoaderIcon}>
            <View style={styles.shimmerCircle} />
          </View>
          <View style={styles.transactionLoaderContent}>
            <View style={styles.shimmerLine} />
            <View style={[styles.shimmerLine, styles.shimmerLineSmall]} />
            <View style={[styles.shimmerLine, styles.shimmerLineTiny]} />
          </View>
          <View style={styles.transactionLoaderAmount}>
            <View style={[styles.shimmerLine, styles.shimmerLineAmount]} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderFullLoader = () => (
    <View style={styles.fullLoader}>
      <View style={styles.fullLoaderContent}>
        <MaterialIcons name="account-balance-wallet" size={48} color="#e9ecef" />
        <ActivityIndicator size="large" color="#4CAF50" style={styles.fullLoaderSpinner} />
        <Text style={styles.fullLoaderText}>
          {message || 'Loading credit data...'}
        </Text>
      </View>
    </View>
  );

  switch (type) {
    case 'balance':
      return renderBalanceLoader();
    case 'transactions':
      return renderTransactionLoader();
    case 'full':
      return renderFullLoader();
    default:
      return renderFullLoader();
  }
}

const styles = StyleSheet.create({
  // Balance loader styles
  balanceLoader: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    minWidth: 80,
  },
  balanceLoaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceLoaderIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceLoaderText: {
    flex: 1,
    alignItems: 'center',
  },

  // Transaction loader styles
  transactionLoader: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  transactionLoaderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  transactionLoaderIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionLoaderContent: {
    flex: 1,
    gap: 4,
  },
  transactionLoaderAmount: {
    alignItems: 'flex-end',
  },

  // Full loader styles
  fullLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  fullLoaderContent: {
    alignItems: 'center',
    gap: 16,
  },
  fullLoaderSpinner: {
    marginTop: -24,
  },
  fullLoaderText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },

  // Shimmer effect styles
  shimmerLine: {
    height: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    width: '100%',
  },
  shimmerLineSmall: {
    width: '70%',
    height: 10,
  },
  shimmerLineTiny: {
    width: '50%',
    height: 8,
  },
  shimmerLineAmount: {
    width: 40,
    height: 14,
  },
  shimmerCircle: {
    width: 40,
    height: 40,
    backgroundColor: '#e9ecef',
    borderRadius: 20,
  },
});