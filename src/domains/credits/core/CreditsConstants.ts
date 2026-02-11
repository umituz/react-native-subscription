/**
 * Credit Error Codes
 */
export const CREDIT_ERROR_CODES = {
  NO_CREDITS: 'NO_CREDITS',
  CREDITS_EXHAUSTED: 'CREDITS_EXHAUSTED',
  DEDUCT_ERR: 'DEDUCT_ERR',
  DB_ERROR: 'ERR',
} as const;

/**
 * Purchase ID Prefixes
 */
export const PURCHASE_ID_PREFIXES = {
  STATUS_SYNC: 'status_sync_',
  PURCHASE: 'purchase_',
  RENEWAL: 'renewal_',
} as const;
