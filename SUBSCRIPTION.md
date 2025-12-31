# Subscription Package Usage Guide

## Quick Start

### 1. Install Package

```bash
npm install @umituz/react-native-subscription@latest
```

### 2. Minimum Configuration

```typescript
// src/domains/subscription/config/subscriptionConfig.ts

import type { Config, Plan, CreditsConfig } from "@umituz/react-native-subscription";

export const CREDIT_LIMITS = {
  TEXT_GENERATION: 250,
  IMAGE_GENERATION: 25,
} as const;

export const CREDITS_COLLECTION = "user_credits";

export const creditsRepositoryConfig: CreditsConfig = {
  collectionName: CREDITS_COLLECTION,
  textCreditLimit: CREDIT_LIMITS.TEXT_GENERATION,
  imageCreditLimit: CREDIT_LIMITS.IMAGE_GENERATION,
  useUserSubcollection: true,
};

const yearlyPlan: Plan = {
  id: "yearly",
  type: "yearly",
  credits: 0,
  price: 79.99,
  currency: "USD",
  labelKey: "subscription.plans.yearly.title",
  descriptionKey: "subscription.plans.yearly.description",
  isBestValue: true,
};

export const appSubscriptionConfig: Config = {
  plans: [yearlyPlan],
  collectionName: CREDITS_COLLECTION,
  entitlementId: "premium",
  translations: {
    title: "subscription.title",
    subtitle: "subscription.subtitle",
    creditsLabel: "subscription.credits",
    creditsRemaining: "subscription.creditsRemaining",
    creditsTotal: "subscription.creditsTotal",
    upgradeButton: "subscription.upgrade",
    manageButton: "subscription.manage",
    restoreButton: "subscription.restore",
  },
  showCreditDetails: false,
  allowRestore: true,
};
```

### 3. Initialize in AppProviders

```typescript
// src/core/providers/AppProviders.tsx

import { TanstackProvider } from "@umituz/react-native-tanstack";
import { configureCreditsRepository } from "@umituz/react-native-subscription";
import { creditsRepositoryConfig } from "@domains/subscription";

const AppInitializer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    configureCreditsRepository(creditsRepositoryConfig);
  }, []);

  return <>{children}</>;
};

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => (
  <TanstackProvider>
    <AppInitializer>{children}</AppInitializer>
  </TanstackProvider>
);
```

### 4. RevenueCat Configuration (app.json)

```json
{
  "expo": {
    "extra": {
      "revenueCatApiKeyIos": "appl_YOUR_IOS_KEY",
      "revenueCatApiKeyAndroid": "goog_YOUR_ANDROID_KEY"
    }
  }
}
```

---

## Core Hooks

### usePremium

Main hook for subscription state and actions.

```typescript
import { usePremium } from "@umituz/react-native-subscription";

const {
  isPremium,      // boolean - user has active subscription
  isLoading,      // boolean - loading state
  packages,       // PurchasesPackage[] - available packages
  credits,        // UserCredits | null
  showPaywall,    // boolean - paywall visibility
  openPaywall,    // () => void
  closePaywall,   // () => void
  purchasePackage,// (pkg) => Promise<boolean>
  restorePurchase // () => Promise<boolean>
} = usePremium(userId);
```

### usePaywallOperations

Handles purchase flow with auth integration.

```typescript
import { usePaywallOperations } from "@umituz/react-native-subscription";

const {
  handlePurchase,           // Post-onboarding purchase
  handleRestore,            // Post-onboarding restore
  handleInAppPurchase,      // In-app purchase (auto-close)
  handleInAppRestore,       // In-app restore (auto-close)
  completePendingPurchase,  // Complete after auth
  pendingPackage,           // Package waiting for auth
} = usePaywallOperations({
  userId: user?.uid,
  isAnonymous: user?.isAnonymous ?? true,
  onPaywallClose: () => { /* hide paywall */ },
  onPurchaseSuccess: () => { /* handle success */ },
  onAuthRequired: () => {
    showAuthModal(async () => {
      await completePendingPurchase();
    });
  },
});
```

---

## PaywallModal Usage

