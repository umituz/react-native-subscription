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
 * Global Firestore collection for cross-user transaction deduplication.
 * Prevents the same Apple/Google transaction from allocating credits
 * under multiple Firebase UIDs (e.g., anonymous + converted accounts).
 */
export const GLOBAL_TRANSACTION_COLLECTION = 'processedTransactions';
