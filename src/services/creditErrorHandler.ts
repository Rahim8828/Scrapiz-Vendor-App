// import { creditNotificationService } from './creditNotificationService';

export enum CreditErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  PAYMENT_ERROR = 'PAYMENT_ERROR',
  SYNC_ERROR = 'SYNC_ERROR',
  DATA_CORRUPTION = 'DATA_CORRUPTION',
  INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
}

export interface CreditError {
  type: CreditErrorType;
  message: string;
  code: string;
  details?: any;
  recoverable: boolean;
  userMessage: string;
  suggestedAction?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: CreditError[];
}

export interface RecoveryOptions {
  retry: boolean;
  fallback: boolean;
  userIntervention: boolean;
  dataRecovery: boolean;
}

export class CreditErrorHandler {
  private static instance: CreditErrorHandler;
  private toastHandler?: (message: string, type: 'success' | 'error' | 'info') => void;

  private constructor() {}

  static getInstance(): CreditErrorHandler {
    if (!CreditErrorHandler.instance) {
      CreditErrorHandler.instance = new CreditErrorHandler();
    }
    return CreditErrorHandler.instance;
  }

  setToastHandler(handler: (message: string, type: 'success' | 'error' | 'info') => void): void {
    this.toastHandler = handler;
  }

  /**
   * Validate order value for credit calculation
   */
  validateOrderValue(orderValue: number): ValidationResult {
    const errors: CreditError[] = [];

    if (typeof orderValue !== 'number') {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Order value must be a number',
        'INVALID_ORDER_VALUE_TYPE',
        { orderValue },
        'Please enter a valid order amount'
      ));
    } else if (isNaN(orderValue)) {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Order value is not a valid number',
        'ORDER_VALUE_NAN',
        { orderValue },
        'Please enter a valid order amount'
      ));
    } else if (orderValue < 0) {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Order value cannot be negative',
        'NEGATIVE_ORDER_VALUE',
        { orderValue },
        'Order amount must be positive'
      ));
    } else if (orderValue === 0) {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Order value cannot be zero',
        'ZERO_ORDER_VALUE',
        { orderValue },
        'Order amount must be greater than zero'
      ));
    } else if (orderValue > 1000000) {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Order value exceeds maximum limit',
        'ORDER_VALUE_TOO_HIGH',
        { orderValue, maxValue: 1000000 },
        'Order amount cannot exceed ₹10,00,000'
      ));
    } else if (!Number.isFinite(orderValue)) {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Order value must be a finite number',
        'ORDER_VALUE_NOT_FINITE',
        { orderValue },
        'Please enter a valid order amount'
      ));
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate credit amount for operations
   */
  validateCreditAmount(creditAmount: number): ValidationResult {
    const errors: CreditError[] = [];

    if (typeof creditAmount !== 'number') {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Credit amount must be a number',
        'INVALID_CREDIT_AMOUNT_TYPE',
        { creditAmount },
        'Please enter a valid credit amount'
      ));
    } else if (isNaN(creditAmount)) {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Credit amount is not a valid number',
        'CREDIT_AMOUNT_NAN',
        { creditAmount },
        'Please enter a valid credit amount'
      ));
    } else if (creditAmount < 0) {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Credit amount cannot be negative',
        'NEGATIVE_CREDIT_AMOUNT',
        { creditAmount },
        'Credit amount must be positive'
      ));
    } else if (creditAmount === 0) {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Credit amount cannot be zero',
        'ZERO_CREDIT_AMOUNT',
        { creditAmount },
        'Credit amount must be greater than zero'
      ));
    } else if (creditAmount > 10000) {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Credit amount exceeds maximum limit',
        'CREDIT_AMOUNT_TOO_HIGH',
        { creditAmount, maxValue: 10000 },
        'Credit amount cannot exceed 10,000 credits'
      ));
    } else if (!Number.isInteger(creditAmount)) {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Credit amount must be a whole number',
        'CREDIT_AMOUNT_NOT_INTEGER',
        { creditAmount },
        'Credit amount must be a whole number'
      ));
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate payment amount
   */
  validatePaymentAmount(paymentAmount: number): ValidationResult {
    const errors: CreditError[] = [];

    if (typeof paymentAmount !== 'number') {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Payment amount must be a number',
        'INVALID_PAYMENT_AMOUNT_TYPE',
        { paymentAmount },
        'Please enter a valid payment amount'
      ));
    } else if (isNaN(paymentAmount)) {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Payment amount is not a valid number',
        'PAYMENT_AMOUNT_NAN',
        { paymentAmount },
        'Please enter a valid payment amount'
      ));
    } else if (paymentAmount <= 0) {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Payment amount must be positive',
        'INVALID_PAYMENT_AMOUNT',
        { paymentAmount },
        'Payment amount must be greater than zero'
      ));
    } else if (paymentAmount < 10) {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Payment amount below minimum',
        'PAYMENT_AMOUNT_TOO_LOW',
        { paymentAmount, minValue: 10 },
        'Minimum payment amount is ₹10'
      ));
    } else if (paymentAmount > 50000) {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Payment amount exceeds maximum limit',
        'PAYMENT_AMOUNT_TOO_HIGH',
        { paymentAmount, maxValue: 50000 },
        'Maximum payment amount is ₹50,000'
      ));
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate transaction ID format
   */
  validateTransactionId(transactionId: string): ValidationResult {
    const errors: CreditError[] = [];

    if (typeof transactionId !== 'string') {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Transaction ID must be a string',
        'INVALID_TRANSACTION_ID_TYPE',
        { transactionId },
        'Invalid transaction ID format'
      ));
    } else if (!transactionId || transactionId.trim() === '') {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Transaction ID cannot be empty',
        'EMPTY_TRANSACTION_ID',
        { transactionId },
        'Transaction ID is required'
      ));
    } else if (transactionId.length < 5) {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Transaction ID too short',
        'TRANSACTION_ID_TOO_SHORT',
        { transactionId, minLength: 5 },
        'Invalid transaction ID format'
      ));
    } else if (transactionId.length > 100) {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Transaction ID too long',
        'TRANSACTION_ID_TOO_LONG',
        { transactionId, maxLength: 100 },
        'Invalid transaction ID format'
      ));
    } else if (!/^[a-zA-Z0-9_-]+$/.test(transactionId)) {
      errors.push(this.createError(
        CreditErrorType.VALIDATION_ERROR,
        'Transaction ID contains invalid characters',
        'INVALID_TRANSACTION_ID_FORMAT',
        { transactionId },
        'Transaction ID contains invalid characters'
      ));
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Handle network errors with retry logic
   */
  async handleNetworkError(
    error: any,
    operation: string,
    retryCount: number = 0,
    maxRetries: number = 3
  ): Promise<CreditError> {
    const networkError = this.createError(
      CreditErrorType.NETWORK_ERROR,
      `Network error during ${operation}`,
      'NETWORK_FAILURE',
      { error: error.message, retryCount, maxRetries },
      'Network connection failed. Please check your internet connection.',
      retryCount < maxRetries ? 'Tap to retry' : 'Please try again later'
    );

    // Show user-friendly message
    if (this.toastHandler) {
      if (retryCount < maxRetries) {
        this.toastHandler('Network error. Retrying...', 'info');
      } else {
        this.toastHandler('Network error. Please check your connection.', 'error');
      }
    }

    return networkError;
  }

  /**
   * Handle storage errors with recovery options
   */
  async handleStorageError(error: any, operation: string): Promise<CreditError> {
    const storageError = this.createError(
      CreditErrorType.STORAGE_ERROR,
      `Storage error during ${operation}`,
      'STORAGE_FAILURE',
      { error: error.message },
      'Unable to save data. Please try again.',
      'Check device storage space'
    );

    if (this.toastHandler) {
      this.toastHandler('Storage error. Please try again.', 'error');
    }

    return storageError;
  }

  /**
   * Handle payment errors with specific recovery actions
   */
  async handlePaymentError(error: any, amount: number): Promise<CreditError> {
    let errorCode = 'PAYMENT_FAILURE';
    let userMessage = 'Payment failed. Please try again.';
    let suggestedAction = 'Try a different payment method';

    // Categorize payment errors
    if (error.message?.includes('insufficient')) {
      errorCode = 'INSUFFICIENT_FUNDS';
      userMessage = 'Insufficient funds in your account.';
      suggestedAction = 'Add funds to your account or try a different payment method';
    } else if (error.message?.includes('declined')) {
      errorCode = 'PAYMENT_DECLINED';
      userMessage = 'Payment was declined by your bank.';
      suggestedAction = 'Contact your bank or try a different payment method';
    } else if (error.message?.includes('timeout')) {
      errorCode = 'PAYMENT_TIMEOUT';
      userMessage = 'Payment timed out. Please try again.';
      suggestedAction = 'Check your internet connection and try again';
    } else if (error.message?.includes('gateway')) {
      errorCode = 'GATEWAY_ERROR';
      userMessage = 'Payment gateway is temporarily unavailable.';
      suggestedAction = 'Please try again in a few minutes';
    }

    const paymentError = this.createError(
      CreditErrorType.PAYMENT_ERROR,
      `Payment error for amount ₹${amount}`,
      errorCode,
      { error: error.message, amount },
      userMessage,
      suggestedAction
    );

    if (this.toastHandler) {
      this.toastHandler(userMessage, 'error');
    }

    return paymentError;
  }

  /**
   * Handle data corruption with recovery options
   */
  async handleDataCorruption(details: any): Promise<CreditError> {
    const corruptionError = this.createError(
      CreditErrorType.DATA_CORRUPTION,
      'Data corruption detected',
      'DATA_CORRUPTION',
      details,
      'Data corruption detected. Recovery is needed.',
      'Tap to recover data from server'
    );

    if (this.toastHandler) {
      this.toastHandler('Data corruption detected. Recovery available.', 'error');
    }

    return corruptionError;
  }

  /**
   * Handle insufficient credits error
   */
  async handleInsufficientCredits(
    required: number,
    available: number,
    bookingId?: string
  ): Promise<CreditError> {
    const insufficientError = this.createError(
      CreditErrorType.INSUFFICIENT_CREDITS,
      'Insufficient credits for booking',
      'INSUFFICIENT_CREDITS',
      { required, available, bookingId },
      `You need ${required} credits but only have ${available}.`,
      'Recharge credits to continue'
    );

    if (this.toastHandler) {
      this.toastHandler(`Insufficient credits. Need ${required}, have ${available}.`, 'error');
    }

    return insufficientError;
  }

  /**
   * Handle sync errors with recovery options
   */
  async handleSyncError(error: any, operation: string): Promise<CreditError> {
    const syncError = this.createError(
      CreditErrorType.SYNC_ERROR,
      `Sync error during ${operation}`,
      'SYNC_FAILURE',
      { error: error.message },
      'Unable to sync data with server.',
      'Data will sync when connection is restored'
    );

    if (this.toastHandler) {
      this.toastHandler('Sync failed. Will retry automatically.', 'info');
    }

    return syncError;
  }

  /**
   * Get recovery options for an error
   */
  getRecoveryOptions(error: CreditError): RecoveryOptions {
    switch (error.type) {
      case CreditErrorType.NETWORK_ERROR:
        return {
          retry: true,
          fallback: false,
          userIntervention: true,
          dataRecovery: false,
        };

      case CreditErrorType.PAYMENT_ERROR:
        return {
          retry: true,
          fallback: true, // Try different payment method
          userIntervention: true,
          dataRecovery: false,
        };

      case CreditErrorType.DATA_CORRUPTION:
        return {
          retry: false,
          fallback: false,
          userIntervention: true,
          dataRecovery: true,
        };

      case CreditErrorType.STORAGE_ERROR:
        return {
          retry: true,
          fallback: true, // Use memory cache
          userIntervention: true,
          dataRecovery: false,
        };

      case CreditErrorType.SYNC_ERROR:
        return {
          retry: true,
          fallback: true, // Continue offline
          userIntervention: false,
          dataRecovery: false,
        };

      case CreditErrorType.VALIDATION_ERROR:
        return {
          retry: false,
          fallback: false,
          userIntervention: true,
          dataRecovery: false,
        };

      case CreditErrorType.INSUFFICIENT_CREDITS:
        return {
          retry: false,
          fallback: true, // Redirect to recharge
          userIntervention: true,
          dataRecovery: false,
        };

      default:
        return {
          retry: true,
          fallback: false,
          userIntervention: true,
          dataRecovery: false,
        };
    }
  }

  /**
   * Create a standardized error object
   */
  private createError(
    type: CreditErrorType,
    message: string,
    code: string,
    details: any,
    userMessage: string,
    suggestedAction?: string
  ): CreditError {
    return {
      type,
      message,
      code,
      details,
      recoverable: this.isRecoverable(type),
      userMessage,
      suggestedAction,
    };
  }

  /**
   * Determine if an error type is recoverable
   */
  private isRecoverable(type: CreditErrorType): boolean {
    switch (type) {
      case CreditErrorType.NETWORK_ERROR:
      case CreditErrorType.PAYMENT_ERROR:
      case CreditErrorType.STORAGE_ERROR:
      case CreditErrorType.SYNC_ERROR:
      case CreditErrorType.DATA_CORRUPTION:
      case CreditErrorType.INSUFFICIENT_CREDITS:
        return true;
      
      case CreditErrorType.VALIDATION_ERROR:
      case CreditErrorType.SYSTEM_ERROR:
        return false;
      
      default:
        return false;
    }
  }

  /**
   * Log error for debugging and monitoring
   */
  logError(error: CreditError, context?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      error,
      context,
    };

    console.error('Credit System Error:', logEntry);

    // In production, this could send to error monitoring service
    // Example: Sentry, Bugsnag, etc.
  }
}

// Export singleton instance
export const creditErrorHandler = CreditErrorHandler.getInstance();