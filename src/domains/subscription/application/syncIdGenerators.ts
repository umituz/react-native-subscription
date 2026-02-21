export const generatePurchaseId = (originalTransactionId: string | null, productId: string): string => {
  return originalTransactionId
    ? `purchase_${originalTransactionId}`
    : `purchase_${productId}_${Date.now()}`;
};

export const generateRenewalId = (originalTransactionId: string | null, productId: string, expirationDate: string): string => {
  return originalTransactionId
    ? `renewal_${originalTransactionId}_${expirationDate}`
    : `renewal_${productId}_${Date.now()}`;
};
