import { CreditTransaction } from '../types';

export type NotificationType = 'low_balance' | 'critical_balance' | 'recharge_success' | 'insufficient_credit_booking';

export interface CreditNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  data?: {
    balance?: number;
    requiredCredits?: number;
    bookingId?: string;
    creditsAdded?: number;
    transactionId?: string;
  };
}

export interface NotificationPreferences {
  lowBalanceEnabled: boolean;
  criticalBalanceEnabled: boolean;
  rechargeSuccessEnabled: boolean;
  insufficientCreditEnabled: boolean;
  lowBalanceThreshold: number; // Default: 10 credits
  criticalBalanceThreshold: number; // Default: 0 credits
}

export class CreditNotificationService {
  private static instance: CreditNotificationService;
  private preferences: NotificationPreferences;
  private onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;

  private constructor() {
    // Default notification preferences
    this.preferences = {
      lowBalanceEnabled: true,
      criticalBalanceEnabled: true,
      rechargeSuccessEnabled: true,
      insufficientCreditEnabled: true,
      lowBalanceThreshold: 10,
      criticalBalanceThreshold: 0,
    };
  }

  static getInstance(): CreditNotificationService {
    if (!CreditNotificationService.instance) {
      CreditNotificationService.instance = new CreditNotificationService();
    }
    return CreditNotificationService.instance;
  }

  /**
   * Set the toast notification handler
   */
  setToastHandler(handler: (message: string, type: 'success' | 'error' | 'info') => void): void {
    this.onShowToast = handler;
  }

  /**
   * Update notification preferences
   */
  updatePreferences(newPreferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences };
  }

  /**
   * Get current notification preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Check and show low balance notification
   */
  checkLowBalance(currentBalance: number): void {
    if (!this.preferences.lowBalanceEnabled || !this.onShowToast) {
      return;
    }

    if (currentBalance <= this.preferences.criticalBalanceThreshold && this.preferences.criticalBalanceEnabled) {
      // Critical balance (zero credits)
      this.showCriticalBalanceAlert(currentBalance);
    } else if (currentBalance <= this.preferences.lowBalanceThreshold) {
      // Low balance warning
      this.showLowBalanceNotification(currentBalance);
    }
  }

  /**
   * Show low balance notification (below 10 credits)
   */
  private showLowBalanceNotification(balance: number): void {
    if (!this.onShowToast) return;

    const message = `Low credit balance: ${balance} credits remaining. Consider recharging soon.`;
    this.onShowToast(message, 'info');
  }

  /**
   * Show critical balance alert (zero credits)
   */
  private showCriticalBalanceAlert(balance: number): void {
    if (!this.onShowToast) return;

    const message = balance === 0 
      ? 'Critical: No credits remaining! Recharge now to accept bookings.'
      : `Critical: Only ${balance} credits remaining! Recharge immediately.`;
    this.onShowToast(message, 'error');
  }

  /**
   * Show recharge success confirmation notification
   */
  showRechargeSuccess(creditsAdded: number, newBalance: number, transactionId: string): void {
    if (!this.preferences.rechargeSuccessEnabled || !this.onShowToast) {
      return;
    }

    const message = `Recharge successful! Added ${creditsAdded} credits. New balance: ${newBalance}`;
    this.onShowToast(message, 'success');
  }

  /**
   * Show insufficient credit booking prompt
   */
  showInsufficientCreditPrompt(requiredCredits: number, currentBalance: number, bookingId: string): void {
    if (!this.preferences.insufficientCreditEnabled || !this.onShowToast) {
      return;
    }

    const shortfall = requiredCredits - currentBalance;
    const message = `Insufficient credits! Need ${requiredCredits} credits (${shortfall} more) for this booking.`;
    this.onShowToast(message, 'error');
  }

  /**
   * Show booking acceptance success notification
   */
  showBookingAcceptanceSuccess(customerName: string, creditsDeducted: number, remainingBalance: number): void {
    if (!this.onShowToast) return;

    const message = `Booking accepted! Navigating to ${customerName}. ${creditsDeducted} credits deducted.`;
    this.onShowToast(message, 'success');

    // Check if balance is now low after deduction
    setTimeout(() => {
      this.checkLowBalance(remainingBalance);
    }, 2000); // Show low balance warning 2 seconds after booking acceptance
  }

  /**
   * Show penalty notification
   */
  showPenaltyNotification(amount: number, reason: string, remainingBalance: number): void {
    if (!this.onShowToast) return;

    const message = `Penalty applied: ${amount} credits deducted for ${reason}. Balance: ${remainingBalance}`;
    this.onShowToast(message, 'error');

    // Check if balance is now low after penalty
    setTimeout(() => {
      this.checkLowBalance(remainingBalance);
    }, 1000);
  }

  /**
   * Show general credit operation error
   */
  showCreditError(operation: string, error?: string): void {
    if (!this.onShowToast) return;

    const message = error || `Failed to ${operation}. Please try again.`;
    this.onShowToast(message, 'error');
  }

  /**
   * Show general credit operation success
   */
  showCreditSuccess(message: string): void {
    if (!this.onShowToast) return;

    this.onShowToast(message, 'success');
  }

  /**
   * Create notification object (for future use with notification history)
   */
  private createNotification(
    type: NotificationType,
    title: string,
    message: string,
    data?: CreditNotification['data']
  ): CreditNotification {
    return {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: new Date(),
      data,
    };
  }

  /**
   * Handle balance change and trigger appropriate notifications
   */
  handleBalanceChange(oldBalance: number, newBalance: number, transaction?: CreditTransaction): void {
    // Check for low balance after any balance change
    this.checkLowBalance(newBalance);

    // Handle specific transaction types
    if (transaction) {
      switch (transaction.type) {
        case 'addition':
          if (transaction.paymentTransactionId) {
            // This was a recharge
            this.showRechargeSuccess(
              transaction.amount,
              newBalance,
              transaction.paymentTransactionId
            );
          }
          break;
        case 'penalty':
          this.showPenaltyNotification(
            transaction.amount,
            transaction.description.replace('Penalty: ', ''),
            newBalance
          );
          break;
        // Deduction notifications are handled separately in booking flow
      }
    }
  }
}

// Export singleton instance
export const creditNotificationService = CreditNotificationService.getInstance();