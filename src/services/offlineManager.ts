// Note: @react-native-community/netinfo package needs to be installed
// For now, using a mock implementation
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreditTransaction } from '../types';
import { CreditStorageService } from './storage';
import { creditApiService } from './creditApiService';
const NetInfo = {
  addEventListener: (callback: (state: { isConnected: boolean | null }) => void) => {
    // Mock implementation - in production, install @react-native-community/netinfo
    // and replace this with the actual NetInfo.addEventListener
    console.warn('NetInfo mock - install @react-native-community/netinfo for production');
    
    // Only simulate network changes if not in test environment
    let timeoutId: NodeJS.Timeout | null = null;
    if (typeof jest === 'undefined') {
      timeoutId = setTimeout(() => callback({ isConnected: true }), 1000);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }; // Unsubscribe function
  },
};

export interface OfflineOperation {
  id: string;
  type: 'credit_deduction' | 'credit_addition' | 'balance_update' | 'transaction_submit';
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface DataIntegrityCheck {
  balanceIntegrity: boolean;
  transactionIntegrity: boolean;
  issues: string[];
  lastChecked: Date;
}

export class OfflineManager {
  private static instance: OfflineManager;
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private autoSyncInterval: NodeJS.Timeout | null = null;
  private readonly STORAGE_KEYS = {
    OFFLINE_OPERATIONS: '@scrapiz_offline_operations',
    DATA_INTEGRITY: '@scrapiz_data_integrity',
    LAST_SYNC: '@scrapiz_last_sync',
  };

  private constructor() {
    this.initializeNetworkListener();
    // Only start auto-sync if not in test environment
    if (typeof jest === 'undefined') {
      this.startAutoSync();
    }
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  /**
   * Initialize network connectivity listener
   */
  private initializeNetworkListener(): void {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      console.log('Network status changed:', this.isOnline ? 'Online' : 'Offline');
      
      // If we just came back online, trigger sync
      if (wasOffline && this.isOnline) {
        this.handleNetworkReconnection();
      }
    });
  }

  /**
   * Start automatic sync when online
   */
  private startAutoSync(): void {
    // Sync every 5 minutes when online
    this.autoSyncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.performAutoSync();
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
  }

  /**
   * Queue operation for offline execution
   */
  async queueOfflineOperation(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<string> {
    const offlineOperation: OfflineOperation = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      retryCount: 0,
      status: 'pending',
      ...operation,
    };

    try {
      const existingOperations = await this.getOfflineOperations();
      const updatedOperations = [...existingOperations, offlineOperation];
      await this.storeOfflineOperations(updatedOperations);
      
      console.log('Queued offline operation:', offlineOperation.id);
      
      // If online, try to process immediately
      if (this.isOnline) {
        this.processOfflineOperations();
      }
      
      return offlineOperation.id;
    } catch (error) {
      console.error('Failed to queue offline operation:', error);
      throw new Error('Unable to queue operation for offline processing');
    }
  }

