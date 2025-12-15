import { CreditError, CreditErrorType, creditErrorHandler } from './creditErrorHandler';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
  retryableErrors: CreditErrorType[];
}

export interface RetryOperation<T> {
  id: string;
  operation: () => Promise<T>;
  config: RetryConfig;
  context: string;
  onSuccess?: (result: T) => void;
  onFailure?: (error: CreditError) => void;
  onRetry?: (attempt: number, error: CreditError) => void;
}

export interface RetryAttempt {
  attempt: number;
  timestamp: Date;
  error?: CreditError;
  delay: number;
}

export class CreditRetryManager {
  private static instance: CreditRetryManager;
  private activeOperations = new Map<string, RetryOperation<any>>();
  private retryHistory = new Map<string, RetryAttempt[]>();

  private readonly DEFAULT_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: 2,
    retryableErrors: [
      CreditErrorType.NETWORK_ERROR,
      CreditErrorType.SYNC_ERROR,
      CreditErrorType.STORAGE_ERROR,
    ],
  };

  private constructor() {}

  static getInstance(): CreditRetryManager {
    if (!CreditRetryManager.instance) {
      CreditRetryManager.instance = new CreditRetryManager();
    }
    return CreditRetryManager.instance;
  }

  /**
   * Execute operation with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string,
    config?: Partial<RetryConfig>
  ): Promise<T> {
    const operationId = this.generateOperationId();
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    const retryOperation: RetryOperation<T> = {
      id: operationId,
      operation,
      config: finalConfig,
      context,
    };

    this.activeOperations.set(operationId, retryOperation);
    this.retryHistory.set(operationId, []);

    try {
      const result = await this.performOperation(retryOperation);
      this.activeOperations.delete(operationId);
      return result;
    } catch (error) {
      this.activeOperations.delete(operationId);
      throw error;
    }
  }

  /**
   * Execute operation with custom retry callbacks
   */
  async executeWithCallbacks<T>(
    operation: () => Promise<T>,
    context: string,
    callbacks: {
      onSuccess?: (result: T) => void;
      onFailure?: (error: CreditError) => void;
      onRetry?: (attempt: number, error: CreditError) => void;
    },
    config?: Partial<RetryConfig>
  ): Promise<T> {
    const operationId = this.generateOperationId();
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    const retryOperation: RetryOperation<T> = {
      id: operationId,
      operation,
      config: finalConfig,
      context,
      ...callbacks,
    };

    this.activeOperations.set(operationId, retryOperation);
    this.retryHistory.set(operationId, []);

    try {
      const result = await this.performOperation(retryOperation);
      this.activeOperations.delete(operationId);
      
      if (retryOperation.onSuccess) {
        retryOperation.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      this.activeOperations.delete(operationId);
      
      if (retryOperation.onFailure && error instanceof Error) {
        const creditError = await this.convertToCreditError(error, context);
        retryOperation.onFailure(creditError);
      }
      
      throw error;
    }
  }

  /**
   * Perform operation with retry logic
   */
  private async performOperation<T>(retryOperation: RetryOperation<T>): Promise<T> {
    const { id, operation, config, context } = retryOperation;
    let lastError: CreditError | null = null;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        // Record attempt
        const attemptRecord: RetryAttempt = {
          attempt,
          timestamp: new Date(),
          delay: attempt > 0 ? this.calculateDelay(attempt - 1, config) : 0,
        };

        this.addRetryAttempt(id, attemptRecord);

        // Wait for delay if this is a retry
        if (attempt > 0 && attemptRecord.delay > 0) {
          await this.delay(attemptRecord.delay);
        }

        // Execute operation
        const result = await operation();
        
        // Success - log if there were previous failures
        if (attempt > 0) {
          console.log(`Operation succeeded after ${attempt} retries: ${context}`);
        }
        
        return result;

      } catch (error) {
        const creditError = await this.convertToCreditError(error, context);
        lastError = creditError;

        // Update attempt record with error
        const attempts = this.retryHistory.get(id) || [];
        if (attempts.length > 0) {
          attempts[attempts.length - 1].error = creditError;
        }

        // Check if error is retryable
        if (!this.isRetryableError(creditError, config)) {
          console.error(`Non-retryable error in ${context}:`, creditError);
          throw error;
        }

        // Check if we've exhausted retries
        if (attempt >= config.maxRetries) {
          console.error(`Max retries exceeded for ${context}:`, creditError);
          break;
        }

        // Log retry attempt
        console.warn(`Retry ${attempt + 1}/${config.maxRetries} for ${context}:`, creditError.message);

        // Call retry callback
        if (retryOperation.onRetry) {
          retryOperation.onRetry(attempt + 1, creditError);
        }
      }
    }

    // All retries exhausted
    if (lastError) {
      throw new Error(lastError.message);
    } else {
      throw new Error(`Operation failed after ${config.maxRetries} retries: ${context}`);
    }
  }

  /**
   * Check if error is retryable based on configuration
   */
  private isRetryableError(error: CreditError, config: RetryConfig): boolean {
    return config.retryableErrors.includes(error.type);
  }

  /**
   * Calculate delay for retry attempt using exponential backoff
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
    return Math.min(delay, config.maxDelay);
  }

  /**
   * Add jitter to delay to prevent thundering herd
   */
  private addJitter(delay: number): number {
    const jitter = Math.random() * 0.1 * delay; // 10% jitter
    return delay + jitter;
  }

  /**
   * Convert generic error to CreditError
   */
  private async convertToCreditError(error: any, context: string): Promise<CreditError> {
    if (error.name === 'CreditError') {
      return error as CreditError;
    }

    // Categorize error based on message and context
    if (this.isNetworkError(error)) {
      return await creditErrorHandler.handleNetworkError(error, context);
    } else if (this.isStorageError(error)) {
      return await creditErrorHandler.handleStorageError(error, context);
    } else if (this.isPaymentError(error)) {
      return await creditErrorHandler.handlePaymentError(error, 0);
    } else {
      // Generic system error
      return {
        type: CreditErrorType.SYSTEM_ERROR,
        message: error.message || 'Unknown error',
        code: 'SYSTEM_ERROR',
        details: { error: error.message, context },
        recoverable: false,
        userMessage: 'An unexpected error occurred. Please try again.',
      };
    }
  }

  /**
   * Check if error is network-related
   */
  private isNetworkError(error: any): boolean {
    const networkKeywords = [
      'network', 'timeout', 'connection', 'fetch', 'request',
      'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET'
    ];
    
    const errorMessage = (error.message || '').toLowerCase();
    return networkKeywords.some(keyword => errorMessage.includes(keyword));
  }

  /**
   * Check if error is storage-related
   */
  private isStorageError(error: any): boolean {
    const storageKeywords = [
      'storage', 'asyncstorage', 'disk', 'quota', 'space',
      'ENOSPC', 'EMFILE', 'ENFILE'
    ];
    
    const errorMessage = (error.message || '').toLowerCase();
    return storageKeywords.some(keyword => errorMessage.includes(keyword));
  }

  /**
   * Check if error is payment-related
   */
  private isPaymentError(error: any): boolean {
    const paymentKeywords = [
      'payment', 'gateway', 'transaction', 'declined', 'insufficient',
      'card', 'bank', 'upi'
    ];
    
    const errorMessage = (error.message || '').toLowerCase();
    return paymentKeywords.some(keyword => errorMessage.includes(keyword));
  }

  /**
   * Create delay promise
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate unique operation ID
   */
  private generateOperationId(): string {
    return `retry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add retry attempt to history
   */
  private addRetryAttempt(operationId: string, attempt: RetryAttempt): void {
    const attempts = this.retryHistory.get(operationId) || [];
    attempts.push(attempt);
    this.retryHistory.set(operationId, attempts);
  }

  /**
   * Get retry history for operation
   */
  getRetryHistory(operationId: string): RetryAttempt[] {
    return this.retryHistory.get(operationId) || [];
  }

  /**
   * Get active operations count
   */
  getActiveOperationsCount(): number {
    return this.activeOperations.size;
  }

  /**
   * Cancel active operation
   */
  cancelOperation(operationId: string): boolean {
    return this.activeOperations.delete(operationId);
  }

  /**
   * Clear retry history (for cleanup)
   */
  clearHistory(): void {
    this.retryHistory.clear();
  }

  /**
   * Get retry configuration for specific operation types
   */
  getConfigForOperation(operationType: string): RetryConfig {
    switch (operationType) {
      case 'credit_deduction':
      case 'credit_addition':
        return {
          ...this.DEFAULT_CONFIG,
          maxRetries: 5, // More retries for critical operations
          baseDelay: 2000, // Longer initial delay
        };

      case 'balance_sync':
      case 'transaction_sync':
        return {
          ...this.DEFAULT_CONFIG,
          maxRetries: 3,
          baseDelay: 1000,
        };

      case 'payment_verification':
        return {
          ...this.DEFAULT_CONFIG,
          maxRetries: 2, // Fewer retries for payment operations
          baseDelay: 3000, // Longer delay for payment operations
          retryableErrors: [CreditErrorType.NETWORK_ERROR], // Only retry network errors
        };

      case 'data_recovery':
        return {
          ...this.DEFAULT_CONFIG,
          maxRetries: 1, // Single retry for recovery operations
          baseDelay: 5000,
          retryableErrors: [CreditErrorType.NETWORK_ERROR, CreditErrorType.SYNC_ERROR],
        };

      default:
        return this.DEFAULT_CONFIG;
    }
  }
}

// Export singleton instance
export const creditRetryManager = CreditRetryManager.getInstance();