```typescript
import { PaywallModal, usePremium } from "@umituz/react-native-subscription";

const { packages, isLoading, showPaywall, closePaywall } = usePremium(userId);

<PaywallModal
  visible={showPaywall}
  onClose={closePaywall}
  mode="subscription"
  subscriptionPackages={packages}
  onSubscriptionPurchase={handleInAppPurchase}
  onRestore={handleInAppRestore}
  isLoading={isLoading}
  features={[
    { icon: "star", title: "Feature 1", description: "Description" },
  ]}
  bestValueIdentifier="yearly"
  translations={{
    title: t("premium.title"),
    subtitle: t("premium.subtitle"),
    subscribeButtonText: t("paywall.subscribe"),
    restoreButtonText: t("paywall.restore"),
  }}
  legalUrls={{
    privacyUrl: "https://...",
    termsUrl: "https://...",
  }}
/>
```

---

## Feature Gating

### useFeatureGate

Gate premium features with auth + subscription check.

```typescript
import { useFeatureGate } from "@umituz/react-native-subscription";

const { requireFeature, isPremium, isAuthenticated } = useFeatureGate({
  userId,
  isAnonymous,
  onAuthRequired: () => showAuthModal(),
  onPremiumRequired: () => openPaywall(),
});

// Usage
const handlePremiumAction = () => {
  requireFeature(() => {
    // This runs only if user is authenticated AND premium
    performPremiumAction();
  });
};
```

---

## Credits System

### Check Credits

```typescript
import { useCreditChecker } from "@umituz/react-native-subscription";

const { hasCredits, remainingCredits } = useCreditChecker({
  userId,
  creditType: "text", // or "image"
});
```

### Deduct Credits

```typescript
import { useDeductCredit } from "@umituz/react-native-subscription";

const { deductCredit, isDeducting } = useDeductCredit({ userId });

// After successful AI generation
await deductCredit("text"); // or "image"
```

---

## Settings Integration

### useSubscriptionSettingsConfig

```typescript
import { useSubscriptionSettingsConfig } from "@umituz/react-native-subscription";

const config = useSubscriptionSettingsConfig({
  userId,
  isAnonymous,
  currentLanguage,
  translations: {
    title: t("credits.title"),
    statusActive: t("credits.statusActive"),
    upgradeButton: t("premium.upgradeNow"),
  },
  getCreditLimit: () => CREDIT_LIMITS.TEXT_GENERATION,
  upgradePrompt: {
    title: t("premium.title"),
    benefits: [
      { icon: "star", text: t("premium.feature1") },
    ],
  },
});
```

---

## File Structure

```
src/domains/subscription/
├── index.ts                    # Barrel exports
└── config/
    └── subscriptionConfig.ts   # All config in one place
        ├── CREDIT_LIMITS
        ├── CREDITS_COLLECTION
        ├── creditsRepositoryConfig
        └── appSubscriptionConfig
```

---

## Required Translation Keys

```typescript
// Minimum required translations
{
  "premium": {
    "title": "Go Premium",
    "subtitle": "Unlock all features",
    "purchaseError": "Purchase Failed",
    "purchaseErrorMessage": "Could not complete purchase",
    "restoreSuccess": "Restored",
    "restoreMessage": "Your purchases have been restored",
    "restoreError": "Restore Failed",
    "restoreErrorMessage": "Could not restore purchases"
  },
  "paywall": {
    "subscribe": "Subscribe",
    "restore": "Restore Purchases",
    "loading": "Loading...",
    "empty": "No packages available"
  }
}
```

---

## Common Patterns

### Anonymous User Purchase Flow

1. User taps "Subscribe"
2. `handleInAppPurchase` detects anonymous user
3. `onAuthRequired` callback triggered
4. Auth modal shows
5. User registers/logs in
6. `completePendingPurchase()` called
7. Purchase completes with new userId

### Post-Onboarding Paywall

```typescript
if (showPostOnboardingPaywall && !paywallShown) {
  return (
    <PaywallModal
      visible={true}
      onClose={() => closePostOnboardingPaywall(isPremium)}
      onSubscriptionPurchase={handlePurchase}
      onRestore={handleRestore}
      // ...
    />
  );
}
```

---

## Checklist for New Apps

- [ ] Install `@umituz/react-native-subscription@latest`
- [ ] Create `subscriptionConfig.ts` with credit limits
- [ ] Add RevenueCat keys to `app.json`
- [ ] Call `configureCreditsRepository()` in AppProviders
- [ ] Add PaywallModal to AppNavigator
- [ ] Configure `usePaywallOperations` with auth callbacks
- [ ] Add translation keys
- [ ] Create RevenueCat products matching config
