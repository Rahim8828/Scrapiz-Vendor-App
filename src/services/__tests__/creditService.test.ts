// Mock AsyncStorage before importing CreditService
import { CreditService } from '../creditService';
import * as fc from 'fast-check';

const mockStorage: { [key: string]: string } = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  getItem: jest.fn((key: string) => {
    return Promise.resolve(mockStorage[key] || null);
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
}));

describe('CreditService', () => {
  let creditService: CreditService;

  beforeEach(() => {
    creditService = CreditService.getInstance();
    // Clear all mocks and storage before each test
    jest.clearAllMocks();
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  });

  describe('calculateRequiredCredits', () => {
    it('should calculate credits correctly for various order values', () => {
      // Test basic calculation: 1 credit per ₹100
      expect(creditService.calculateRequiredCredits(100)).toBe(1);
      expect(creditService.calculateRequiredCredits(200)).toBe(2);
      expect(creditService.calculateRequiredCredits(300)).toBe(3);
      
      // Test rounding up for partial amounts
      expect(creditService.calculateRequiredCredits(150)).toBe(2);
      expect(creditService.calculateRequiredCredits(250)).toBe(3);
      expect(creditService.calculateRequiredCredits(99)).toBe(1);
      expect(creditService.calculateRequiredCredits(1)).toBe(1);
    });

    it('should throw validation errors for invalid order values', () => {
      // Test validation errors for invalid inputs
      expect(() => creditService.calculateRequiredCredits(0)).toThrow('Order amount must be greater than zero');
      expect(() => creditService.calculateRequiredCredits(-100)).toThrow('Order amount must be positive');
      expect(() => creditService.calculateRequiredCredits(NaN)).toThrow('Please enter a valid order amount');
      expect(() => creditService.calculateRequiredCredits(Infinity)).toThrow('Order amount cannot exceed ₹10,00,000');
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * **Feature: vendor-credit-system, Property 7: Successful credit addition**
     * **Validates: Requirements 3.4, 3.5**
     */
    it('should successfully add credits and create transaction record for any valid payment', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000 }), // credits to add (1-1000)
          fc.string({ minLength: 10, maxLength: 50 }).map(s => s.replace(/[^a-zA-Z0-9_-]/g, 'A')), // valid transaction ID
          fc.integer({ min: 10, max: 10000 }), // payment amount in rupees (10-10000)
          async (creditsToAdd: number, transactionId: string, paymentAmount: number) => {
            // Transaction ID should be valid by construction, but double-check
            expect(transactionId).toBeTruthy();
            expect(transactionId.length).toBeGreaterThanOrEqual(10);

            // Get initial balance
            const initialBalance = await creditService.getCurrentBalance();
            
            // Add credits
            await creditService.addCredits(creditsToAdd, transactionId, paymentAmount);
            
            // Verify balance increased by the correct amount
            const newBalance = await creditService.getCurrentBalance();
            expect(newBalance).toBe(initialBalance + creditsToAdd);
            
            // Verify transaction record was created
            const transactions = await creditService.getTransactionHistory();
            const additionTransactions = transactions.filter(t => 
              t.type === 'addition' && 
              t.amount === creditsToAdd &&
              t.paymentTransactionId === transactionId &&
              t.paymentAmount === paymentAmount
            );
            
            // Should have at least one matching transaction
            expect(additionTransactions.length).toBeGreaterThan(0);
            
            // Verify transaction has required fields
            const transaction = additionTransactions[0];
            expect(transaction.id).toBeDefined();
            expect(transaction.description).toContain(`₹${paymentAmount}`);
            expect(transaction.timestamp).toBeInstanceOf(Date);
            expect(transaction.status).toBe('completed');
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test error handling for invalid inputs
     */
    it('should handle validation errors gracefully', async () => {
      // Suppress console.error during validation tests to reduce noise
      const originalConsoleError = console.error;
      console.error = jest.fn();

      try {
        // Test invalid credit amount
        await expect(creditService.addCredits(-1, 'valid-txn-id', 100))
          .rejects.toThrow('Credit amount must be positive');

        // Test invalid payment amount
        await expect(creditService.addCredits(10, 'valid-txn-id', -100))
          .rejects.toThrow('Payment amount must be greater than zero');

        // Test invalid transaction ID
        await expect(creditService.addCredits(10, 'invalid@txn#id', 100))
          .rejects.toThrow('Transaction ID contains invalid characters');

        // Test empty transaction ID
        await expect(creditService.addCredits(10, '', 100))
          .rejects.toThrow('Transaction ID is required');
      } finally {
        // Restore console.error
        console.error = originalConsoleError;
      }
    });
  });
});