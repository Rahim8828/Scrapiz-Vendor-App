/**
 * Accessibility utilities for credit system components
 */

export const creditAccessibilityLabels = {
  balance: (balance: number, isLow: boolean) => 
    `Credit balance: ${balance} credits${isLow ? ', low balance warning' : ''}`,
  
  balanceHint: 'Tap to view credit details and recharge options',
  
  rechargeButton: 'Recharge credits',
  rechargeHint: 'Open credit recharge options',
  
  backButton: 'Go back',
  backHint: 'Navigate back to previous screen',
  
  transactionTab: (label: string, isSelected: boolean) => 
    `${label} transactions${isSelected ? ', selected' : ''}`,
  
  transactionItem: (description: string, amount: number, type: string) =>
    `Transaction: ${description}, ${type === 'addition' ? 'added' : 'deducted'} ${Math.abs(amount)} credits`,
  
  lowBalanceWarning: (balance: number) =>
    `Warning: Low credit balance of ${balance} credits. Recharge recommended to continue accepting bookings.`,
  
  criticalBalanceAlert: 'Critical: Zero credit balance. Recharge required to accept new bookings.',
  
  loadingBalance: 'Loading credit balance',
  loadingTransactions: 'Loading transaction history',
  
  emptyTransactions: (filter: string) =>
    filter === 'all' 
      ? 'No transactions found. Your transaction history will appear here.'
      : `No ${filter} transactions found.`,
};

export const creditAccessibilityRoles = {
  button: 'button' as const,
  tab: 'tab' as const,
  text: 'text' as const,
  alert: 'alert' as const,
  status: 'status' as const,
  progressbar: 'progressbar' as const,
};

export const creditAccessibilityStates = {
  selected: (isSelected: boolean) => ({ selected: isSelected }),
  disabled: (isDisabled: boolean) => ({ disabled: isDisabled }),
  busy: (isBusy: boolean) => ({ busy: isBusy }),
  expanded: (isExpanded: boolean) => ({ expanded: isExpanded }),
};

/**
 * Format currency amounts for screen readers
 */
export const formatCurrencyForAccessibility = (amount: number): string => {
  return `${amount} rupees`;
};

/**
 * Format credit amounts for screen readers
 */
export const formatCreditsForAccessibility = (credits: number): string => {
  return credits === 1 ? '1 credit' : `${credits} credits`;
};

/**
 * Format transaction type for screen readers
 */
export const formatTransactionTypeForAccessibility = (type: string): string => {
  switch (type) {
    case 'addition':
      return 'credit added';
    case 'deduction':
      return 'credit deducted';
    case 'penalty':
      return 'penalty deducted';
    default:
      return type;
  }
};

/**
 * Generate accessible description for transaction items
 */
export const generateTransactionAccessibilityDescription = (
  description: string,
  amount: number,
  type: string,
  timestamp: Date,
  orderValue?: number,
  paymentAmount?: number
): string => {
  const formattedAmount = formatCreditsForAccessibility(Math.abs(amount));
  const formattedType = formatTransactionTypeForAccessibility(type);
  const formattedDate = timestamp.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let accessibilityText = `${description}. ${formattedAmount} ${formattedType} on ${formattedDate}`;

  if (orderValue) {
    accessibilityText += `. Order value: ${formatCurrencyForAccessibility(orderValue)}`;
  }

  if (paymentAmount) {
    accessibilityText += `. Payment amount: ${formatCurrencyForAccessibility(paymentAmount)}`;
  }

  return accessibilityText;
};

/**
 * Accessibility announcements for dynamic content changes
 */
export const creditAccessibilityAnnouncements = {
  balanceUpdated: (newBalance: number) =>
    `Credit balance updated to ${formatCreditsForAccessibility(newBalance)}`,
  
  transactionAdded: (amount: number, type: string) =>
    `New transaction: ${formatCreditsForAccessibility(Math.abs(amount))} ${formatTransactionTypeForAccessibility(type)}`,
  
  rechargeSuccess: (amount: number) =>
    `Recharge successful. ${formatCreditsForAccessibility(amount)} added to your account`,
  
  rechargeError: 'Recharge failed. Please try again.',
  
  insufficientCredits: (required: number, available: number) =>
    `Insufficient credits. ${formatCreditsForAccessibility(required)} required, ${formatCreditsForAccessibility(available)} available`,
  
  dataLoaded: 'Credit data loaded successfully',
  dataError: 'Failed to load credit data. Please try again.',
  
  filterChanged: (filter: string) =>
    `Showing ${filter} transactions`,
};

/**
 * Accessibility helpers for focus management
 */
export const creditAccessibilityFocus = {
  /**
   * Set focus to element after a delay (useful for dynamic content)
   */
  setDelayedFocus: (elementRef: React.RefObject<any>, delay: number = 100) => {
    setTimeout(() => {
      if (elementRef.current?.focus) {
        elementRef.current.focus();
      }
    }, delay);
  },

  /**
   * Announce content to screen readers
   */
  announceToScreenReader: (message: string) => {
    // This would typically use a live region or accessibility service
    // For React Native, we might use AccessibilityInfo.announceForAccessibility
    console.log(`Accessibility announcement: ${message}`);
  },
};