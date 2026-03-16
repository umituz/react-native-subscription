export const CREDIT_ERROR_CODES = {
  NO_CREDITS: 'NO_CREDITS',
  CREDITS_EXHAUSTED: 'CREDITS_EXHAUSTED',
  DEDUCT_ERR: 'DEDUCT_ERR',
  DB_ERROR: 'ERR',
} as const;

export const PURCHASE_ID_PREFIXES = {
  PURCHASE: 'purchase_',
  RENEWAL: 'renewal_',
} as const;

export const PROCESSED_PURCHASES_WINDOW = 50;

/** Maximum credits that can be deducted in a single operation. */
export const MAX_SINGLE_DEDUCTION = 10000;

/**
 * User-specific Firestore sub-collection for transaction deduplication.
 * Changed from global root-level collection to user-scoped collection
 * to match vivoim_app pattern and avoid Firestore permission issues.
 * Path: users/{userId}/credits/processedTransactions/{transactionId}
 */
export const TRANSACTION_SUBCOLLECTION = 'processedTransactions';
