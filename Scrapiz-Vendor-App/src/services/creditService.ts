import { 
  CreditService as ICreditService, 
  CreditBalanceData, 
  CreditTransaction, 
  TransactionFilter 
} from '../types';
import { CreditStorageService } from './storage';
import { creditNotificationService } from './creditNotificationService';
import { offlineManager } from './offlineManager';
import { creditApiService } from './creditApiService';
import { creditErrorHandler, CreditErrorType } from './creditErrorHandler';
import { creditRetryManager } from './creditRetryManager';
import { creditRecoveryService } from './creditRecoveryService';
import { creditCacheService } from './creditCacheService';
import { creditPerformanceService } from './creditPerformanceService';

export class CreditService implements ICreditService {
  private static instance: CreditService;
  private currentVendorId: string = 'default-vendor'; // This should be set from auth context

  private constructor() {}

  static getInstance(): CreditService {
    if (!CreditService.instance) {
      CreditService.instance = new CreditService();
    }
    return CreditService.instance;
  }

  /**
   * Set the current vendor ID (should be called after authentication)
   */
  setVendorId(vendorId: string): void {
    this.currentVendorId = vendorId;
    creditApiService.setVendorId(vendorId);
  }

  /**
   * Set the toast notification handler
   */
  setToastHandler(handler: (message: string, type: 'success' | 'error' | 'info') => void): void {
    creditNotificationService.setToastHandler(handler);
    creditErrorHandler.setToastHandler(handler);
    creditRecoveryService.setToastHandler(handler);
  }

  /**
   * Calculate required credits based on order value
   * 1 credit per ₹100 order value, rounded up
   */
  calculateRequiredCredits(orderValue: number): number {
    // Validate order value
    const validation = creditErrorHandler.validateOrderValue(orderValue);
    if (!validation.isValid) {
      const error = validation.errors[0];
      creditErrorHandler.logError(error, { orderValue });
      throw new Error(error.userMessage);
    }

    return Math.ceil(orderValue / 100);
  }

  /**
   * Get current credit balance with caching
   */
  async getCurrentBalance(): Promise<number> {
    // Check cache first
    const cachedBalance = creditCacheService.getCachedBalance();
    if (cachedBalance) {
      return cachedBalance.currentBalance;
    }

    return await creditPerformanceService.measureAsync(
      'get_current_balance',
      async () => {
        return await creditRetryManager.executeWithRetry(
          async () => {
            try {
              const balance = await CreditStorageService.getCreditBalance();
              if (!balance) {
                // Initialize default balance for new vendor
                const defaultBalance = await CreditStorageService.initializeDefaultBalance(this.currentVendorId);
                creditCacheService.setCachedBalance(defaultBalance);
                return defaultBalance.currentBalance;
              }
              
              // Cache the retrieved balance
              creditCacheService.setCachedBalance(balance);
              return balance.currentBalance;
            } catch (error) {
              const creditError = await creditErrorHandler.handleStorageError(error, 'get current balance');
              creditErrorHandler.logError(creditError, { vendorId: this.currentVendorId });
              throw error;
            }
          },
          'get_current_balance',
          creditRetryManager.getConfigForOperation('balance_sync')
        );
      },
      false
    );
  }