  /**
   * Process all pending offline operations
   */
  async processOfflineOperations(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    
    try {
      const operations = await this.getOfflineOperations();
      const pendingOperations = operations.filter(op => op.status === 'pending' || op.status === 'failed');
      
      if (pendingOperations.length === 0) {
        return;
      }

      console.log(`Processing ${pendingOperations.length} offline operations`);
      
      for (const operation of pendingOperations) {
        await this.processOperation(operation);
      }
      
      // Clean up completed operations
      await this.cleanupCompletedOperations();
      
    } catch (error) {
      console.error('Failed to process offline operations:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Process individual offline operation
   */
  private async processOperation(operation: OfflineOperation): Promise<void> {
    try {
      // Update operation status to processing
      await this.updateOperationStatus(operation.id, 'processing');
      
      let success = false;
      
      switch (operation.type) {
        case 'credit_deduction':
          success = await this.processCreditDeduction(operation.data);
          break;
        case 'credit_addition':
          success = await this.processCreditAddition(operation.data);
          break;
        case 'balance_update':
          success = await this.processBalanceUpdate(operation.data);
          break;
        case 'transaction_submit':
          success = await this.processTransactionSubmit(operation.data);
          break;
        default:
          console.warn('Unknown operation type:', operation.type);
          success = false;
      }
      
      if (success) {
        await this.updateOperationStatus(operation.id, 'completed');
        console.log('Successfully processed operation:', operation.id);
      } else {
        await this.handleOperationFailure(operation);
      }
      
    } catch (error) {
      console.error('Failed to process operation:', operation.id, error);
      await this.handleOperationFailure(operation);
    }
  }

  /**
   * Handle operation failure with retry logic
   */
  private async handleOperationFailure(operation: OfflineOperation): Promise<void> {
    const newStatus: OfflineOperation['status'] = operation.retryCount + 1 >= operation.maxRetries ? 'failed' : 'pending';
    
    const updatedOperation: OfflineOperation = {
      ...operation,
      retryCount: operation.retryCount + 1,
      status: newStatus,
    };
    
    await this.updateOperation(updatedOperation);
    
    if (updatedOperation.status === 'failed') {
      console.error('Operation failed permanently after max retries:', operation.id);
      // Could trigger user notification here
    }
  }

  /**
   * Process credit deduction operation
   */
  private async processCreditDeduction(data: any): Promise<boolean> {
    try {
      const { transactionId } = data;
      const transaction = await this.findTransactionById(transactionId);
      
      if (!transaction) {
        console.error('Transaction not found for deduction:', transactionId);
        return false;
      }
      
      return await creditApiService.submitTransaction(transaction);
    } catch (error) {
      console.error('Failed to process credit deduction:', error);
      return false;
    }
  }

  /**
   * Process credit addition operation
   */
  private async processCreditAddition(data: any): Promise<boolean> {
    try {
      const { transactionId } = data;
      const transaction = await this.findTransactionById(transactionId);
      
      if (!transaction) {
        console.error('Transaction not found for addition:', transactionId);
        return false;
      }
      
      return await creditApiService.submitTransaction(transaction);
    } catch (error) {
      console.error('Failed to process credit addition:', error);
      return false;
    }
  }

  /**
   * Process balance update operation
   */
  private async processBalanceUpdate(data: any): Promise<boolean> {
    try {
      const balance = await CreditStorageService.getCreditBalance();
      if (!balance) {
        return false;
      }
      
      // Sync balance with server
      await creditApiService.syncCreditBalance();
      return true;
    } catch (error) {
      console.error('Failed to process balance update:', error);
      return false;
    }
  }

  /**
   * Process transaction submit operation
   */
  private async processTransactionSubmit(data: any): Promise<boolean> {
    try {
      const { transaction } = data;
      return await creditApiService.submitTransaction(transaction);
    } catch (error) {
      console.error('Failed to process transaction submit:', error);
      return false;
    }
  }

  /**
   * Perform automatic sync when network is available
   */
  private async performAutoSync(): Promise<void> {
    try {
      console.log('Performing automatic sync...');
      
      // Process offline operations first
      await this.processOfflineOperations();
      
      // Perform comprehensive sync
      await creditApiService.performComprehensiveSync();
      
      // Validate data integrity
      await this.validateDataIntegrity();
      
      // Update last sync timestamp
      await this.updateLastSyncTimestamp();
      
      console.log('Automatic sync completed successfully');
    } catch (error) {
      console.error('Automatic sync failed:', error);
    }
  }

  /**
   * Handle network reconnection
   */
  private async handleNetworkReconnection(): Promise<void> {
    console.log('Network reconnected, starting sync...');
    
    // Wait a bit for network to stabilize
    setTimeout(() => {
      this.performAutoSync();
    }, 2000);
  }

  /**
   * Validate data integrity
   */
  async validateDataIntegrity(): Promise<DataIntegrityCheck> {
    try {
      const [balance, transactions] = await Promise.all([
        CreditStorageService.getCreditBalance(),
        CreditStorageService.getCreditTransactions(),
      ]);

      const issues: string[] = [];
      let balanceIntegrity = true;
      let transactionIntegrity = true;

      // Check balance integrity
      if (!balance) {
        issues.push('Credit balance not found');
        balanceIntegrity = false;
      } else if (balance.currentBalance < 0) {
        issues.push('Negative credit balance detected');
        balanceIntegrity = false;
      }

      // Check transaction integrity
      if (transactions.length === 0 && balance && balance.currentBalance > 0) {
        issues.push('Balance exists but no transactions found');
        transactionIntegrity = false;
      }

      // Validate transaction consistency
      if (balance && transactions.length > 0) {
        const calculatedBalance = this.calculateBalanceFromTransactions(transactions);
        if (Math.abs(calculatedBalance - balance.currentBalance) > 0.01) {
          issues.push(`Balance mismatch: stored=${balance.currentBalance}, calculated=${calculatedBalance}`);
          balanceIntegrity = false;
        }
      }

      // Check for duplicate transactions
      const transactionIds = transactions.map(t => t.id);
      const uniqueIds = new Set(transactionIds);
      if (transactionIds.length !== uniqueIds.size) {
        issues.push('Duplicate transactions detected');
        transactionIntegrity = false;
      }

      const integrityCheck: DataIntegrityCheck = {
        balanceIntegrity,
        transactionIntegrity,
        issues,
        lastChecked: new Date(),
      };

      // Store integrity check result
      await this.storeDataIntegrityCheck(integrityCheck);

      if (issues.length > 0) {
        console.warn('Data integrity issues detected:', issues);
      }

      return integrityCheck;
    } catch (error) {
      console.error('Failed to validate data integrity:', error);
      throw new Error('Unable to validate data integrity');
    }
  }

  /**
   * Recover from data corruption
   */
  async recoverFromCorruption(): Promise<void> {
    try {
      console.log('Starting data recovery from server...');
      
      // Clear local corrupted data
      await CreditStorageService.clearAllCreditData();
      
      // Fetch fresh data from server
      const [serverBalance, serverTransactions] = await Promise.all([
        creditApiService.syncCreditBalance(),
        creditApiService.syncTransactionHistory(),
      ]);

      // Store recovered data
      await Promise.all([
        CreditStorageService.storeCreditBalance(serverBalance),
        CreditStorageService.storeCreditTransactions(serverTransactions),
      ]);

      // Clear offline operations (they may be corrupted too)
      await this.storeOfflineOperations([]);

      console.log('Data recovery completed successfully');
    } catch (error) {
      console.error('Failed to recover from data corruption:', error);
      throw new Error('Unable to recover data from server');
    }
  }

  /**
   * Calculate balance from transaction history
   */
  private calculateBalanceFromTransactions(transactions: CreditTransaction[]): number {
    return transactions.reduce((balance, transaction) => {
      switch (transaction.type) {
        case 'addition':
          return balance + transaction.amount;
        case 'deduction':
        case 'penalty':
          return balance - transaction.amount;
        default:
          return balance;
      }
    }, 0);
  }

  /**
   * Find transaction by ID
   */
  private async findTransactionById(transactionId: string): Promise<CreditTransaction | null> {
    try {
      const transactions = await CreditStorageService.getCreditTransactions();
      return transactions.find(t => t.id === transactionId) || null;
    } catch (error) {
      console.error('Failed to find transaction:', error);
      return null;
    }
  }

  // Storage helper methods

  private async getOfflineOperations(): Promise<OfflineOperation[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.OFFLINE_OPERATIONS);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((op: any) => ({
        ...op,
        timestamp: new Date(op.timestamp),
      }));
    } catch (error) {
      console.error('Failed to get offline operations:', error);
      return [];
    }
  }

  private async storeOfflineOperations(operations: OfflineOperation[]): Promise<void> {
    try {
      const serialized = JSON.stringify(operations.map(op => ({
        ...op,
        timestamp: op.timestamp.toISOString(),
      })));
      await AsyncStorage.setItem(this.STORAGE_KEYS.OFFLINE_OPERATIONS, serialized);
    } catch (error) {
      console.error('Failed to store offline operations:', error);
      throw error;
    }
  }

  private async updateOperationStatus(operationId: string, status: OfflineOperation['status']): Promise<void> {
    const operations = await this.getOfflineOperations();
    const operationIndex = operations.findIndex(op => op.id === operationId);
    
    if (operationIndex !== -1) {
      operations[operationIndex].status = status;
      await this.storeOfflineOperations(operations);
    }
  }

  private async updateOperation(updatedOperation: OfflineOperation): Promise<void> {
    const operations = await this.getOfflineOperations();
    const operationIndex = operations.findIndex(op => op.id === updatedOperation.id);
    
    if (operationIndex !== -1) {
      operations[operationIndex] = updatedOperation;
      await this.storeOfflineOperations(operations);
    }
  }

  private async cleanupCompletedOperations(): Promise<void> {
    const operations = await this.getOfflineOperations();
    const activeOperations = operations.filter(op => op.status !== 'completed');
    await this.storeOfflineOperations(activeOperations);
  }

  private async storeDataIntegrityCheck(check: DataIntegrityCheck): Promise<void> {
    try {
      const serialized = JSON.stringify({
        ...check,
        lastChecked: check.lastChecked.toISOString(),
      });
      await AsyncStorage.setItem(this.STORAGE_KEYS.DATA_INTEGRITY, serialized);
    } catch (error) {
      console.error('Failed to store data integrity check:', error);
    }
  }

  private async updateLastSyncTimestamp(): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      await AsyncStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, timestamp);
    } catch (error) {
      console.error('Failed to update last sync timestamp:', error);
    }
  }

  /**
   * Get current network status
   */
  getNetworkStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Get sync status
   */
  getSyncStatus(): boolean {
    return this.syncInProgress;
  }

  /**
   * Force sync (manual trigger)
   */
  async forceSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }
    
    await this.performAutoSync();
  }
}

// Export singleton instance
export const offlineManager = OfflineManager.getInstance();