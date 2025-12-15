import { CreditBalanceData, CreditTransaction, TransactionFilter } from '../types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface TransactionCacheKey {
  filter: TransactionFilter;
  limit?: number;
  offset?: number;
}

/**
 * High-performance cache service for credit system data
 * Implements LRU eviction and TTL-based expiration
 */
export class CreditCacheService {
  private static instance: CreditCacheService;
  private balanceCache: CacheEntry<CreditBalanceData> | null = null;
  private transactionCache = new Map<string, CacheEntry<CreditTransaction[]>>();
  private filteredTransactionCache = new Map<string, CacheEntry<CreditTransaction[]>>();
  private maxCacheSize = 50; // Maximum number of cached transaction queries
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
  private balanceTTL = 30 * 1000; // 30 seconds for balance (more frequent updates)

  private constructor() {}

  static getInstance(): CreditCacheService {
    if (!CreditCacheService.instance) {
      CreditCacheService.instance = new CreditCacheService();
    }
    return CreditCacheService.instance;
  }

  /**
   * Cache credit balance with short TTL for real-time updates
   */
  setCachedBalance(balance: CreditBalanceData): void {
    this.balanceCache = {
      data: balance,
      timestamp: Date.now(),
      ttl: this.balanceTTL,
    };
  }

  /**
   * Get cached balance if valid
   */
  getCachedBalance(): CreditBalanceData | null {
    if (!this.balanceCache) return null;
    
    const now = Date.now();
    if (now - this.balanceCache.timestamp > this.balanceCache.ttl) {
      this.balanceCache = null;
      return null;
    }
    
    return this.balanceCache.data;
  }

  /**
   * Cache transaction list with pagination support
   */
  setCachedTransactions(
    transactions: CreditTransaction[], 
    filter: TransactionFilter = 'all',
    limit?: number,
    offset?: number
  ): void {
    const key = this.generateTransactionCacheKey({ filter, limit, offset });
    
    // Implement LRU eviction
    if (this.filteredTransactionCache.size >= this.maxCacheSize) {
      const oldestKey = this.getOldestCacheKey();
      if (oldestKey) {
        this.filteredTransactionCache.delete(oldestKey);
      }
    }

    this.filteredTransactionCache.set(key, {
      data: transactions,
      timestamp: Date.now(),
      ttl: this.defaultTTL,
    });
  }

  /**
   * Get cached transactions if valid
   */
  getCachedTransactions(
    filter: TransactionFilter = 'all',
    limit?: number,
    offset?: number
  ): CreditTransaction[] | null {
    const key = this.generateTransactionCacheKey({ filter, limit, offset });
    const cached = this.filteredTransactionCache.get(key);
    
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.filteredTransactionCache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Cache raw transaction data (before filtering)
   */
  setCachedRawTransactions(transactions: CreditTransaction[]): void {
    this.transactionCache.set('raw', {
      data: transactions,
      timestamp: Date.now(),
      ttl: this.defaultTTL,
    });
  }

  /**
   * Get cached raw transactions
   */
  getCachedRawTransactions(): CreditTransaction[] | null {
    const cached = this.transactionCache.get('raw');
    
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.transactionCache.delete('raw');
      return null;
    }
    
    return cached.data;
  }

  /**
   * Invalidate balance cache (call when balance changes)
   */
  invalidateBalance(): void {
    this.balanceCache = null;
  }

  /**
   * Invalidate transaction caches (call when transactions change)
   */
  invalidateTransactions(): void {
    this.transactionCache.clear();
    this.filteredTransactionCache.clear();
  }

  /**
   * Invalidate all caches
   */
  invalidateAll(): void {
    this.invalidateBalance();
    this.invalidateTransactions();
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    balanceCached: boolean;
    transactionCacheSize: number;
    filteredCacheSize: number;
    memoryUsage: number;
  } {
    return {
      balanceCached: this.balanceCache !== null,
      transactionCacheSize: this.transactionCache.size,
      filteredCacheSize: this.filteredTransactionCache.size,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Preload commonly used transaction filters
   */
  async preloadCommonFilters(allTransactions: CreditTransaction[]): Promise<void> {
    const commonFilters: TransactionFilter[] = ['all', 'recharges', 'expenses'];
    
    for (const filter of commonFilters) {
      const filtered = this.filterTransactions(allTransactions, filter);
      this.setCachedTransactions(filtered, filter);
    }
  }

  /**
   * Efficient transaction filtering with optimizations
   */
  filterTransactions(
    transactions: CreditTransaction[], 
    filter: TransactionFilter
  ): CreditTransaction[] {
    if (filter === 'all') {
      return transactions.slice().sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    // Use optimized filtering based on transaction type
    let filtered: CreditTransaction[];
    
    switch (filter) {
      case 'recharges':
        filtered = transactions.filter(t => t.type === 'addition');
        break;
      case 'expenses':
        filtered = transactions.filter(t => t.type === 'deduction');
        break;
      case 'penalties':
        filtered = transactions.filter(t => t.type === 'penalty');
        break;
      default:
        filtered = transactions;
    }

    // Sort by timestamp (newest first) - optimized for display
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Paginate transactions for large datasets
   */
  paginateTransactions(
    transactions: CreditTransaction[],
    limit: number = 20,
    offset: number = 0
  ): {
    data: CreditTransaction[];
    hasMore: boolean;
    total: number;
  } {
    const total = transactions.length;
    const start = offset;
    const end = Math.min(start + limit, total);
    
    return {
      data: transactions.slice(start, end),
      hasMore: end < total,
      total,
    };
  }

  private generateTransactionCacheKey(params: TransactionCacheKey): string {
    return `${params.filter}_${params.limit || 'all'}_${params.offset || 0}`;
  }

  private getOldestCacheKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.filteredTransactionCache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private estimateMemoryUsage(): number {
    let size = 0;
    
    // Estimate balance cache size
    if (this.balanceCache) {
      size += JSON.stringify(this.balanceCache.data).length;
    }
    
    // Estimate transaction cache size
    for (const entry of this.transactionCache.values()) {
      size += JSON.stringify(entry.data).length;
    }
    
    for (const entry of this.filteredTransactionCache.values()) {
      size += JSON.stringify(entry.data).length;
    }
    
    return size;
  }
}

// Export singleton instance
export const creditCacheService = CreditCacheService.getInstance();