  /**
   * Deduct credits for booking acceptance
   */
  async deductCredits(amount: number, bookingId: string, orderValue: number): Promise<boolean> {
    // Validate inputs
    const creditValidation = creditErrorHandler.validateCreditAmount(amount);
    if (!creditValidation.isValid) {
      const error = creditValidation.errors[0];
      creditErrorHandler.logError(error, { amount, bookingId, orderValue });
      throw new Error(error.userMessage);
    }

    const orderValidation = creditErrorHandler.validateOrderValue(orderValue);
    if (!orderValidation.isValid) {
      const error = orderValidation.errors[0];
      creditErrorHandler.logError(error, { amount, bookingId, orderValue });
      throw new Error(error.userMessage);
    }

    // Validate booking ID (different from transaction ID validation)
    if (!bookingId || typeof bookingId !== 'string' || bookingId.trim() === '') {
      const error = {
        type: CreditErrorType.VALIDATION_ERROR,
        message: 'Booking ID cannot be empty',
        code: 'EMPTY_BOOKING_ID',
        details: { bookingId },
        recoverable: false,
        userMessage: 'Invalid booking ID'
      };
      creditErrorHandler.logError(error, { amount, bookingId, orderValue });
      throw new Error(error.userMessage);
    }

    return await creditRetryManager.executeWithRetry(
      async () => {
        try {
          const currentBalance = await this.getCurrentBalance();
          
          // Check if sufficient credits are available
          if (currentBalance < amount) {
            const insufficientError = await creditErrorHandler.handleInsufficientCredits(
              amount, 
              currentBalance, 
              bookingId
            );
            creditErrorHandler.logError(insufficientError, { amount, bookingId, orderValue });
            
            // Trigger insufficient credit notification
            creditNotificationService.showInsufficientCreditPrompt(amount, currentBalance, bookingId);
            return false;
          }

          // Create deduction transaction
          const transaction: CreditTransaction = {
            id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            type: 'deduction',
            amount: amount,
            description: `Booking acceptance - Order #${bookingId}`,
            timestamp: new Date(),
            bookingId: bookingId,
            orderValue: orderValue,
            status: 'completed',
          };

          // Update balance
          const newBalance = currentBalance - amount;
          const balanceData: CreditBalanceData = {
            vendorId: this.currentVendorId,
            currentBalance: newBalance,
            lastUpdated: new Date(),
            pendingTransactions: [],
            syncStatus: 'pending',
          };

          // Store updated balance and transaction
          await Promise.all([
            CreditStorageService.storeCreditBalance(balanceData),
            CreditStorageService.addCreditTransaction(transaction),
          ]);

          // Invalidate caches since data changed
          creditCacheService.invalidateBalance();
          creditCacheService.invalidateTransactions();

          // Queue for server sync using offline manager
          await offlineManager.queueOfflineOperation({
            type: 'credit_deduction',
            data: { transactionId: transaction.id },
            maxRetries: 5, // More retries for critical operations
          });

          // Trigger balance change notification
          creditNotificationService.handleBalanceChange(currentBalance, newBalance, transaction);

          return true;
        } catch (error) {
          const creditError = await creditErrorHandler.handleStorageError(error, 'deduct credits');
          creditErrorHandler.logError(creditError, { amount, bookingId, orderValue });
          throw error;
        }
      },
      'deduct_credits',
      creditRetryManager.getConfigForOperation('credit_deduction')
    );
  }

  /**
   * Add credits after successful payment
   */
  async addCredits(amount: number, transactionId: string, paymentAmount: number): Promise<void> {
    // Validate inputs
    const creditValidation = creditErrorHandler.validateCreditAmount(amount);
    if (!creditValidation.isValid) {
      const error = creditValidation.errors[0];
      creditErrorHandler.logError(error, { amount, transactionId, paymentAmount });
      throw new Error(error.userMessage);
    }

    const paymentValidation = creditErrorHandler.validatePaymentAmount(paymentAmount);
    if (!paymentValidation.isValid) {
      const error = paymentValidation.errors[0];
      creditErrorHandler.logError(error, { amount, transactionId, paymentAmount });
      throw new Error(error.userMessage);
    }

    const transactionValidation = creditErrorHandler.validateTransactionId(transactionId);
    if (!transactionValidation.isValid) {
      const error = transactionValidation.errors[0];
      creditErrorHandler.logError(error, { amount, transactionId, paymentAmount });
      throw new Error(error.userMessage);
    }

    await creditRetryManager.executeWithRetry(
      async () => {
        try {
          const currentBalance = await this.getCurrentBalance();

          // Create addition transaction
          const transaction: CreditTransaction = {
            id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            type: 'addition',
            amount: amount,
            description: `Credit recharge - ₹${paymentAmount}`,
            timestamp: new Date(),
            paymentAmount: paymentAmount,
            paymentTransactionId: transactionId,
            status: 'completed',
          };

          // Update balance
          const newBalance = currentBalance + amount;
          const balanceData: CreditBalanceData = {
            vendorId: this.currentVendorId,
            currentBalance: newBalance,
            lastUpdated: new Date(),
            pendingTransactions: [],
            syncStatus: 'pending',
          };

          // Store updated balance and transaction
          await Promise.all([
            CreditStorageService.storeCreditBalance(balanceData),
            CreditStorageService.addCreditTransaction(transaction),
          ]);

          // Invalidate caches since data changed
          creditCacheService.invalidateBalance();
          creditCacheService.invalidateTransactions();

          // Queue for server sync using offline manager
          await offlineManager.queueOfflineOperation({
            type: 'credit_addition',
            data: { transactionId: transaction.id },
            maxRetries: 5, // More retries for critical operations
          });

          // Trigger balance change notification
          creditNotificationService.handleBalanceChange(currentBalance, newBalance, transaction);
        } catch (error) {
          const creditError = await creditErrorHandler.handleStorageError(error, 'add credits');
          creditErrorHandler.logError(creditError, { amount, transactionId, paymentAmount });
          throw error;
        }
      },
      'add_credits',
      creditRetryManager.getConfigForOperation('credit_addition')
    );
  }

