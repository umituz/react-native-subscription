const uniqueSuffix = (): string => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const generatePurchaseId = (storeTransactionId: string | null, productId: string): string => {
  return storeTransactionId
    ? `purchase_${storeTransactionId}`
    : `purchase_${productId}_${uniqueSuffix()}`;
};

export const generateRenewalId = (storeTransactionId: string | null, productId: string, expirationDate: string): string => {
  return storeTransactionId
    ? `renewal_${storeTransactionId}_${expirationDate}`
    : `renewal_${productId}_${uniqueSuffix()}`;
};
