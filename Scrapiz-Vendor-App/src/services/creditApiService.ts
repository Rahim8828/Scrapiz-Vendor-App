import { ApiService, CreditSyncRequest, CreditSyncResponse, PaymentVerificationResponse } from './api';
import { CreditBalanceData, CreditTransaction } from '../types';
import { CreditStorageService } from './storage';

export interface ConflictResolution {
  balanceResolution?: 'server' | 'client' | 'merge';
  transactionResolution?: 'server' | 'client' | 'merge';
  conflictedTransactionIds?: string[];
}

export class CreditApiService {
  private static instance: CreditApiService;
  private vendorId: string = 'default-vendor';

  private constructor() {}

  static getInstance(): CreditApiService {
    if (!CreditApiService.instance) {
      CreditApiService.instance = new CreditApiService();
    }
    return CreditApiService.instance;
  }

  setVendorId(vendorId: string): void {
    this.vendorId = vendorId;
  }

  /**
   * Sync credit balance with server and handle conflicts
   */
  async syncCreditBalance(): Promise<CreditBalanceData> {
    try {
      const serverBalance = await ApiService.syncCreditBalance(this.vendorId);
      const localBalance = await CreditStorageService.getCreditBalance();

      if (!localBalance) {
        // No local balance, use server balance
        await CreditStorageService.storeCreditBalance(serverBalance);
        return serverBalance;
      }

      // Check for conflicts
      if (this.hasBalanceConflict(localBalance, serverBalance)) {
        const resolvedBalance = await this.resolveBalanceConflict(localBalance, serverBalance);
        await CreditStorageService.storeCreditBalance(resolvedBalance);
        return resolvedBalance;
      }

      // No conflict, update local with server data if server is newer
      if (serverBalance.lastUpdated > localBalance.lastUpdated) {
        await CreditStorageService.storeCreditBalance(serverBalance);
        return serverBalance;
      }

      return localBalance;
    } catch (error) {
      console.error('Failed to sync credit balance:', error);
      throw new Error('Unable to sync credit balance with server');
    }
  }

  /**
   * Sync transaction history with server and handle conflicts
   */
  async syncTransactionHistory(): Promise<CreditTransaction[]> {
    try {
      const localTransactions = await CreditStorageService.getCreditTransactions();
      const lastSyncTimestamp = await this.getLastSyncTimestamp();
      
      const serverTransactions = await ApiService.syncTransactionHistory(
        this.vendorId, 
        lastSyncTimestamp
      );

      if (serverTransactions.length === 0) {
        return localTransactions;
      }

      // Merge transactions and resolve conflicts
      const mergedTransactions = await this.mergeTransactions(localTransactions, serverTransactions);
      
      // Store merged transactions
      await CreditStorageService.storeCreditTransactions(mergedTransactions);
      await this.updateLastSyncTimestamp(new Date());

      return mergedTransactions;
    } catch (error) {
      console.error('Failed to sync transaction history:', error);
      throw new Error('Unable to sync transaction history with server');
    }
  }

  /**
   * Perform comprehensive sync with conflict resolution
   */
  async performComprehensiveSync(): Promise<CreditSyncResponse> {
    try {
      const [localBalance, localTransactions] = await Promise.all([
        CreditStorageService.getCreditBalance(),
        CreditStorageService.getCreditTransactions(),
      ]);

      if (!localBalance) {
        throw new Error('No local balance found');
      }

      const pendingOperations = await CreditStorageService.getPendingSync();

      const syncRequest: CreditSyncRequest = {
        vendorId: this.vendorId,
        balance: localBalance,
        transactions: localTransactions,
        pendingOperations,
      };

      const syncResponse = await ApiService.syncCreditData(syncRequest);

      if (syncResponse.conflicts) {
        // Handle conflicts
        const resolution = await this.handleSyncConflicts(syncResponse);
        return resolution;
      }

      // No conflicts, update local data with server data
      await Promise.all([
        CreditStorageService.storeCreditBalance(syncResponse.serverBalance),
        CreditStorageService.storeCreditTransactions(syncResponse.serverTransactions),
        CreditStorageService.storePendingSync([]), // Clear pending operations
      ]);

      return syncResponse;
    } catch (error) {
      console.error('Failed to perform comprehensive sync:', error);
      throw new Error('Unable to perform comprehensive sync with server');
    }
  }

  /**
   * Verify payment with payment gateway
   */
  async verifyPayment(transactionId: string): Promise<PaymentVerificationResponse> {
    try {
      return await ApiService.verifyPayment(transactionId);
    } catch (error) {
      console.error('Failed to verify payment:', error);
      throw new Error('Unable to verify payment with server');
    }
  }