  /**
   * Get paginated transaction history for large datasets
   */
  async getPaginatedTransactionHistory(
    filter?: TransactionFilter,
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    data: CreditTransaction[];
    hasMore: boolean;
    total: number;
  }> {
    return await creditPerformanceService.measureAsync(
      'get_paginated_transaction_history',
      async () => {
        const allTransactions = await this.getTransactionHistory(filter);
        return creditCacheService.paginateTransactions(allTransactions, limit, offset);
      }
    );
  }

  /**
   * Get transaction history with caching and efficient filtering
   */
  async getTransactionHistory(filter?: TransactionFilter): Promise<CreditTransaction[]> {
    const filterKey = filter || 'all';
    
    // Check cache first
    const cachedTransactions = creditCacheService.getCachedTransactions(filterKey);
    if (cachedTransactions) {
      return cachedTransactions;
    }
    
    return await creditPerformanceService.measureAsync(
      'get_transaction_history',
      async () => {
        return await creditRetryManager.executeWithRetry(
          async () => {
            try {
              // Check if we have cached raw transactions
              let allTransactions = creditCacheService.getCachedRawTransactions();
              
              if (!allTransactions) {
                // Load from storage if not cached
                allTransactions = await CreditStorageService.getCreditTransactions();
                creditCacheService.setCachedRawTransactions(allTransactions);
              }

              // Use optimized filtering from cache service
              const filteredTransactions = creditCacheService.filterTransactions(allTransactions, filterKey);
              
              // Cache the filtered result
              creditCacheService.setCachedTransactions(filteredTransactions, filterKey);
              
              // Preload other common filters in background
              if (filterKey === 'all') {
                setTimeout(() => {
                  creditCacheService.preloadCommonFilters(allTransactions);
                }, 0);
              }

              return filteredTransactions;
            } catch (error) {
              const creditError = await creditErrorHandler.handleStorageError(error, 'get transaction history');
              creditErrorHandler.logError(creditError, { filter });
              throw error;
            }
          },
          'get_transaction_history',
          creditRetryManager.getConfigForOperation('transaction_sync')
        );
      },
      false
    );
  }

  /**
   * Sync credit data with server
   */
  async syncWithServer(): Promise<void> {
    await creditRetryManager.executeWithRetry(
      async () => {
        try {
          // Check network status
          if (!offlineManager.getNetworkStatus()) {
            console.log('Offline - sync will be performed when network is available');
            return;
          }

          // Use offline manager to handle sync
          await offlineManager.forceSync();
          
        } catch (error) {
          const creditError = await creditErrorHandler.handleSyncError(error, 'sync with server');
          creditErrorHandler.logError(creditError, { vendorId: this.currentVendorId });
          
          // Update sync status to error
          try {
            const balance = await CreditStorageService.getCreditBalance();
            if (balance) {
              const errorBalance: CreditBalanceData = {
                ...balance,
                syncStatus: 'error',
              };
              await CreditStorageService.storeCreditBalance(errorBalance);
            }
          } catch (storageError) {
            console.error('Failed to update sync status:', storageError);
          }
          
          throw error;
        }
      },
      'sync_with_server',
      creditRetryManager.getConfigForOperation('balance_sync')
    );
  }



