import { creditService } from './creditService';
import { paymentService } from './paymentService';
import { PaymentResult } from '../types';

export interface CreditRechargeResult {
  success: boolean;
  transactionId?: string;
  creditsAdded?: number;
  newBalance?: number;
  error?: string;
}

export class CreditRechargeService {
  private static instance: CreditRechargeService;

  private constructor() {}

  static getInstance(): CreditRechargeService {
    if (!CreditRechargeService.instance) {
      CreditRechargeService.instance = new CreditRechargeService();
    }
    return CreditRechargeService.instance;
  }

  /**
   * Process credit recharge with payment integration
   */
  async processRecharge(paymentAmount: number, credits: number): Promise<CreditRechargeResult> {
    try {
      // Validate input parameters
      if (paymentAmount <= 0 || credits <= 0) {
        return {
          success: false,
          error: 'Invalid payment amount or credit count',
        };
      }

      // Validate cost calculation (₹10 per credit)
      const expectedCost = credits * 10;
      if (Math.abs(paymentAmount - expectedCost) > 0.01) {
        return {
          success: false,
          error: 'Payment amount does not match credit cost',
        };
      }

      // Initiate payment
      const paymentResult: PaymentResult = await paymentService.initiatePayment(
        paymentAmount, 
        credits
      );

      if (!paymentResult.success) {
        return {
          success: false,
          error: paymentResult.error || 'Payment failed',
        };
      }

      // Verify payment
      const isPaymentVerified = await paymentService.verifyPayment(
        paymentResult.transactionId!
      );

      if (!isPaymentVerified) {
        return {
          success: false,
          error: 'Payment verification failed',
        };
      }

      // Add credits to account
      await creditService.addCredits(
        credits,
        paymentResult.transactionId!,
        paymentAmount
      );

      // Get new balance
      const newBalance = await creditService.getCurrentBalance();

      return {
        success: true,
        transactionId: paymentResult.transactionId,
        creditsAdded: credits,
        newBalance: newBalance,
      };

    } catch (error) {
      console.error('Credit recharge failed:', error);
      return {
        success: false,
        error: 'Unable to process recharge. Please try again.',
      };
    }
  }

  /**
   * Calculate credit cost
   */
  calculateCreditCost(credits: number): number {
    return credits * 10; // ₹10 per credit
  }

  /**
   * Validate credit purchase limits
   */
  validateCreditPurchase(credits: number): { valid: boolean; error?: string } {
    if (credits <= 0) {
      return {
        valid: false,
        error: 'Credit amount must be greater than zero',
      };
    }

    if (credits > 1000) {
      return {
        valid: false,
        error: 'Maximum 1000 credits can be purchased at once',
      };
    }

    const cost = this.calculateCreditCost(credits);
    if (cost > 50000) {
      return {
        valid: false,
        error: 'Payment amount exceeds maximum limit of ₹50,000',
      };
    }

    return { valid: true };
  }

  /**
   * Get available payment methods
   */
  async getPaymentMethods() {
    return await paymentService.getPaymentMethods();
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(transactionId: string) {
    return await paymentService.getPaymentStatus(transactionId);
  }
}

// Export singleton instance
export const creditRechargeService = CreditRechargeService.getInstance();