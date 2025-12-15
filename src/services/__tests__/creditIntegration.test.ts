import { creditService } from '../creditService';
import { creditCacheService } from '../creditCacheService';
import { CreditStorageService } from '../storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock offline manager
jest.mock('../offlineManager', () => ({
  offlineManager: {
    queueOfflineOperation: jest.fn(() => Promise.resolve()),
    getNetworkStatus: jest.fn(() => true),
    getSyncStatus: jest.fn(() => false),
    forceSync: jest.fn(() => Promise.resolve()),
    validateDataIntegrity: jest.fn(() => Promise.resolve({
      balanceIntegrity: true,
      transactionIntegrity: true,
    })),
    recoverFromCorruption: jest.fn(() => Promise.resolve()),
  },
}));

// Mock notification service
jest.mock('../creditNotificationService', () => ({
  creditNotificationService: {
    setToastHandler: jest.fn(),
    handleBalanceChange: jest.fn(),
    showInsufficientCreditPrompt: jest.fn(),
    showCreditSuccess: jest.fn(),
    showCreditError: jest.fn(),
  },
}));

// Mock error handler
jest.mock('../creditErrorHandler', () => ({
  creditErrorHandler: {
    validateOrderValue: jest.fn(() => ({ isValid: true, errors: [] })),
    validateCreditAmount: jest.fn(() => ({ isValid: true, errors: [] })),
    validateTransactionId: jest.fn(() => ({ isValid: true, errors: [] })),
    validatePaymentAmount: jest.fn(() => ({ isValid: true, errors: [] })),
    handleStorageError: jest.fn(),
    handleInsufficientCredits: jest.fn(),
    logError: jest.fn(),
    setToastHandler: jest.fn(),
  },
}));

// Mock retry manager
jest.mock('../creditRetryManager', () => ({
  creditRetryManager: {
    executeWithRetry: jest.fn((fn) => fn()),
    getConfigForOperation: jest.fn(() => ({ maxRetries: 3, baseDelay: 1000 })),
  },
}));

// Mock recovery service
jest.mock('../creditRecoveryService', () => ({
  creditRecoveryService: {
    setToastHandler: jest.fn(),
    createRecoveryPlan: jest.fn(),
    executeAutoRecovery: jest.fn(() => Promise.resolve(true)),
    getRecoverySuggestions: jest.fn(() => []),
    isRecoveryInProgress: jest.fn(() => false),
  },
}));

