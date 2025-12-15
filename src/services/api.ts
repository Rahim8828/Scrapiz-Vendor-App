// API Configuration and Base Service
import { CreditBalanceData, CreditTransaction } from '../types';

const API_BASE_URL = 'https://api.scrapiz.com/v1';

export interface CreditSyncRequest {
  vendorId: string;
  balance: CreditBalanceData;
  transactions: CreditTransaction[];
  pendingOperations: string[];
}

export interface CreditSyncResponse {
  success: boolean;
  serverBalance: CreditBalanceData;
  serverTransactions: CreditTransaction[];
  conflicts?: {
    balanceConflict?: boolean;
    transactionConflicts?: string[];
  };
}

export interface PaymentVerificationResponse {
  verified: boolean;
  transactionId: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  timestamp: Date;
}

export class ApiService {
  private static baseURL = API_BASE_URL;
  
  static async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };
    
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
  
  static get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }
  
  static post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  static put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  static delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Credit System API Methods

  /**
   * Sync credit balance with server (Mock implementation for frontend-only development)
   */
  static async syncCreditBalance(vendorId: string): Promise<CreditBalanceData> {
    // Mock implementation - return current local balance
    console.log('Mock API: syncCreditBalance for vendor', vendorId);
    return Promise.resolve({
      vendorId,
      currentBalance: 50, // Mock balance
      lastUpdated: new Date(),
      pendingTransactions: [],
      syncStatus: 'synced',
    });
  }

  /**
   * Sync transaction history with server (Mock implementation)
   */
  static async syncTransactionHistory(
    vendorId: string, 
    lastSyncTimestamp?: Date
  ): Promise<CreditTransaction[]> {
    console.log('Mock API: syncTransactionHistory for vendor', vendorId, 'since', lastSyncTimestamp);
    // Mock implementation - return empty array (no new transactions from server)
    return Promise.resolve([]);
  }

  /**
   * Perform comprehensive credit data synchronization (Mock implementation)
   */
  static async syncCreditData(syncRequest: CreditSyncRequest): Promise<CreditSyncResponse> {
    console.log('Mock API: syncCreditData', syncRequest);
    // Mock implementation - return success with no conflicts
    return Promise.resolve({
      success: true,
      serverBalance: syncRequest.balance,
      serverTransactions: syncRequest.transactions,
    });
  }

  /**
   * Verify payment transaction with payment gateway (Mock implementation)
   */
  static async verifyPayment(transactionId: string): Promise<PaymentVerificationResponse> {
    console.log('Mock API: verifyPayment', transactionId);
    // Mock implementation - return successful verification
    return Promise.resolve({
      verified: true,
      transactionId,
      amount: 100,
      status: 'success',
      timestamp: new Date(),
    });
  }

  /**
   * Submit credit transaction to server (Mock implementation)
   */
  static async submitCreditTransaction(
    vendorId: string, 
    transaction: CreditTransaction
  ): Promise<{ success: boolean; serverId?: string }> {
    console.log('Mock API: submitCreditTransaction for vendor', vendorId, transaction);
    // Mock implementation - return success
    return Promise.resolve({
      success: true,
      serverId: `server_${transaction.id}`,
    });
  }

  /**
   * Update credit balance on server (Mock implementation)
   */
  static async updateCreditBalance(
    vendorId: string, 
    balance: CreditBalanceData
  ): Promise<{ success: boolean }> {
    console.log('Mock API: updateCreditBalance for vendor', vendorId, balance);
    // Mock implementation - return success
    return Promise.resolve({ success: true });
  }

  /**
   * Resolve sync conflicts with server (Mock implementation)
   */
  static async resolveSyncConflicts(
    vendorId: string,
    resolution: {
      useServerBalance?: boolean;
      useServerTransactions?: boolean;
      mergeStrategy?: 'server-wins' | 'client-wins' | 'merge';
    }
  ): Promise<CreditSyncResponse> {
    console.log('Mock API: resolveSyncConflicts for vendor', vendorId, resolution);
    // Mock implementation - return resolved data
    return Promise.resolve({
      success: true,
      serverBalance: {
        vendorId,
        currentBalance: 50,
        lastUpdated: new Date(),
        pendingTransactions: [],
        syncStatus: 'synced',
      },
      serverTransactions: [],
    });
  }
}