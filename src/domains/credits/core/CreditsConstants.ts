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
