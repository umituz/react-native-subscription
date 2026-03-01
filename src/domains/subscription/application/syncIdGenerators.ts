const uniqueSuffix = (): string => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const generatePurchaseId = (originalTransactionId: string | null, productId: string): string => {
  return originalTransactionId
    ? `purchase_${originalTransactionId}`
    : `purchase_${productId}_${uniqueSuffix()}`;
};

export const generateRenewalId = (originalTransactionId: string | null, productId: string, expirationDate: string): string => {
  return originalTransactionId
    ? `renewal_${originalTransactionId}_${expirationDate}`
    : `renewal_${productId}_${uniqueSuffix()}`;
};
