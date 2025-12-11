import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  Animated,
  RefreshControl,
  Dimensions
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { EarningsData } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

interface EarningsScreenProps {
  onBack: () => void;
}

const EarningsScreen = ({ onBack }: EarningsScreenProps) => {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  React.useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if component unmounts
    
    const loadData = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            if (Math.random() < 0.05) {
              reject(new Error('Failed to load earnings data'));
            } else {
              resolve(true);
            }
          }, 600);
          
          // Cleanup timeout if component unmounts
          return () => clearTimeout(timeoutId);
        });
        
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setIsLoading(false);
        }
      }
    };

    loadData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const mockEarningsData: Record<string, EarningsData> = {
    today: {
      totalEarnings: 2450,
      totalJobs: 8,
      transactions: [
        { id: 'today_1', jobId: 'J001', amount: 850, date: new Date(Date.now() - 3600000), status: 'completed' },
        { id: 'today_2', jobId: 'J002', amount: 420, date: new Date(Date.now() - 7200000), status: 'completed' },
        { id: 'today_3', jobId: 'J003', amount: 680, date: new Date(Date.now() - 10800000), status: 'completed' },
        { id: 'today_4', jobId: 'J004', amount: 500, date: new Date(Date.now() - 14400000), status: 'completed' }
      ]
    },
    week: {
      totalEarnings: 15680,
      totalJobs: 42,
      transactions: [
        { id: 'week_1', jobId: 'J045', amount: 1200, date: new Date(Date.now() - 86400000 * 1), status: 'completed' },
        { id: 'week_2', jobId: 'J044', amount: 950, date: new Date(Date.now() - 86400000 * 2), status: 'completed' },
        { id: 'week_3', jobId: 'J043', amount: 850, date: new Date(Date.now() - 86400000 * 3), status: 'completed' },
        { id: 'week_4', jobId: 'J042', amount: 420, date: new Date(Date.now() - 86400000 * 4), status: 'completed' },
        { id: 'week_5', jobId: 'J041', amount: 680, date: new Date(Date.now() - 86400000 * 5), status: 'completed' },
        { id: 'week_6', jobId: 'J040', amount: 500, date: new Date(Date.now() - 86400000 * 6), status: 'completed' }
      ]
    },
    month: {
      totalEarnings: 68500,
      totalJobs: 185,
      transactions: [
        { id: 'month_1', jobId: 'J185', amount: 2100, date: new Date(Date.now() - 604800000), status: 'completed' },
        { id: 'month_2', jobId: 'J184', amount: 1650, date: new Date(Date.now() - 1209600000), status: 'completed' },
        { id: 'month_3', jobId: 'J183', amount: 1200, date: new Date(Date.now() - 1814400000), status: 'completed' },
        { id: 'month_4', jobId: 'J182', amount: 950, date: new Date(Date.now() - 2419200000), status: 'completed' },
        { id: 'month_5', jobId: 'J181', amount: 800, date: new Date(Date.now() - 3024000000), status: 'completed' }
      ]
    }
  };

  const currentData = mockEarningsData[activeTab];

  const formatDate = (date: Date) => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };
  
  const formatTime = (date: Date) => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return 'Invalid Time';
      }
      return date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Time formatting error:', error);
      return 'Invalid Time';
    }
  };

  const handleRetry = () => {
    setError(null);
    setActiveTab(activeTab);
  };

  const handleDownloadReport = useCallback(() => {
    try {
      const reportData = {
        period: activeTab,
        totalEarnings: currentData.totalEarnings,
        totalJobs: currentData.totalJobs,
        transactions: currentData.transactions,
        generatedAt: new Date().toISOString()
      };
      
      console.log('Generating report:', reportData);
      Alert.alert('Report', 'Report generation started! You will be notified when ready.');
    } catch (error) {
      console.error('Report generation error:', error);
      Alert.alert('Error', 'Failed to generate report. Please try again.');
    }
  }, [activeTab, currentData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Simulate data refresh
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleViewDetails = useCallback((transaction: any) => {
    Alert.alert('Transaction Details', `Job #${transaction.jobId}\nAmount: ₹${transaction.amount}`);
  }, []);



  // Enhanced Header Component
  const EnhancedHeader = () => (
    <View style={styles.modernHeader}>
      <View style={styles.headerContent}>
        <View style={styles.earningsSummary}>
          <Text style={styles.periodLabel}>{activeTab.toUpperCase()}</Text>
          <Text style={styles.mainAmount}>₹{currentData.totalEarnings.toLocaleString()}</Text>
          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{currentData.totalJobs}</Text>
              <Text style={styles.quickStatLabel}>Jobs</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>+{earningsStats.growthRate}%</Text>
              <Text style={styles.quickStatLabel}>Growth</Text>
            </View>
          </View>
        </View>
      </View>
      <ModernTabSelector />
    </View>
  );





  // Modern Tab Selector Component
  const ModernTabSelector = () => (
    <View style={styles.modernTabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => setActiveTab(tab.key)}
          disabled={isLoading}
          style={[
            styles.modernTab,
            activeTab === tab.key && styles.activeModernTab
          ]}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.modernTabText,
            activeTab === tab.key && styles.activeModernTabText
          ]}>
            {tab.label}
          </Text>
          {activeTab === tab.key && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );

  // Swipeable Transaction Card Component
  const SwipeableTransactionCard = ({ transaction, onSwipeLeft }: any) => (
    <TouchableOpacity style={styles.swipeableCard} activeOpacity={0.8}>
      <View style={styles.transactionCardContent}>
        <View style={styles.transactionLeft}>
          <View style={styles.transactionIconContainer}>
            <MaterialIcons name="account-balance-wallet" size={18} color="#1B7332" />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionJobId}>Job #{transaction.jobId}</Text>
            <Text style={styles.transactionTime}>
              {formatTime(transaction.date)}
            </Text>
          </View>
        </View>
        
        <View style={styles.transactionRight}>
          <Text style={styles.transactionAmount}>
            +₹{transaction.amount.toLocaleString()}
          </Text>
          <TouchableOpacity style={styles.compactViewButton} onPress={onSwipeLeft}>
            <MaterialIcons name="visibility" size={12} color="#1B7332" />
            <Text style={styles.compactViewText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Enhanced Transaction List Component
  const EnhancedTransactionList = () => {
    const groupedTransactions = useMemo(() => {
      const groups: { [key: string]: any[] } = {};
      currentData.transactions.forEach(transaction => {
        const dateKey = formatDate(transaction.date);
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(transaction);
      });
      
      return Object.entries(groups).map(([date, transactions]) => ({
        date,
        transactions
      }));
    }, [currentData.transactions]);

    return (
      <View style={styles.modernTransactionList}>
        {groupedTransactions.map((group) => (
          <View key={group.date} style={styles.transactionGroup}>
            <Text style={styles.groupHeader}>{group.date}</Text>
            {group.transactions.map((transaction) => (
              <SwipeableTransactionCard
                key={transaction.id}
                transaction={transaction}
                onSwipeLeft={() => handleViewDetails(transaction)}
              />
            ))}
          </View>
        ))}
      </View>
    );
  };

  const earningsStats = useMemo(() => {
    if (!currentData || currentData.totalJobs === 0 || !currentData.transactions) {
      return {
        growthRate: 0,
        bestDay: 0
      };
    }

    try {
      const previousPeriodEarnings = activeTab === 'today' ? 2200 : activeTab === 'week' ? 14500 : 65000;
      const growthRate = previousPeriodEarnings > 0 
        ? ((currentData.totalEarnings - previousPeriodEarnings) / previousPeriodEarnings) * 100 
        : 0;
      const bestDay = currentData.transactions.length > 0 
        ? Math.max(...currentData.transactions.map(t => t.amount || 0))
        : 0;

      return {
        growthRate: Math.round(growthRate * 10) / 10 || 0,
        bestDay: bestDay || 0
      };
    } catch (error) {
      console.error('Error calculating earnings stats:', error);
      return {
        growthRate: 0,
        bestDay: 0
      };
    }
  }, [currentData, activeTab]);

  const tabs = [
    { key: 'today' as const, label: 'Today' },
    { key: 'week' as const, label: 'This Week' },
    { key: 'month' as const, label: 'This Month' }
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1B7332']}
            tintColor="#1B7332"
          />
        }
      >
        {/* Alternative Header Design */}
        <View style={styles.alternativeHeader}>
          {/* Top Navigation Bar */}
          <View style={styles.topNavBar}>
            <TouchableOpacity style={styles.navBackButton} onPress={onBack}>
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
            
            <View style={styles.navTitleContainer}>
              <MaterialIcons name="account-balance-wallet" size={20} color="white" />
              <Text style={styles.navTitle}>Earnings Dashboard</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.navMenuButton}
              onPress={handleDownloadReport}
              disabled={isLoading || error !== null}
            >
              <MaterialIcons name="download" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Compact Stats Row */}
          <View style={styles.compactStatsRow}>
            <View style={styles.compactStatItem}>
              <Text style={styles.headerCompactStatLabel}>Total Earned</Text>
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : error ? (
                <Text style={styles.headerCompactStatValue}>₹0</Text>
              ) : (
                <Text style={styles.headerCompactStatValue}>
                  ₹{currentData.totalEarnings.toLocaleString('en-IN')}
                </Text>
              )}
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.compactStatItem}>
              <Text style={styles.headerCompactStatLabel}>Jobs Done</Text>
              <Text style={styles.headerCompactStatValue}>
                {error ? '0' : currentData.totalJobs}
              </Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.compactStatItem}>
              <Text style={styles.headerCompactStatLabel}>Growth</Text>
              <Text style={[
                styles.headerCompactStatValue,
                { color: earningsStats.growthRate >= 0 ? '#90EE90' : '#FFB6C1' }
              ]}>
                {earningsStats.growthRate >= 0 ? '+' : ''}{earningsStats.growthRate}%
              </Text>
            </View>
          </View>
          
          {/* Sleek Tab Selector */}
          <View style={styles.sleekTabContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                disabled={isLoading}
                style={[
                  styles.sleekTab,
                  activeTab === tab.key && styles.activeSleekTab
                ]}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.sleekTabText,
                  activeTab === tab.key && styles.activeSleekTabText
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.content}>


          {/* Transaction List */}
          <View style={styles.transactionContainer}>
            <View style={styles.transactionHeader}>
              <Text style={styles.transactionTitle}>Transaction History</Text>
              <TouchableOpacity 
                disabled={isLoading || error !== null}
                style={styles.filterButton}
              >
                <MaterialIcons name="filter-list" size={16} color="#1B7332" />
                <Text style={styles.filterText}>Filter</Text>
              </TouchableOpacity>
            </View>
            
            {isLoading ? (
              <View style={styles.loadingList}>
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.shimmerCard}>
                    <View style={styles.shimmerDateHeader}>
                      <View style={styles.shimmerDateText} />
                      <View style={styles.shimmerDateLine} />
                    </View>
                    <View style={styles.shimmerTransactionCard}>
                      <View style={styles.shimmerLeft}>
                        <View style={styles.shimmerIcon} />
                        <View style={styles.shimmerContent}>
                          <View style={styles.shimmerTitle} />
                          <View style={styles.shimmerSubtitle} />
                        </View>
                      </View>
                      <View style={styles.shimmerRight}>
                        <View style={styles.shimmerAmount} />
                        <View style={styles.shimmerStatus} />
                      </View>
                    </View>
                    <View style={styles.shimmerActions}>
                      <View style={styles.shimmerActionButton} />
                      <View style={styles.shimmerActionButton} />
                    </View>
                  </View>
                ))}
              </View>
            ) : error ? (
              <View style={styles.enhancedErrorState}>
                <View style={styles.errorIconContainer}>
                  <MaterialIcons name="wifi-off" size={32} color="#dc3545" />
                </View>
                <Text style={styles.errorStateTitle}>Connection Problem</Text>
                <Text style={styles.errorStateMessage}>
                  Unable to load your transaction history. Please check your internet connection and try again.
                </Text>
                <View style={styles.errorActions}>
                  <TouchableOpacity style={styles.errorRetryButton} onPress={handleRetry}>
                    <MaterialIcons name="refresh" size={16} color="white" />
                    <Text style={styles.errorRetryText}>Retry</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.errorSecondaryButton}>
                    <MaterialIcons name="offline-bolt" size={16} color="#1B7332" />
                    <Text style={styles.errorSecondaryText}>View Offline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : currentData.transactions.length > 0 ? (
              <>
                <EnhancedTransactionList />
                
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All Transactions</Text>
                  <MaterialIcons name="arrow-forward" size={16} color="#1B7332" />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.enhancedEmptyState}>
                <View style={styles.emptyIconContainer}>
                  <MaterialIcons name="account-balance-wallet" size={40} color="#1B7332" />
                </View>
                <Text style={styles.emptyTitle}>No Transactions Yet</Text>
                <Text style={styles.emptyMessage}>
                  Start completing jobs to see your earnings history here. Your first transaction will appear once you finish a job.
                </Text>
                <View style={styles.emptySuggestions}>
                  <TouchableOpacity style={styles.suggestionButton}>
                    <MaterialIcons name="work" size={16} color="#1B7332" />
                    <Text style={styles.suggestionText}>Find Jobs</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.suggestionButton}>
                    <MaterialIcons name="help-outline" size={16} color="#1B7332" />
                    <Text style={styles.suggestionText}>How it Works</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Extra space for bottom navigation
  },
  header: {
    backgroundColor: '#1B7332',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  menuButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 8,
  },
  earningsSummaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  periodLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    letterSpacing: 1,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 16,
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  quickStatLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    gap: 8,
  },
  errorAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  retryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  mainEarningsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  modernTabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  modernTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    position: 'relative',
  },
  activeModernTab: {
    backgroundColor: 'white',
  },
  modernTabText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  activeModernTabText: {
    color: '#1B7332',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 2,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 2,
    backgroundColor: '#1B7332',
    borderRadius: 1,
  },
  content: {
    padding: 16, // Reduced from 20
  },


  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },




  miniTrendUp: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6,
    padding: 4,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 16,
  },

  primaryStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  primaryStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },

  footerText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  compactCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },


  transactionContainer: {
    backgroundColor: 'white',
    borderRadius: 12, // Reduced from 16
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16, // Reduced from 20
    backgroundColor: '#f8f9fa',
  },
  transactionTitle: {
    fontSize: 15, // Reduced from 16
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
  filterText: {
    fontSize: 12,
    color: '#1B7332',
    fontWeight: '600',
  },
  loadingList: {
    padding: 16,
  },
  shimmerCard: {
    marginBottom: 16,
  },
  shimmerDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  shimmerDateText: {
    width: 80,
    height: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
  },
  shimmerDateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e9ecef',
  },
  shimmerTransactionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  shimmerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shimmerIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    marginRight: 12,
  },
  shimmerContent: {
    flex: 1,
  },
  shimmerTitle: {
    height: 14,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    width: '70%',
    marginBottom: 6,
  },
  shimmerSubtitle: {
    height: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    width: '50%',
  },
  shimmerRight: {
    alignItems: 'flex-end',
  },
  shimmerAmount: {
    height: 18,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    width: 60,
    marginBottom: 6,
  },
  shimmerStatus: {
    height: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    width: 50,
  },
  shimmerActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  shimmerActionButton: {
    height: 24,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    width: 60,
  },
  enhancedErrorState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#fef2f2',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#fee2e2',
  },
  errorStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  errorStateMessage: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  errorRetryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B7332',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  errorRetryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorSecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 115, 50, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(27, 115, 50, 0.2)',
  },
  errorSecondaryText: {
    color: '#1B7332',
    fontSize: 14,
    fontWeight: 'bold',
  },
  transactionList: {
    padding: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  dateHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    minWidth: 80,
  },
  dateHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e9ecef',
  },
  transactionCard: {
    backgroundColor: '#fafffe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(27, 115, 50, 0.1)',
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(27, 115, 50, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionJobId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B7332',
    marginBottom: 4,
  },
  compactViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 115, 50, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    marginTop: 4,
  },
  compactViewText: {
    fontSize: 10,
    color: '#1B7332',
    fontWeight: '600',
  },
  transactionActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(27, 115, 50, 0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionText: {
    fontSize: 11,
    color: '#6c757d',
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(27, 115, 50, 0.05)',
    paddingVertical: 16,
    marginTop: 16,
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(27, 115, 50, 0.1)',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B7332',
  },
  enhancedEmptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(27, 115, 50, 0.1)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(27, 115, 50, 0.2)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptySuggestions: {
    flexDirection: 'row',
    gap: 12,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 115, 50, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(27, 115, 50, 0.2)',
  },
  suggestionText: {
    fontSize: 12,
    color: '#1B7332',
    fontWeight: '600',
  },

  // Enhanced Header Styles
  modernHeader: {
    backgroundColor: '#1B7332',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    marginBottom: 16,
  },
  earningsSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  mainAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 8,
  },





  // Enhanced Transaction List Styles
  modernTransactionList: {
    padding: 16,
  },
  transactionGroup: {
    marginBottom: 16,
  },
  groupHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  swipeableCard: {
    backgroundColor: '#fafffe',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(27, 115, 50, 0.1)',
    shadowColor: '#1B7332',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },


  // Alternative Header Styles
  alternativeHeader: {
    backgroundColor: '#1B7332',
    paddingTop: 44,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBackButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  navMenuButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  compactStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  headerCompactStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  headerCompactStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 8,
  },
  sleekTabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    padding: 2,
  },
  sleekTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeSleekTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  sleekTabText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  activeSleekTabText: {
    color: 'white',
  },
});

export default EarningsScreen;