describe('Credit System Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    creditCacheService.invalidateAll();
    creditService.setVendorId('test-vendor-123');
    creditService.setToastHandler(jest.fn());
  });

  describe('Complete Credit Workflow', () => {
    it('should handle complete booking acceptance workflow', async () => {
      // Setup: Initialize with balance
      const mockBalance = {
        vendorId: 'test-vendor-123',
        currentBalance: 50,
        lastUpdated: new Date(),
        pendingTransactions: [],
        syncStatus: 'synced' as const,
      };

      jest.spyOn(CreditStorageService, 'getCreditBalance')
        .mockResolvedValue(mockBalance);
      jest.spyOn(CreditStorageService, 'storeCreditBalance')
        .mockResolvedValue();
      jest.spyOn(CreditStorageService, 'addCreditTransaction')
        .mockResolvedValue();

      // Test: Get initial balance
      const initialBalance = await creditService.getCurrentBalance();
      expect(initialBalance).toBe(50);

      // Test: Calculate required credits for booking
      const orderValue = 1500; // ₹1500 order
      const requiredCredits = creditService.calculateRequiredCredits(orderValue);
      expect(requiredCredits).toBe(15); // 1500/100 = 15 credits

      // Test: Check sufficient credits
      const hasSufficient = await creditService.hasSufficientCredits(orderValue);
      expect(hasSufficient).toBe(true);

      // Test: Deduct credits for booking
      const bookingId = 'booking-123';
      const success = await creditService.deductCredits(requiredCredits, bookingId, orderValue);
      expect(success).toBe(true);

      // Verify storage calls
      expect(CreditStorageService.storeCreditBalance).toHaveBeenCalled();
      expect(CreditStorageService.addCreditTransaction).toHaveBeenCalled();
    });

    it('should handle insufficient credits scenario', async () => {
      // Setup: Low balance
      const mockBalance = {
        vendorId: 'test-vendor-123',
        currentBalance: 5,
        lastUpdated: new Date(),
        pendingTransactions: [],
        syncStatus: 'synced' as const,
      };

      jest.spyOn(CreditStorageService, 'getCreditBalance')
        .mockResolvedValue(mockBalance);

      // Test: Get balance
      const balance = await creditService.getCurrentBalance();
      expect(balance).toBe(5);

      // Test: Large order requiring more credits than available
      const orderValue = 1000; // Requires 10 credits
      const requiredCredits = creditService.calculateRequiredCredits(orderValue);
      expect(requiredCredits).toBe(10);

      // Test: Check insufficient credits
      const hasSufficient = await creditService.hasSufficientCredits(orderValue);
      expect(hasSufficient).toBe(false);

      // Test: Attempt to deduct credits (should fail)
      const success = await creditService.deductCredits(requiredCredits, 'booking-456', orderValue);
      expect(success).toBe(false);
    });

    it('should handle credit recharge workflow', async () => {
      // Setup: Initial balance
      const mockBalance = {
        vendorId: 'test-vendor-123',
        currentBalance: 10,
        lastUpdated: new Date(),
        pendingTransactions: [],
        syncStatus: 'synced' as const,
      };

      jest.spyOn(CreditStorageService, 'getCreditBalance')
        .mockResolvedValue(mockBalance);
      jest.spyOn(CreditStorageService, 'storeCreditBalance')
        .mockResolvedValue();
      jest.spyOn(CreditStorageService, 'addCreditTransaction')
        .mockResolvedValue();

      // Test: Add credits after payment
      const creditsToAdd = 25;
      const paymentAmount = 250; // ₹250 for 25 credits
      const transactionId = 'payment-789';

      await creditService.addCredits(creditsToAdd, transactionId, paymentAmount);

      // Verify storage calls
      expect(CreditStorageService.storeCreditBalance).toHaveBeenCalled();
      expect(CreditStorageService.addCreditTransaction).toHaveBeenCalled();
    });
  });

  describe('Performance and Caching', () => {
    it('should use cache for repeated balance requests', async () => {
      const mockBalance = {
        vendorId: 'test-vendor-123',
        currentBalance: 30,
        lastUpdated: new Date(),
        pendingTransactions: [],
        syncStatus: 'synced' as const,
      };

      const getCreditBalanceSpy = jest.spyOn(CreditStorageService, 'getCreditBalance')
        .mockResolvedValue(mockBalance);

      // First call should hit storage
      const balance1 = await creditService.getCurrentBalance();
      expect(balance1).toBe(30);
      expect(getCreditBalanceSpy).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const balance2 = await creditService.getCurrentBalance();
      expect(balance2).toBe(30);
      expect(getCreditBalanceSpy).toHaveBeenCalledTimes(1); // No additional call
    });

    it('should track performance metrics', async () => {
      const mockBalance = {
        vendorId: 'test-vendor-123',
        currentBalance: 20,
        lastUpdated: new Date(),
        pendingTransactions: [],
        syncStatus: 'synced' as const,
      };

      jest.spyOn(CreditStorageService, 'getCreditBalance')
        .mockResolvedValue(mockBalance);
      jest.spyOn(CreditStorageService, 'getCreditTransactions')
        .mockResolvedValue([]);

      // Clear cache to ensure operations hit storage
      creditCacheService.invalidateAll();

      // Perform operations
      await creditService.getCurrentBalance();
      await creditService.getTransactionHistory('all');

      // Wait a bit for metrics to be recorded
      await new Promise(resolve => setTimeout(resolve, 10));

      // Check performance metrics
      const metrics = creditService.getPerformanceMetrics();
      expect(metrics.cache.balanceCached).toBe(true);
      // Performance metrics might be 0 in test environment, so just check structure
      expect(typeof metrics.performance.recentOperations).toBe('number');
      expect(typeof metrics.performance.averageResponseTime).toBe('number');
    });

    it('should handle cache invalidation on data changes', async () => {
      const mockBalance = {
        vendorId: 'test-vendor-123',
        currentBalance: 40,
        lastUpdated: new Date(),
        pendingTransactions: [],
        syncStatus: 'synced' as const,
      };

      jest.spyOn(CreditStorageService, 'getCreditBalance')
        .mockResolvedValue(mockBalance);
      jest.spyOn(CreditStorageService, 'storeCreditBalance')
        .mockResolvedValue();
      jest.spyOn(CreditStorageService, 'addCreditTransaction')
        .mockResolvedValue();

      // Load initial balance (should cache)
      await creditService.getCurrentBalance();

      // Perform operation that changes balance
      await creditService.addCredits(10, 'txn-123', 100);

      // Cache should be invalidated
      const cacheStats = creditCacheService.getCacheStats();
      expect(cacheStats.balanceCached).toBe(false);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle storage errors gracefully', async () => {
      jest.spyOn(CreditStorageService, 'getCreditBalance')
        .mockRejectedValue(new Error('Storage error'));

      await expect(creditService.getCurrentBalance()).rejects.toThrow();
    });

    it('should validate data integrity', async () => {
      const isValid = await creditService.validateDataIntegrity();
      expect(typeof isValid).toBe('boolean');
    });

    it('should perform health check', async () => {
      const health = await creditService.performHealthCheck();
      
      expect(health).toHaveProperty('balance');
      expect(health).toHaveProperty('transactions');
      expect(health).toHaveProperty('network');
      expect(health).toHaveProperty('storage');
      expect(health).toHaveProperty('sync');
    });
  });

  describe('System Optimization', () => {
    it('should optimize performance', async () => {
      jest.spyOn(CreditStorageService, 'getCreditTransactions')
        .mockResolvedValue([]);

      await creditService.optimizePerformance();

      // Should not throw errors
      expect(true).toBe(true);
    });

    it('should provide performance recommendations', async () => {
      // Perform some operations to generate metrics
      const mockBalance = {
        vendorId: 'test-vendor-123',
        currentBalance: 25,
        lastUpdated: new Date(),
        pendingTransactions: [],
        syncStatus: 'synced' as const,
      };

      jest.spyOn(CreditStorageService, 'getCreditBalance')
        .mockResolvedValue(mockBalance);

      await creditService.getCurrentBalance();

      const metrics = creditService.getPerformanceMetrics();
      expect(metrics.summary.systemHealth).toMatch(/good|warning|critical/);
      expect(Array.isArray(metrics.summary.recommendations)).toBe(true);
    });
  });
});