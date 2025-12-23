/**
 * Paywall Legal Footer Types
 * Type definitions for paywall legal footer
 */

export interface PaywallLegalFooterProps {
  termsText?: string;
  privacyUrl?: string;
  termsUrl?: string;
  privacyText?: string;
  termsOfServiceText?: string;
  showRestoreButton?: boolean;
  restoreButtonText?: string;
  onRestore?: () => void;
  isProcessing?: boolean;
}

export const DEFAULT_TERMS =
  "Payment will be charged to your account. Subscription automatically renews unless cancelled.";
