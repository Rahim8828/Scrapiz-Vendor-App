import { CreditError, CreditErrorType } from './creditErrorHandler';
import { CreditStorageService } from './storage';
import { creditApiService } from './creditApiService';
import { offlineManager } from './offlineManager';
// import { creditNotificationService } from './creditNotificationService';

export interface RecoveryAction {
  id: string;
  type: 'retry' | 'fallback' | 'user_intervention' | 'data_recovery';
  description: string;
  execute: () => Promise<boolean>;
  userMessage: string;
}

export interface RecoveryPlan {
  error: CreditError;
  actions: RecoveryAction[];
  recommendedAction: RecoveryAction;
  canAutoRecover: boolean;
}

export class CreditRecoveryService {
  private static instance: CreditRecoveryService;
  private recoveryInProgress = new Set<string>();
  private toastHandler?: (message: string, type: 'success' | 'error' | 'info') => void;

  private constructor() {}

  static getInstance(): CreditRecoveryService {
    if (!CreditRecoveryService.instance) {
      CreditRecoveryService.instance = new CreditRecoveryService();
    }
    return CreditRecoveryService.instance;
  }

  setToastHandler(handler: (message: string, type: 'success' | 'error' | 'info') => void): void {
    this.toastHandler = handler;
  }

  /**
   * Create recovery plan for a given error
   */
  createRecoveryPlan(error: CreditError, context?: any): RecoveryPlan {
    const actions: RecoveryAction[] = [];
    let canAutoRecover = false;

    switch (error.type) {
      case CreditErrorType.NETWORK_ERROR:
        actions.push(this.createRetryAction(error, context));
        actions.push(this.createOfflineModeAction());
        canAutoRecover = true;
        break;

      case CreditErrorType.STORAGE_ERROR:
        actions.push(this.createRetryAction(error, context));
        actions.push(this.createClearCacheAction());
        actions.push(this.createDataRecoveryAction());
        canAutoRecover = false;
        break;

      case CreditErrorType.PAYMENT_ERROR:
        actions.push(this.createRetryPaymentAction(error, context));
        actions.push(this.createAlternativePaymentAction());
        canAutoRecover = false;
        break;

      case CreditErrorType.DATA_CORRUPTION:
        actions.push(this.createDataRecoveryAction());
        actions.push(this.createResetDataAction());
        canAutoRecover = false;
        break;

      case CreditErrorType.SYNC_ERROR:
        actions.push(this.createRetryAction(error, context));
        actions.push(this.createForceResyncAction());
        canAutoRecover = true;
        break;

      case CreditErrorType.INSUFFICIENT_CREDITS:
        actions.push(this.createRechargeAction(context));
        canAutoRecover = false;
        break;

      case CreditErrorType.VALIDATION_ERROR:
        actions.push(this.createValidationFixAction(error, context));
        canAutoRecover = false;
        break;

      default:
        actions.push(this.createGenericRetryAction(error, context));
        canAutoRecover = false;
    }

    const recommendedAction = actions[0] || this.createGenericRetryAction(error, context);

    return {
      error,
      actions,
      recommendedAction,
      canAutoRecover,
    };
  }

  /**
   * Execute recovery plan automatically if possible
   */
  async executeAutoRecovery(recoveryPlan: RecoveryPlan): Promise<boolean> {
    if (!recoveryPlan.canAutoRecover) {
      return false;
    }

    const recoveryId = this.generateRecoveryId();
    
    if (this.recoveryInProgress.has(recoveryId)) {
      console.log('Recovery already in progress for this error type');
      return false;
    }

    this.recoveryInProgress.add(recoveryId);

    try {
      console.log('Attempting auto-recovery:', recoveryPlan.error.code);
      
      if (this.toastHandler) {
        this.toastHandler('Attempting to recover...', 'info');
      }

      const success = await recoveryPlan.recommendedAction.execute();
      
      if (success) {
        console.log('Auto-recovery successful');
        if (this.toastHandler) {
          this.toastHandler('Recovery successful', 'success');
        }
      } else {
        console.log('Auto-recovery failed');
        if (this.toastHandler) {
          this.toastHandler('Recovery failed. Manual intervention required.', 'error');
        }
      }

      return success;
    } catch (error) {
      console.error('Auto-recovery failed with error:', error);
      if (this.toastHandler) {
        this.toastHandler('Recovery failed. Please try again.', 'error');
      }
      return false;
    } finally {
      this.recoveryInProgress.delete(recoveryId);
    }
  }