  /**
   * Submit individual credit transaction to server
   */
  async submitTransaction(transaction: CreditTransaction): Promise<boolean> {
    try {
      const result = await ApiService.submitCreditTransaction(this.vendorId, transaction);
      
      if (result.success && result.serverId) {
        // Update local transaction with server ID
        const updatedTransaction = {
          ...transaction,
          metadata: {
            ...transaction.metadata,
            serverId: result.serverId,
          },
        };
        
        await CreditStorageService.updateCreditTransaction(updatedTransaction);
      }

      return result.success;
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      return false;
    }
  }

  /**
   * Check if there's a balance conflict between local and server
   */
  private hasBalanceConflict(local: CreditBalanceData, server: CreditBalanceData): boolean {
    // Consider it a conflict if balances differ and both have been updated recently
    const timeDiff = Math.abs(local.lastUpdated.getTime() - server.lastUpdated.getTime());
    const recentUpdateThreshold = 5 * 60 * 1000; // 5 minutes

    return (
      local.currentBalance !== server.currentBalance &&
      timeDiff < recentUpdateThreshold
    );
  }

  /**
   * Resolve balance conflict using merge strategy
   */
  private async resolveBalanceConflict(
    local: CreditBalanceData, 
    server: CreditBalanceData
  ): Promise<CreditBalanceData> {
    // Default strategy: use the higher balance (more conservative approach)
    // In production, this might involve more sophisticated conflict resolution
    const resolvedBalance = local.currentBalance > server.currentBalance ? local : server;
    
    return {
      ...resolvedBalance,
      syncStatus: 'synced',
      lastUpdated: new Date(),
    };
  }

  /**
   * Merge local and server transactions, handling duplicates and conflicts
   */
  private async mergeTransactions(
    local: CreditTransaction[], 
    server: CreditTransaction[]
  ): Promise<CreditTransaction[]> {
    const merged = [...local];
    const localIds = new Set(local.map(t => t.id));

    // Add server transactions that don't exist locally
    for (const serverTransaction of server) {
      if (!localIds.has(serverTransaction.id)) {
        merged.push(serverTransaction);
      } else {
        // Handle potential conflicts for existing transactions
        const localTransaction = local.find(t => t.id === serverTransaction.id);
        if (localTransaction && this.hasTransactionConflict(localTransaction, serverTransaction)) {
          // Use server version for conflicts (server is authoritative)
          const index = merged.findIndex(t => t.id === serverTransaction.id);
          if (index !== -1) {
            merged[index] = serverTransaction;
          }
        }
      }
    }

    // Sort by timestamp (newest first)
    return merged.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Check if there's a conflict between local and server transaction
   */
  private hasTransactionConflict(local: CreditTransaction, server: CreditTransaction): boolean {
    return (
      local.amount !== server.amount ||
      local.status !== server.status ||
      local.type !== server.type
    );
  }

  /**
   * Handle sync conflicts by applying resolution strategy
   */
  private async handleSyncConflicts(syncResponse: CreditSyncResponse): Promise<CreditSyncResponse> {
    if (!syncResponse.conflicts) {
      return syncResponse;
    }

    // Default resolution strategy: server wins for conflicts
    const resolution = {
      useServerBalance: syncResponse.conflicts.balanceConflict || false,
      useServerTransactions: (syncResponse.conflicts.transactionConflicts?.length || 0) > 0,
      mergeStrategy: 'server-wins' as const,
    };

    try {
      const resolvedResponse = await ApiService.resolveSyncConflicts(this.vendorId, resolution);
      
      // Update local data with resolved data
      await Promise.all([
        CreditStorageService.storeCreditBalance(resolvedResponse.serverBalance),
        CreditStorageService.storeCreditTransactions(resolvedResponse.serverTransactions),
        CreditStorageService.storePendingSync([]),
      ]);

      return resolvedResponse;
    } catch (error) {
      console.error('Failed to resolve sync conflicts:', error);
      throw new Error('Unable to resolve sync conflicts');
    }
  }

  /**
   * Get last sync timestamp from storage
   */
  private async getLastSyncTimestamp(): Promise<Date | undefined> {
    try {
      const balance = await CreditStorageService.getCreditBalance();
      return balance?.lastUpdated;
    } catch (error) {
      console.error('Failed to get last sync timestamp:', error);
      return undefined;
    }
  }

  /**
   * Update last sync timestamp in storage
   */
  private async updateLastSyncTimestamp(timestamp: Date): Promise<void> {
    try {
      const balance = await CreditStorageService.getCreditBalance();
      if (balance) {
        const updatedBalance = {
          ...balance,
          lastUpdated: timestamp,
          syncStatus: 'synced' as const,
        };
        await CreditStorageService.storeCreditBalance(updatedBalance);
      }
    } catch (error) {
      console.error('Failed to update last sync timestamp:', error);
    }
  }
}

// Export singleton instance
export const creditApiService = CreditApiService.getInstance();