  /**
   * Add penalty transaction (for future use)
   */
  async addPenalty(amount: number, reason: string, bookingId?: string): Promise<void> {
    try {
      const currentBalance = await this.getCurrentBalance();

      const transaction: CreditTransaction = {
        id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        type: 'penalty',
        amount: amount,
        description: `Penalty: ${reason}`,
        timestamp: new Date(),
        bookingId: bookingId,
        status: 'completed',
      };

      // Update balance (deduct penalty)
      const newBalance = Math.max(0, currentBalance - amount);
      const balanceData: CreditBalanceData = {
        vendorId: this.currentVendorId,
        currentBalance: newBalance,
        lastUpdated: new Date(),
        pendingTransactions: [],
        syncStatus: 'pending',
      };

      await Promise.all([
        CreditStorageService.storeCreditBalance(balanceData),
        CreditStorageService.addCreditTransaction(transaction),
      ]);

      // Queue for server sync using offline manager
      await offlineManager.queueOfflineOperation({
        type: 'transaction_submit',
        data: { transaction },
        maxRetries: 3,
      });

      // Trigger balance change notification
      creditNotificationService.handleBalanceChange(currentBalance, newBalance, transaction);
    } catch (error) {
      console.error('Failed to add penalty:', error);
      creditNotificationService.showCreditError('add penalty', 'Unable to add penalty');
      throw new Error('Unable to add penalty');
    }
  }

  /**
   * Check if vendor has sufficient credits for a booking
   */
  async hasSufficientCredits(orderValue: number): Promise<boolean> {
    try {
      const requiredCredits = this.calculateRequiredCredits(orderValue);
      const currentBalance = await this.getCurrentBalance();
      return currentBalance >= requiredCredits;
    } catch (error) {
      console.error('Failed to check sufficient credits:', error);
      return false;
    }
  }

  /**
   * Get network and sync status
   */
  getSystemStatus(): { isOnline: boolean; isSyncing: boolean } {
    return {
      isOnline: offlineManager.getNetworkStatus(),
      isSyncing: offlineManager.getSyncStatus(),
    };
  }

  /**
   * Validate data integrity
   */
  async validateDataIntegrity(): Promise<boolean> {
    try {
      const integrityCheck = await offlineManager.validateDataIntegrity();
      return integrityCheck.balanceIntegrity && integrityCheck.transactionIntegrity;
    } catch (error) {
      console.error('Failed to validate data integrity:', error);
      return false;
    }
  }

  /**
   * Recover from data corruption
   */
  async recoverFromCorruption(): Promise<void> {
    try {
      await offlineManager.recoverFromCorruption();
      creditNotificationService.showCreditSuccess('Data recovery completed successfully');
    } catch (error) {
      console.error('Failed to recover from corruption:', error);
      const creditError = await creditErrorHandler.handleDataCorruption({ 
        error: error instanceof Error ? error.message : String(error) 
      });
      creditErrorHandler.logError(creditError);
      
      // Try automatic recovery
      const recoveryPlan = creditRecoveryService.createRecoveryPlan(creditError);
      const recovered = await creditRecoveryService.executeAutoRecovery(recoveryPlan);
      
      if (!recovered) {
        creditNotificationService.showCreditError('recover data', 'Unable to recover data from server');
        throw error;
      }
    }
  }

  /**
   * Handle credit operation errors with recovery
   */
  async handleCreditError(error: any, operation: string, context?: any): Promise<void> {
    try {
      let creditError;
      
      // Convert to credit error based on operation type
      if (operation.includes('payment')) {
        creditError = await creditErrorHandler.handlePaymentError(error, context?.amount || 0);
      } else if (operation.includes('network') || operation.includes('sync')) {
        creditError = await creditErrorHandler.handleNetworkError(error, operation);
      } else if (operation.includes('storage')) {
        creditError = await creditErrorHandler.handleStorageError(error, operation);
      } else {
        creditError = {
          type: CreditErrorType.SYSTEM_ERROR,
          message: error.message || 'Unknown error',
          code: 'SYSTEM_ERROR',
          details: { error: error instanceof Error ? error.message : String(error), operation, context },
          recoverable: false,
          userMessage: 'An unexpected error occurred. Please try again.',
        };
      }

      creditErrorHandler.logError(creditError, context);

      // Create and execute recovery plan
      const recoveryPlan = creditRecoveryService.createRecoveryPlan(creditError, context);
      
      if (recoveryPlan.canAutoRecover) {
        const recovered = await creditRecoveryService.executeAutoRecovery(recoveryPlan);
        if (recovered) {
          console.log('Successfully recovered from error:', operation);
          return;
        }
      }

      // If auto-recovery failed or not possible, show user-friendly error
      if (creditError.suggestedAction) {
        creditNotificationService.showCreditError(operation, `${creditError.userMessage} ${creditError.suggestedAction}`);
      } else {
        creditNotificationService.showCreditError(operation, creditError.userMessage);
      }
    } catch (recoveryError) {
      console.error('Error handling failed:', recoveryError);
      creditNotificationService.showCreditError(operation, 'An unexpected error occurred. Please try again.');
    }
  }