  /**
   * Execute specific recovery action
   */
  async executeRecoveryAction(action: RecoveryAction): Promise<boolean> {
    if (this.recoveryInProgress.has(action.id)) {
      console.log('Recovery action already in progress:', action.id);
      return false;
    }

    this.recoveryInProgress.add(action.id);

    try {
      console.log('Executing recovery action:', action.description);
      
      if (this.toastHandler) {
        this.toastHandler(action.userMessage, 'info');
      }

      const success = await action.execute();
      
      if (success) {
        console.log('Recovery action successful:', action.id);
        if (this.toastHandler) {
          this.toastHandler('Recovery successful', 'success');
        }
      } else {
        console.log('Recovery action failed:', action.id);
        if (this.toastHandler) {
          this.toastHandler('Recovery failed', 'error');
        }
      }

      return success;
    } catch (error) {
      console.error('Recovery action failed with error:', error);
      if (this.toastHandler) {
        this.toastHandler('Recovery failed. Please try again.', 'error');
      }
      return false;
    } finally {
      this.recoveryInProgress.delete(action.id);
    }
  }

  /**
   * Create retry action
   */
  private createRetryAction(error: CreditError, context?: any): RecoveryAction {
    return {
      id: 'retry_operation',
      type: 'retry',
      description: 'Retry the failed operation',
      userMessage: 'Retrying operation...',
      execute: async () => {
        // This would need to be implemented based on the specific operation
        // For now, we'll simulate a retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        return Math.random() > 0.3; // 70% success rate for demo
      },
    };
  }

  /**
   * Create offline mode action
   */
  private createOfflineModeAction(): RecoveryAction {
    return {
      id: 'offline_mode',
      type: 'fallback',
      description: 'Continue in offline mode',
      userMessage: 'Switching to offline mode...',
      execute: async () => {
        try {
          // Queue operations for later sync
          console.log('Switching to offline mode');
          return true;
        } catch (error) {
          console.error('Failed to switch to offline mode:', error);
          return false;
        }
      },
    };
  }

  /**
   * Create data recovery action
   */
  private createDataRecoveryAction(): RecoveryAction {
    return {
      id: 'data_recovery',
      type: 'data_recovery',
      description: 'Recover data from server',
      userMessage: 'Recovering data from server...',
      execute: async () => {
        try {
          await offlineManager.recoverFromCorruption();
          return true;
        } catch (error) {
          console.error('Data recovery failed:', error);
          return false;
        }
      },
    };
  }

  /**
   * Create clear cache action
   */
  private createClearCacheAction(): RecoveryAction {
    return {
      id: 'clear_cache',
      type: 'fallback',
      description: 'Clear local cache and retry',
      userMessage: 'Clearing cache...',
      execute: async () => {
        try {
          // Clear corrupted data
          await CreditStorageService.clearAllCreditData();
          
          // Try to recover from server
          if (offlineManager.getNetworkStatus()) {
            await offlineManager.recoverFromCorruption();
          }
          
          return true;
        } catch (error) {
          console.error('Failed to clear cache:', error);
          return false;
        }
      },
    };
  }

  /**
   * Create retry payment action
   */
  private createRetryPaymentAction(error: CreditError, context?: any): RecoveryAction {
    return {
      id: 'retry_payment',
      type: 'retry',
      description: 'Retry payment with same method',
      userMessage: 'Retrying payment...',
      execute: async () => {
        try {
          // This would retry the payment with the same parameters
          await new Promise(resolve => setTimeout(resolve, 3000));
          return Math.random() > 0.4; // 60% success rate for demo
        } catch (error) {
          console.error('Payment retry failed:', error);
          return false;
        }
      },
    };
  }

  /**
   * Create alternative payment action
   */
  private createAlternativePaymentAction(): RecoveryAction {
    return {
      id: 'alternative_payment',
      type: 'user_intervention',
      description: 'Try different payment method',
      userMessage: 'Please select a different payment method',
      execute: async () => {
        // This would require user intervention to select a different payment method
        return false; // Requires user action
      },
    };
  }

