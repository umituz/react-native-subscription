import type { PurchasesPackage } from "react-native-purchases";
import type { PurchaseSource } from "../../core/SubscriptionConstants";

export interface PurchaseAuthProvider {
  isAuthenticated: () => boolean;
  showAuthModal: () => void;
}

interface SavedPurchaseState {
  pkg: PurchasesPackage;
  source: PurchaseSource;
  timestamp: number;
  sessionId: string;
}

const SAVED_PURCHASE_EXPIRY_MS = 2 * 60 * 1000;

let currentSessionId = "";

class AuthPurchaseStateManager {
  private authProvider: PurchaseAuthProvider | null = null;
  private savedPurchaseState: SavedPurchaseState | null = null;

  configure(provider: PurchaseAuthProvider): void {
    this.authProvider = provider;
  }

  getProvider(): PurchaseAuthProvider | null {
    return this.authProvider;
  }

  setSessionId(sessionId: string): void {
    currentSessionId = sessionId;
  }

  savePurchase(pkg: PurchasesPackage, source: PurchaseSource): void {
    this.savedPurchaseState = {
      pkg,
      source,
      timestamp: Date.now(),
      sessionId: currentSessionId,
    };
  }

  getSavedPurchase(): { pkg: PurchasesPackage; source: PurchaseSource } | null {
    if (!this.savedPurchaseState) {
      return null;
    }

    if (this.savedPurchaseState.sessionId !== currentSessionId) {
      this.savedPurchaseState = null;
      return null;
    }

    const isExpired = Date.now() - this.savedPurchaseState.timestamp > SAVED_PURCHASE_EXPIRY_MS;
    if (isExpired) {
      this.savedPurchaseState = null;
      return null;
    }

    return {
      pkg: this.savedPurchaseState.pkg,
      source: this.savedPurchaseState.source,
    };
  }

  clearSavedPurchase(): void {
    this.savedPurchaseState = null;
  }

  onUserChanged(): void {
    this.savedPurchaseState = null;
  }

  cleanup(): void {
    this.authProvider = null;
    this.savedPurchaseState = null;
    currentSessionId = "";
  }
}

export const authPurchaseStateManager = new AuthPurchaseStateManager();