  /**
   * Validate system integrity and recover if needed
   */
  async validateAndRecover(): Promise<boolean> {
    try {
      const integrityCheck = await this.validateDataIntegrity();
      
      if (!integrityCheck) {
        console.warn('Data integrity check failed, attempting recovery...');
        
        const corruptionError = await creditErrorHandler.handleDataCorruption({
          operation: 'integrity_check',
          issues: ['Data integrity validation failed'],
        });
        
        const recoveryPlan = creditRecoveryService.createRecoveryPlan(corruptionError);
        const recovered = await creditRecoveryService.executeAutoRecovery(recoveryPlan);
        
        if (recovered) {
          // Re-validate after recovery
          return await this.validateDataIntegrity();
        }
        
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Validation and recovery failed:', error);
      await this.handleCreditError(error, 'validate_and_recover');
      return false;
    }
  }

  /**
   * Get error recovery suggestions for user
   */
  getRecoverySuggestions(errorType: CreditErrorType): string[] {
    const mockError = {
      type: errorType,
      message: '',
      code: '',
      details: {},
      recoverable: true,
      userMessage: '',
    };
    
    return creditRecoveryService.getRecoverySuggestions(mockError);
  }

  /**
   * Check if any recovery operations are in progress
   */
  isRecoveryInProgress(): boolean {
    return creditRecoveryService.isRecoveryInProgress();
  }

  /**
   * Get performance metrics and cache statistics
   */
  getPerformanceMetrics(): {
    cache: ReturnType<typeof creditCacheService.getCacheStats>;
    performance: ReturnType<typeof creditPerformanceService.getRealTimeMetrics>;
    summary: ReturnType<typeof creditPerformanceService.getPerformanceSummary>;
  } {
    return {
      cache: creditCacheService.getCacheStats(),
      performance: creditPerformanceService.getRealTimeMetrics(),
      summary: creditPerformanceService.getPerformanceSummary(),
    };
  }

  /**
   * Optimize system performance by clearing old data and preloading
   */
  async optimizePerformance(): Promise<void> {
    try {
      // Clear old performance metrics
      creditPerformanceService.clearOldMetrics();
      
      // Preload commonly accessed data
      const allTransactions = await CreditStorageService.getCreditTransactions();
      await creditCacheService.preloadCommonFilters(allTransactions);
      
      // Ensure balance is cached
      await this.getCurrentBalance();
      
      console.log('Performance optimization completed');
    } catch (error) {
      console.error('Failed to optimize performance:', error);
    }
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<{
    balance: boolean;
    transactions: boolean;
    network: boolean;
    storage: boolean;
    sync: boolean;
  }> {
    const health = {
      balance: false,
      transactions: false,
      network: false,
      storage: false,
      sync: false,
    };

    try {
      // Check balance retrieval
      await this.getCurrentBalance();
      health.balance = true;
    } catch (error) {
      console.warn('Balance health check failed:', error);
    }

    try {
      // Check transaction history
      await this.getTransactionHistory();
      health.transactions = true;
    } catch (error) {
      console.warn('Transaction health check failed:', error);
    }

    try {
      // Check network status
      health.network = offlineManager.getNetworkStatus();
    } catch (error) {
      console.warn('Network health check failed:', error);
    }

    try {
      // Check storage operations
      const testData = { test: true };
      await CreditStorageService.storePendingSync([JSON.stringify(testData)]);
      const retrieved = await CreditStorageService.getPendingSync();
      health.storage = retrieved.length > 0;
      
      // Clean up test data
      await CreditStorageService.storePendingSync([]);
    } catch (error) {
      console.warn('Storage health check failed:', error);
    }

    try {
      // Check sync status
      health.sync = !offlineManager.getSyncStatus(); // Not syncing means healthy
    } catch (error) {
      console.warn('Sync health check failed:', error);
    }

    return health;
  }
}

// Export singleton instance
export const creditService = CreditService.getInstance();