  /**
   * Create force resync action
   */
  private createForceResyncAction(): RecoveryAction {
    return {
      id: 'force_resync',
      type: 'retry',
      description: 'Force complete data synchronization',
      userMessage: 'Synchronizing data...',
      execute: async () => {
        try {
          if (!offlineManager.getNetworkStatus()) {
            return false;
          }
          
          await creditApiService.performComprehensiveSync();
          return true;
        } catch (error) {
          console.error('Force resync failed:', error);
          return false;
        }
      },
    };
  }

  /**
   * Create recharge action
   */
  private createRechargeAction(context?: any): RecoveryAction {
    return {
      id: 'recharge_credits',
      type: 'user_intervention',
      description: 'Recharge credits to continue',
      userMessage: 'Please recharge your credits',
      execute: async () => {
        // This requires user intervention to recharge credits
        return false; // Requires user action
      },
    };
  }

  /**
   * Create validation fix action
   */
  private createValidationFixAction(error: CreditError, context?: any): RecoveryAction {
    return {
      id: 'fix_validation',
      type: 'user_intervention',
      description: 'Fix validation errors',
      userMessage: 'Please correct the input and try again',
      execute: async () => {
        // This requires user intervention to fix validation errors
        return false; // Requires user action
      },
    };
  }

  /**
   * Create reset data action
   */
  private createResetDataAction(): RecoveryAction {
    return {
      id: 'reset_data',
      type: 'data_recovery',
      description: 'Reset all credit data',
      userMessage: 'Resetting credit data...',
      execute: async () => {
        try {
          // Clear all local data
          await CreditStorageService.clearAllCreditData();
          
          // Initialize fresh data
          await CreditStorageService.initializeDefaultBalance('default-vendor');
          
          if (this.toastHandler) {
            this.toastHandler('Credit data has been reset', 'info');
          }
          
          return true;
        } catch (error) {
          console.error('Failed to reset data:', error);
          return false;
        }
      },
    };
  }

  /**
   * Create generic retry action
   */
  private createGenericRetryAction(error: CreditError, context?: any): RecoveryAction {
    return {
      id: 'generic_retry',
      type: 'retry',
      description: 'Retry the operation',
      userMessage: 'Retrying...',
      execute: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return Math.random() > 0.5; // 50% success rate for demo
      },
    };
  }

  /**
   * Generate unique recovery ID
   */
  private generateRecoveryId(): string {
    return `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if recovery is in progress
   */
  isRecoveryInProgress(actionId?: string): boolean {
    if (actionId) {
      return this.recoveryInProgress.has(actionId);
    }
    return this.recoveryInProgress.size > 0;
  }

  /**
   * Get recovery suggestions for user
   */
  getRecoverySuggestions(error: CreditError): string[] {
    const suggestions: string[] = [];

    switch (error.type) {
      case CreditErrorType.NETWORK_ERROR:
        suggestions.push('Check your internet connection');
        suggestions.push('Try again in a few moments');
        suggestions.push('Switch to a different network');
        break;

      case CreditErrorType.STORAGE_ERROR:
        suggestions.push('Check available storage space');
        suggestions.push('Restart the app');
        suggestions.push('Clear app cache');
        break;

      case CreditErrorType.PAYMENT_ERROR:
        suggestions.push('Check your payment method');
        suggestions.push('Ensure sufficient funds');
        suggestions.push('Try a different payment method');
        suggestions.push('Contact your bank if the issue persists');
        break;

      case CreditErrorType.DATA_CORRUPTION:
        suggestions.push('Data will be recovered from server');
        suggestions.push('Ensure you have internet connection');
        suggestions.push('Contact support if the issue persists');
        break;

      case CreditErrorType.INSUFFICIENT_CREDITS:
        suggestions.push('Recharge your credits');
        suggestions.push('Check your current balance');
        break;

      default:
        suggestions.push('Try again');
        suggestions.push('Restart the app if the issue persists');
        suggestions.push('Contact support for assistance');
    }

    return suggestions;
  }
}

// Export singleton instance
export const creditRecoveryService = CreditRecoveryService.getInstance();