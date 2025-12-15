import { PaymentService as IPaymentService, PaymentResult, PaymentMethod } from '../types';
import { creditErrorHandler } from './creditErrorHandler';
import { creditRetryManager } from './creditRetryManager';

export class PaymentService implements IPaymentService {
  private static instance: PaymentService;

  private constructor() {}

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Get available payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    // In a real implementation, this would fetch from server or device capabilities
    return [
      {
        id: 'upi',
        name: 'UPI',
        type: 'upi',
        isDefault: true,
      },
      {
        id: 'card',
        name: 'Credit/Debit Card',
        type: 'card',
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        type: 'netbanking',
      },
      {
        id: 'wallet',
        name: 'Digital Wallet',
        type: 'wallet',
      },
    ];
  }

  /**
   * Initiate payment for credit purchase
   */
  async initiatePayment(amount: number, credits: number): Promise<PaymentResult> {
    // Validate input parameters
    const paymentValidation = creditErrorHandler.validatePaymentAmount(amount);
    if (!paymentValidation.isValid) {
      const error = paymentValidation.errors[0];
      creditErrorHandler.logError(error, { amount, credits });
      return {
        success: false,
        error: error.userMessage,
      };
    }

    const creditValidation = creditErrorHandler.validateCreditAmount(credits);
    if (!creditValidation.isValid) {
      const error = creditValidation.errors[0];
      creditErrorHandler.logError(error, { amount, credits });
      return {
        success: false,
        error: error.userMessage,
      };
    }

    try {
      return await creditRetryManager.executeWithRetry(
        async () => {
          try {
            // Generate unique transaction ID
            const transactionId = this.generateTransactionId();

            // Simulate payment processing delay
            await this.simulatePaymentDelay();

            // Mock payment gateway integration
            const paymentResult = await this.processPaymentWithGateway(amount, transactionId);

            if (paymentResult.success) {
              return {
                success: true,
                transactionId: transactionId,
                amount: amount,
              };
            } else {
              const paymentError = await creditErrorHandler.handlePaymentError(
                new Error(paymentResult.error || 'Payment processing failed'), 
                amount
              );
              creditErrorHandler.logError(paymentError, { amount, credits, transactionId });
              
              return {
                success: false,
                error: paymentError.userMessage,
              };
            }
          } catch (error) {
            const paymentError = await creditErrorHandler.handlePaymentError(error, amount);
            creditErrorHandler.logError(paymentError, { amount, credits });
            throw error;
          }
        },
        'initiate_payment',
        creditRetryManager.getConfigForOperation('payment_verification')
      );
    } catch (error) {
      console.error('Payment initiation failed:', error);
      return {
        success: false,
        error: 'Unable to initiate payment. Please try again.',
      };
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(transactionId: string): Promise<boolean> {
    // Validate transaction ID
    const validation = creditErrorHandler.validateTransactionId(transactionId);
    if (!validation.isValid) {
      const error = validation.errors[0];
      creditErrorHandler.logError(error, { transactionId });
      return false;
    }

    try {
      return await creditRetryManager.executeWithRetry(
        async () => {
          try {
            // Simulate verification delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock verification logic
            // In a real implementation, this would call the payment gateway's verification API
            const isValid = this.validateTransactionId(transactionId);
            
            if (!isValid) {
              return false;
            }

            // Simulate random verification result for demo purposes
            // In production, this would be based on actual gateway response
            const verificationSuccess = Math.random() > 0.1; // 90% success rate for demo

            return verificationSuccess;
          } catch (error) {
            const paymentError = await creditErrorHandler.handlePaymentError(error, 0);
            creditErrorHandler.logError(paymentError, { transactionId });
            throw error;
          }
        },
        'verify_payment',
        creditRetryManager.getConfigForOperation('payment_verification')
      );
    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
    }
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    return `TXN_${timestamp}_${randomSuffix}`;
  }

  /**
   * Validate transaction ID format
   */
  private validateTransactionId(transactionId: string): boolean {
    // Check if transaction ID follows expected format
    const pattern = /^TXN_\d+_[a-z0-9]+$/;
    return pattern.test(transactionId);
  }

  /**
   * Simulate payment processing delay
   */
  private async simulatePaymentDelay(): Promise<void> {
    // Simulate realistic payment processing time (2-5 seconds)
    const delay = Math.random() * 3000 + 2000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Mock payment gateway integration
   */
  private async processPaymentWithGateway(
    amount: number, 
    transactionId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock payment gateway request - in production, this would be sent to payment gateway

      // Simulate gateway processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock different failure scenarios for testing
      const randomFactor = Math.random();
      
      if (randomFactor < 0.05) {
        // 5% chance of network error
        throw new Error('Network timeout');
      } else if (randomFactor < 0.1) {
        // 5% chance of insufficient funds
        return {
          success: false,
          error: 'Insufficient funds in payment method',
        };
      } else if (randomFactor < 0.15) {
        // 5% chance of card declined
        return {
          success: false,
          error: 'Payment method declined by bank',
        };
      } else if (randomFactor < 0.2) {
        // 5% chance of gateway error
        return {
          success: false,
          error: 'Payment gateway temporarily unavailable',
        };
      }

      // 80% success rate
      return {
        success: true,
      };
    } catch (error) {
      console.error('Gateway processing error:', error);
      return {
        success: false,
        error: 'Payment gateway error. Please try again.',
      };
    }
  }

  /**
   * Handle payment cancellation
   */
  async cancelPayment(transactionId: string): Promise<boolean> {
    try {
      if (!this.validateTransactionId(transactionId)) {
        return false;
      }

      // Mock cancellation request to gateway
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real implementation, this would call the gateway's cancellation API
      console.log(`Payment cancelled for transaction: ${transactionId}`);
      
      return true;
    } catch (error) {
      console.error('Payment cancellation failed:', error);
      return false;
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transactionId: string): Promise<'pending' | 'success' | 'failed' | 'cancelled'> {
    try {
      if (!this.validateTransactionId(transactionId)) {
        return 'failed';
      }

      // Mock status check
      await new Promise(resolve => setTimeout(resolve, 500));

      // In a real implementation, this would query the gateway
      const isVerified = await this.verifyPayment(transactionId);
      
      return isVerified ? 'success' : 'failed';
    } catch (error) {
      console.error('Status check failed:', error);
      return 'failed';
    }
  }

  /**
   * Process refund (for future use)
   */
  async processRefund(transactionId: string, amount: number): Promise<PaymentResult> {
    try {
      if (!this.validateTransactionId(transactionId) || amount <= 0) {
        return {
          success: false,
          error: 'Invalid transaction ID or refund amount',
        };
      }

      // Mock refund processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const refundId = this.generateTransactionId();

      // Simulate 95% success rate for refunds
      const success = Math.random() > 0.05;

      if (success) {
        return {
          success: true,
          transactionId: refundId,
          amount: amount,
        };
      } else {
        return {
          success: false,
          error: 'Refund processing failed. Please contact support.',
        };
      }
    } catch (error) {
      console.error('Refund processing failed:', error);
      return {
        success: false,
        error: 'Unable to process refund. Please try again.',
      };
    }
  }
}

// Export singleton instance
export const paymentService = PaymentService.getInstance();