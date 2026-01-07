
export interface FirestoreTimestamp {
    toDate: () => Date;
}

// Document structure when READING from Firestore
export interface UserCreditsDocumentRead {
    credits: number;
    purchasedAt?: FirestoreTimestamp;
    lastUpdatedAt?: FirestoreTimestamp;
    lastPurchaseAt?: FirestoreTimestamp;
    processedPurchases?: string[];
}
