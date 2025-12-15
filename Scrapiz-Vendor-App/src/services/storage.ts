import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreditBalanceData, CreditTransaction } from '../types';
import { creditErrorHandler } from './creditErrorHandler';

// Storage keys
const STORAGE_KEYS = {
  CREDIT_BALANCE: '@scrapiz_credit_balance',
  CREDIT_TRANSACTIONS: '@scrapiz_credit_transactions',
  PENDING_SYNC: '@scrapiz_pending_sync',
} as const;

export class CreditStorageService {
  /**
   * Store credit balance data
   */
  static async storeCreditBalance(balance: CreditBalanceData): Promise<void> {
    try {
      // Validate balance data before storing
      if (!balance || typeof balance.currentBalance !== 'number' || balance.currentBalance < 0) {
        throw new Error('Invalid balance data');
      }

      const serializedBalance = JSON.stringify({
        ...balance,
        lastUpdated: balance.lastUpdated.toISOString(),
      });
      
      await AsyncStorage.setItem(STORAGE_KEYS.CREDIT_BALANCE, serializedBalance);
    } catch (error) {
      console.error('Failed to store credit balance:', error);
      const creditError = await creditErrorHandler.handleStorageError(error, 'store credit balance');
      creditErrorHandler.logError(creditError, { balance });
      throw new Error('Failed to save credit balance to storage');
    }
  }

  /**
   * Retrieve credit balance data
   */
  static async getCreditBalance(): Promise<CreditBalanceData | null> {
    try {
      const serializedBalance = await AsyncStorage.getItem(STORAGE_KEYS.CREDIT_BALANCE);
      if (!serializedBalance) {
        return null;
      }

      const parsed = JSON.parse(serializedBalance);
      
      // Validate parsed data
      if (!parsed || typeof parsed.currentBalance !== 'number' || !parsed.vendorId) {
        throw new Error('Corrupted balance data detected');
      }

      return {
        ...parsed,
        lastUpdated: new Date(parsed.lastUpdated),
      };
    } catch (error) {
      console.error('Failed to retrieve credit balance:', error);
      
      // Check if this is a data corruption issue
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      
      if (errorMessage?.includes('Corrupted') || errorName === 'SyntaxError') {
        const corruptionError = await creditErrorHandler.handleDataCorruption({
          operation: 'getCreditBalance',
          error: errorMessage,
        });
        creditErrorHandler.logError(corruptionError);
      } else {
        const creditError = await creditErrorHandler.handleStorageError(error, 'retrieve credit balance');
        creditErrorHandler.logError(creditError);
      }
      
      throw new Error('Failed to load credit balance from storage');
    }
  }

  /**
   * Store credit transactions
   */
  static async storeCreditTransactions(transactions: CreditTransaction[]): Promise<void> {
    try {
      const serializedTransactions = JSON.stringify(
        transactions.map(transaction => ({
          ...transaction,
          timestamp: transaction.timestamp.toISOString(),
        }))
      );
      await AsyncStorage.setItem(STORAGE_KEYS.CREDIT_TRANSACTIONS, serializedTransactions);
    } catch (error) {
      console.error('Failed to store credit transactions:', error);
      throw new Error('Failed to save credit transactions to storage');
    }
  }

  /**
   * Retrieve credit transactions
   */
  static async getCreditTransactions(): Promise<CreditTransaction[]> {
    try {
      const serializedTransactions = await AsyncStorage.getItem(STORAGE_KEYS.CREDIT_TRANSACTIONS);
      if (!serializedTransactions) {
        return [];
      }

      const parsed = JSON.parse(serializedTransactions);
      return parsed.map((transaction: any) => ({
        ...transaction,
        timestamp: new Date(transaction.timestamp),
      }));
    } catch (error) {
      console.error('Failed to retrieve credit transactions:', error);
      throw new Error('Failed to load credit transactions from storage');
    }
  }

  /**
   * Add a single transaction to storage
   */
  static async addCreditTransaction(transaction: CreditTransaction): Promise<void> {
    try {
      const existingTransactions = await this.getCreditTransactions();
      const updatedTransactions = [...existingTransactions, transaction];
      await this.storeCreditTransactions(updatedTransactions);
    } catch (error) {
      console.error('Failed to add credit transaction:', error);
      throw new Error('Failed to save new credit transaction');
    }
  }

  /**
   * Update an existing transaction in storage
   */
  static async updateCreditTransaction(updatedTransaction: CreditTransaction): Promise<void> {
    try {
      const existingTransactions = await this.getCreditTransactions();
      const transactionIndex = existingTransactions.findIndex(t => t.id === updatedTransaction.id);
      
      if (transactionIndex === -1) {
        throw new Error(`Transaction with id ${updatedTransaction.id} not found`);
      }

      existingTransactions[transactionIndex] = updatedTransaction;
      await this.storeCreditTransactions(existingTransactions);
    } catch (error) {
      console.error('Failed to update credit transaction:', error);
      throw new Error('Failed to update credit transaction in storage');
    }
  }

  /**
   * Store pending sync operations
   */
  static async storePendingSync(operations: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(operations));
    } catch (error) {
      console.error('Failed to store pending sync operations:', error);
      throw new Error('Failed to save pending sync operations');
    }
  }

  /**
   * Retrieve pending sync operations
   */
  static async getPendingSync(): Promise<string[]> {
    try {
      const serializedOperations = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
      return serializedOperations ? JSON.parse(serializedOperations) : [];
    } catch (error) {
      console.error('Failed to retrieve pending sync operations:', error);
      return [];
    }
  }

  /**
   * Clear all credit-related storage data
   */
  static async clearAllCreditData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.CREDIT_BALANCE),
        AsyncStorage.removeItem(STORAGE_KEYS.CREDIT_TRANSACTIONS),
        AsyncStorage.removeItem(STORAGE_KEYS.PENDING_SYNC),
      ]);
    } catch (error) {
      console.error('Failed to clear credit data:', error);
      throw new Error('Failed to clear credit data from storage');
    }
  }

  /**
   * Initialize default credit balance for new vendors
   */
  static async initializeDefaultBalance(vendorId: string): Promise<CreditBalanceData> {
    const defaultBalance: CreditBalanceData = {
      vendorId,
      currentBalance: 0,
      lastUpdated: new Date(),
      pendingTransactions: [],
      syncStatus: 'synced',
    };

    await this.storeCreditBalance(defaultBalance);
    return defaultBalance;
  }
}