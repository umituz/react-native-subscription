export interface UseFeatureGateParams {
  readonly isAuthenticated: boolean;
  readonly onShowAuthModal: (pendingCallback: () => void | Promise<void>) => void;
  readonly hasSubscription?: boolean;
  readonly creditBalance: number;
  readonly requiredCredits?: number;
  readonly onShowPaywall: (requiredCredits?: number) => void;
  readonly isCreditsLoaded?: boolean;
}

export interface UseFeatureGateResult {
  readonly requireFeature: (action: () => void | Promise<void>) => boolean;
  readonly isAuthenticated: boolean;
  readonly hasSubscription: boolean;
  readonly hasCredits: boolean;
  readonly creditBalance: number;
  readonly canAccess: boolean;
}
