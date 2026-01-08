# API Reference

Complete API reference for @umituz/react-native-subscription.

## Table of Contents

- [Initialization](#initialization)
- [Providers](#providers)
- [Hooks](#hooks)
- [Components](#components)
- [Services](#services)
- [Utilities](#utilities)
- [Types](#types)

## Initialization

### `initializeSubscription`

Initializes the subscription system with RevenueCat.

```typescript
function initializeSubscription(
  config: SubscriptionInitConfig
): Promise<void>
```

**Parameters:**
- `config`: Configuration object
  - `revenueCatApiKey`: RevenueCat API key
  - `revenueCatEntitlementId`: Entitlement ID (e.g., 'premium')
  - `creditPackages?`: Credit package configurations
  - `onInitialized?`: Callback when initialization completes
  - `onError?`: Error callback

**Example:**

```typescript
await initializeSubscription({
  revenueCatApiKey: 'your_api_key',
  revenueCatEntitlementId: 'premium',
  onInitialized: () => console.log('Ready'),
  onError: (error) => console.error(error),
});
```

### `SubscriptionProvider`

React context provider for subscription system.

**Props:**

```typescript
interface SubscriptionProviderProps {
  children: React.ReactNode;
  config: SubscriptionInitConfig;
  onError?: (error: Error) => void;
}
```

**Example:**

```typescript
<SubscriptionProvider config={config}>
  <App />
</SubscriptionProvider>
```

## Hooks

### Subscription Hooks

#### `useSubscription`

Hook for accessing subscription status.

```typescript
function useSubscription(): {
  subscription: SubscriptionStatus | null;
  isSubscribed: boolean;
  isActive: boolean;
  isLoading: boolean;
  error: Error | null;
  checkSubscription: () => Promise<void>;
  refetch: () => Promise<void>;
}
```

#### `useSubscriptionStatus`

Hook for detailed subscription status.

```typescript
function useSubscriptionStatus(): {
  status: SubscriptionStatus | null;
  tier: UserTier;
  isActive: boolean;
  willRenew: boolean;
  expirationDate: string | null;
  isLoading: boolean;
}
```

#### `useSubscriptionDetails`

Hook for subscription details including package info.

```typescript
function useSubscriptionDetails(): {
  subscription: SubscriptionStatus | null;
  package: Package | null;
  period: PackagePeriod | null;
  price: number | null;
  features: string[] | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}
```

### Premium Hooks

#### `usePremium`

Hook for checking premium status.

```typescript
function usePremium(): {
  isPremium: boolean;
  isLoading: boolean;
  error: Error | null;
  subscription: SubscriptionStatus | null;
  refetch: () => Promise<void>;
}
```

#### `usePremiumGate`

Hook for gating premium features.

```typescript
function usePremiumGate(config?: {
  featureId?: string;
  onUpgradeRequired?: () => void;
}): {
  isPremium: boolean;
  canAccess: boolean;
  showPaywall: () => void;
}
```

#### `usePremiumWithCredits`

Hook for features that work with premium OR credits.

```typescript
function usePremiumWithCredits(config: {
  creditCost: number;
  featureId: string;
}): {
  isPremium: boolean;
  hasCredits: boolean;
  credits: number;
  consumeCredit: () => Promise<CreditsResult>;
  isLoading: boolean;
}
```

### Credits Hooks

#### `useCredits`

Hook for credits balance.

```typescript
function useCredits(): {
  credits: number;
  balance: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
```

#### `useCreditsGate`

Hook for gating features with credits.

```typescript
function useCreditsGate(config: {
  creditCost: number;
  featureId: string;
}): {
  hasCredits: boolean;
  credits: number;
  consumeCredit: () => Promise<CreditsResult>;
  isLoading: boolean;
  showPurchasePrompt: () => void;
}
```

#### `useDeductCredit`

Hook for deducting credits.

```typescript
function useDeductCredit(): {
  deductCredit: (params: {
    amount: number;
    reason: string;
    metadata?: Record<string, any>;
  }) => Promise<CreditsResult>;
  isLoading: boolean;
}
```

### User Tier Hooks

#### `useUserTier`

Hook for user tier information.

```typescript
function useUserTier(): {
  tier: UserTier;
  isGuest: boolean;
  isFree: boolean;
  isPremium: boolean;
  canUpgrade: boolean;
  isLoading: boolean;
}
```

#### `useAuthGate`

Hook for authentication + subscription gating.

```typescript
function useAuthGate(config?: {
  requireAuth?: boolean;
  requireSubscription?: boolean;
}): {
  isAuthenticated: boolean;
  isAuthorized: boolean;
  user: User | null;
  signIn: () => void;
  signOut: () => void;
}
```

### Paywall Hooks

#### `usePaywall`

Hook for paywall control.

```typescript
function usePaywall(): {
  showPaywall: (params?: PaywallTrigger) => void;
  hidePaywall: () => void;
  isPaywallVisible: boolean;
  paywallConfig: PaywallConfig | null;
}
```

#### `usePaywallActions`

Hook for paywall purchase actions.

```typescript
function usePaywallActions(): {
  packages: Package[];
  selectedPackage: Package | null;
  selectPackage: (pkg: Package) => void;
  purchaseSelectedPackage: () => Promise<PurchaseResult>;
  restorePurchases: () => Promise<RestoreResult>;
  isLoading: boolean;
  error: Error | null;
}
```

#### `usePaywallVisibility`

Hook for conditional paywall display.

```typescript
function usePaywallVisibility(config: {
  trigger: string;
  showAfter?: number;
  frequency?: 'once' | 'once_per_session' | 'always';
}): {
  shouldShowPaywall: boolean;
  showPaywall: () => void;
  dismissPaywall: () => void;
  hasSeenPaywall: boolean;
}
```

### RevenueCat Hooks

#### `useRevenueCat`

Hook for RevenueCat access.

```typescript
function useRevenueCat(): {
  isReady: boolean;
  isInitialized: boolean;
  error: Error | null;
  purchaserInfo: CustomerInfo | null;
  offerings: Offerings | null;
}
```

#### `useCustomerInfo`

Hook for customer information.

```typescript
function useCustomerInfo(): {
  customerInfo: CustomerInfo | null;
  entitlements: Entitlements | null;
  activeSubscriptions: string[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
```

#### `useRestorePurchase`

Hook for restoring purchases.

```typescript
function useRestorePurchase(): {
  restorePurchase: () => Promise<RestoreResult>;
  isLoading: boolean;
  error: Error | null;
}
```

## Components

### Paywall Components

#### `PaywallModal`

Modal paywall component.

**Props:**

```typescript
interface PaywallModalProps {
  isVisible: boolean;
  onClose: () => void;
  config?: PaywallConfig;
  onPurchase?: (result: PurchaseResult) => void;
  isLoading?: boolean;
  translations?: PaywallTranslations;
}
```

#### `PaywallScreen`

Full-screen paywall component.

**Props:**

```typescript
interface PaywallScreenProps {
  packages: Package[];
  onPackageSelect: (pkg: Package) => void;
  config?: PaywallScreenConfig;
  translations?: PaywallTranslations;
}
```

### Premium Components

#### `PremiumDetailsCard`

Card showing premium subscription details.

**Props:**

```typescript
interface PremiumDetailsCardProps {
  status: SubscriptionStatus;
  onUpgradePress?: () => void;
  onManagePress?: () => void;
  style?: ViewStyle;
  translations?: PremiumDetailsCardTranslations;
}
```

#### `PremiumStatusBadge`

Badge showing subscription status.

**Props:**

```typescript
interface PremiumStatusBadgeProps {
  status: SubscriptionStatusType;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  style?: ViewStyle;
}
```

#### `DetailRow`

Row component for details.

**Props:**

```typescript
interface DetailRowProps {
  label: string;
  value: string;
  valueColor?: string;
  style?: ViewStyle;
}
```

#### `CreditRow`

Row component for credits display.

**Props:**

```typescript
interface CreditRowProps {
  credits: number;
  currency?: string;
  showBalance?: boolean;
  translations?: CreditRowTranslations;
  style?: ViewStyle;
}
```

### Feedback Components

#### `PaywallFeedbackModal`

Modal for collecting user feedback.

**Props:**

```typescript
interface PaywallFeedbackModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  translations?: FeedbackTranslations;
  placeholder?: string;
  maxLength?: number;
  showRating?: boolean;
}
```

### Section Components

#### `SubscriptionSection`

Section component for subscription display.

**Props:**

```typescript
interface SubscriptionSectionProps {
  title?: string;
  subscription: SubscriptionStatus | null;
  onPress?: () => void;
  onUpgradePress?: () => void;
  onManagePress?: () => void;
  style?: ViewStyle;
  translations?: SubscriptionSectionTranslations;
  showStatus?: boolean;
  showExpiration?: boolean;
  showManageButton?: boolean;
}
```

## Services

### `SubscriptionService`

Service for subscription management.

```typescript
class SubscriptionService {
  constructor(config: SubscriptionConfig);

  getStatus(userId: string): Promise<SubscriptionStatus | null>;
  activateSubscription(
    userId: string,
    productId: string,
    expiresAt: string | null
  ): Promise<SubscriptionStatus>;
  deactivateSubscription(userId: string): Promise<SubscriptionStatus>;
  isPremium(userId: string): Promise<boolean>;
}
```

### `CreditsRepository`

Repository for credits management.

```typescript
interface CreditsRepository {
  getCredits(userId: string): Promise<UserCredits>;
  addCredits(
    userId: string,
    amount: number,
    reason: string
  ): Promise<CreditsResult>;
  deductCredits(
    userId: string,
    amount: number,
    reason: string
  ): Promise<CreditsResult>;
}
```

## Utilities

### Price Utilities

```typescript
// Format price
formatPrice(price: number, currency: string): string

// Calculate discount
calculateDiscount(original: number, discounted: number): number

// Get price per month
getPricePerMonth(price: number, period: PackagePeriod): number

// Format price with currency
formatPriceWithCurrency(
  price: number,
  currency: string,
  locale?: string
): string
```

### Tier Utilities

```typescript
// Get user tier
getUserTier(user: User): UserTier

// Check if guest
isGuestUser(user: User): boolean

// Check if free user
isFreeUser(subscription: SubscriptionStatus): boolean

// Check if premium user
isPremiumUser(subscription: SubscriptionStatus): boolean

// Get tier priority
getTierPriority(tier: UserTier): number
```

### Package Utilities

```typescript
// Get package type
getPackageType(package: Package): PackageType

// Check if subscription
isSubscriptionPackage(package: Package): boolean

// Get package period
getPackagePeriod(productId: string): PackagePeriod | null

// Filter packages by type
filterPackagesByType(
  packages: Package[],
  type: PackageType
): Package[]
```

## Types

### SubscriptionStatus

```typescript
interface SubscriptionStatus {
  type: SubscriptionStatusType;
  isActive: boolean;
  isPremium: boolean;
  expirationDate: string | null;
  willRenew: boolean;
  productId?: string;
}

type SubscriptionStatusType =
  | 'unknown'
  | 'guest'
  | 'free'
  | 'premium';
```

### UserTier

```typescript
type UserTier = 'guest' | 'free' | 'premium';
```

### Package

```typescript
interface Package {
  identifier: string;
  packageType: PACKAGE_TYPE;
  product: Product;
  offeringIdentifier: string;
}

interface Product {
  identifier: string;
  description: string;
  title: string;
  price: number;
  priceString: string;
  currencyCode: string;
}
```

### CreditsResult

```typescript
interface CreditsResult {
  success: boolean;
  newBalance?: number;
  transaction?: Transaction;
  error?: Error;
}
```

### PurchaseResult

```typescript
interface PurchaseResult {
  success: boolean;
  error?: Error;
  customerInfo?: CustomerInfo;
  transactionId?: string;
}
```

### PaywallConfig

```typescript
interface PaywallConfig {
  title?: string;
  description?: string;
  features?: PaywallFeature[];
  theme?: 'light' | 'dark';
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
}

interface PaywallFeature {
  icon: string;
  text: string;
  description?: string;
  highlight?: boolean;
}
```

## More Information

- [Getting Started](./GETTING_STARTED.md)
- [Advanced Usage](./ADVANCED_USAGE.md)
- [Examples](../examples/)
