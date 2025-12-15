import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FadeInView, SlideInView } from '../../components/ui/CreditAnimations';
import { 
  creditAccessibilityLabels, 
  creditAccessibilityRoles, 
  generateTransactionAccessibilityDescription 
} from '../../utils/creditAccessibility';
import { CreditTransaction, TransactionFilter } from '../../types';
import { creditService } from '../../services/creditService';
// import { creditNotificationService } from '../../services/creditNotificationService';
import { CreditRechargeModal } from '../../components/ui/CreditRechargeModal';
import { CreditRechargeResult } from '../../services/creditRechargeService';

interface CreditScreenProps {
  onBack: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const TABS: { key: TransactionFilter; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'list' },
  { key: 'recharges', label: 'Recharges', icon: 'add-circle' },
  { key: 'expenses', label: 'Expenses', icon: 'remove-circle' },
  { key: 'penalties', label: 'Penalties', icon: 'warning' },
];

export default function CreditScreen({ onBack, onShowToast }: CreditScreenProps) {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<TransactionFilter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  
  // Pagination state
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  const loadData = useCallback(async (reset: boolean = false) => {
    try {
      // Set toast handler for notifications
      creditService.setToastHandler(onShowToast);
      
      const page = reset ? 0 : currentPage;
      const offset = page * pageSize;
      
      const [currentBalance, paginatedData] = await Promise.all([
        creditService.getCurrentBalance(),
        creditService.getPaginatedTransactionHistory(activeTab, pageSize, offset),
      ]);
      
      setBalance(currentBalance);
      
      if (reset) {
        setTransactions(paginatedData.data);
        setCurrentPage(0);
      } else {
        setTransactions(prev => [...prev, ...paginatedData.data]);
      }
      
      setHasMore(paginatedData.hasMore);
    } catch (error) {
      console.error('Failed to load credit data:', error);
      onShowToast('Failed to load credit data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [activeTab, currentPage, pageSize, onShowToast]);

  useEffect(() => {
    loadData(true);
  }, [activeTab, onShowToast, loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const handleTabChange = (tab: TransactionFilter) => {
    setActiveTab(tab);
    setLoading(true);
    setCurrentPage(0);
    setHasMore(true);
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      setCurrentPage(prev => prev + 1);
      loadData(false);
    }
  }, [loadingMore, hasMore, loading, loadData]);

  const handleRechargeSuccess = async (result: CreditRechargeResult) => {
    try {
      onShowToast(`Successfully recharged credits`, 'success');
      setShowRechargeModal(false);
      
      // Reload data to show updated balance and new transaction
      setLoading(true);
      await loadData();
    } catch (error) {
      console.error('Failed to refresh after recharge:', error);
      onShowToast('Recharge successful but failed to refresh data', 'info');
    }
  };

  const handleRechargeError = (error: string) => {
    onShowToast(error, 'error');
  };

  const formatTransactionAmount = (transaction: CreditTransaction) => {
    const sign = transaction.type === 'addition' ? '+' : '-';
    return `${sign}${transaction.amount}`;
  };

  const getTransactionIcon = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'addition':
        return 'add-circle';
      case 'deduction':
        return 'remove-circle';
      case 'penalty':
        return 'warning';
      default:
        return 'help';
    }
  };

  const getTransactionColor = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'addition':
        return '#28a745';
      case 'deduction':
        return '#6c757d';
      case 'penalty':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  // Memoize date formatter for performance
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }), []);

  const formatDate = useCallback((date: Date) => {
    return dateFormatter.format(date);
  }, [dateFormatter]);

  // Memoized transaction item for performance
  const renderTransaction = useCallback(({ item }: { item: CreditTransaction }) => {
    const accessibilityDescription = generateTransactionAccessibilityDescription(
      item.description,
      item.amount,
      item.type,
      item.timestamp,
      item.orderValue,
      item.paymentAmount
    );

    return (
      <View 
        style={styles.transactionItem}
        accessible={true}
        accessibilityRole={creditAccessibilityRoles.button}
        accessibilityLabel={accessibilityDescription}
      >
        <View style={styles.transactionLeft}>
          <View style={[
            styles.transactionIcon,
            { backgroundColor: `${getTransactionColor(item.type)}20` }
          ]}>
            <MaterialIcons
              name={getTransactionIcon(item.type) as any}
              size={20}
              color={getTransactionColor(item.type)}
            />
          </View>
          <View style={styles.transactionDetails}>
            <Text 
              style={styles.transactionDescription} 
              numberOfLines={2}
              accessibilityElementsHidden={true}
            >
              {item.description}
            </Text>
            <Text 
              style={styles.transactionDate}
              accessibilityElementsHidden={true}
            >
              {formatDate(item.timestamp)}
            </Text>
            {item.orderValue && (
              <Text 
                style={styles.transactionMeta}
                accessibilityElementsHidden={true}
              >
                Order Value: ₹{item.orderValue}
              </Text>
            )}
            {item.paymentAmount && (
              <Text 
                style={styles.transactionMeta}
                accessibilityElementsHidden={true}
              >
                Payment: ₹{item.paymentAmount}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text 
            style={[
              styles.transactionAmount,
              { color: getTransactionColor(item.type) }
            ]}
            accessibilityElementsHidden={true}
          >
            {formatTransactionAmount(item)}
          </Text>
          <Text 
            style={styles.transactionStatus}
            accessibilityElementsHidden={true}
          >
            {item.status}
          </Text>
        </View>
      </View>
    );
  }, [formatDate]);

  // Memoized footer component for load more
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color="#4CAF50" />
        <Text style={styles.loadMoreText}>Loading more transactions...</Text>
      </View>
    );
  }, [loadingMore]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="receipt-long" size={64} color="#e9ecef" />
      <Text style={styles.emptyStateTitle}>No transactions found</Text>
      <Text style={styles.emptyStateSubtitle}>
        {activeTab === 'all' 
          ? 'Your transaction history will appear here'
          : `No ${activeTab} transactions yet`
        }
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Credits</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading credit data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={onBack} 
          style={styles.backButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Navigate back to previous screen"
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Credits</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Balance Card */}
        <FadeInView duration={400}>
          <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <TouchableOpacity
              style={styles.rechargeButton}
              onPress={() => setShowRechargeModal(true)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Recharge credits"
              accessibilityHint="Open credit recharge options"
            >
              <MaterialIcons name="add" size={16} color="white" />
              <Text style={styles.rechargeButtonText}>Recharge</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.balanceAmount}>
            <Text style={styles.balanceNumber}>{balance}</Text>
            <Text style={styles.balanceUnit}>Credits</Text>
          </View>
          {balance < 5 && (
            <View style={styles.warningBanner}>
              <MaterialIcons name="warning" size={16} color="#dc3545" />
              <Text style={styles.warningText}>
                Low balance! Recharge to continue accepting bookings.
              </Text>
            </View>
          )}
          </View>
        </FadeInView>

        {/* Tab Navigation */}
        <SlideInView direction="down" duration={300} delay={200}>
          <View style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabRow}>
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.tab,
                    activeTab === tab.key && styles.activeTab
                  ]}
                  onPress={() => handleTabChange(tab.key)}
                  accessible={true}
                  accessibilityRole="tab"
                  accessibilityLabel={creditAccessibilityLabels.transactionTab(tab.label, activeTab === tab.key)}
                  accessibilityState={{ selected: activeTab === tab.key }}
                >
                  <MaterialIcons
                    name={tab.icon as any}
                    size={18}
                    color={activeTab === tab.key ? '#4CAF50' : '#6c757d'}
                  />
                  <Text style={[
                    styles.tabText,
                    activeTab === tab.key && styles.activeTabText
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          </View>
        </SlideInView>

        {/* Transaction List */}
        <SlideInView direction="up" duration={400} delay={300}>
          <View style={styles.transactionContainer}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {transactions.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={transactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListFooterComponent={renderFooter}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={10}
              getItemLayout={(data, index) => ({
                length: 80, // Approximate item height
                offset: 80 * index,
                index,
              })}
            />
          )}
          </View>
        </SlideInView>
      </ScrollView>

      {/* Recharge Modal */}
      <CreditRechargeModal
        visible={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        onRechargeSuccess={handleRechargeSuccess}
        onRechargeError={handleRechargeError}
        currentBalance={balance}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  balanceCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  rechargeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  rechargeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  balanceAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  balanceNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  balanceUnit: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#dc3545',
    fontWeight: '500',
  },
  tabContainer: {
    backgroundColor: 'white',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#e8f5e8',
  },
  tabText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  transactionContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    padding: 16,
    paddingBottom: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  transactionMeta: {
    fontSize: 11,
    color: '#adb5bd',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  transactionStatus: {
    fontSize: 11,
    color: '#6c757d',
    textTransform: 'capitalize',
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f3f4',
    marginHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#6c757d',
  },
});