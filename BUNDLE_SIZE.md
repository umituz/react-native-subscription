# @umituz/react-native-subscription

Complete subscription management with RevenueCat, paywall UI, and credits system for React Native apps.

## 📦 Bundle Size Optimization

This package uses **sub-exports** to keep your bundle size minimal. Only import what you need!

## 🚀 Quick Start

### Core Features (All Apps)

```typescript
import {
  ManagedSubscriptionFlow,
  usePremiumStatus,
  PaywallScreen
} from '@umituz/react-native-subscription';
```

### Optional Features (Import When Needed)

#### Wallet Features
```typescript
// Only if your app needs wallet UI
import { WalletScreen } from '@umituz/react-native-subscription/exports/wallet';
```

#### Onboarding Helpers
```typescript
// Only if you need advanced onboarding tools
import { useOnboardingProgress } from '@umituz/react-native-subscription/exports/onboarding';
```

#### Analytics
```typescript
// Only if you need subscription analytics
import { useSubscriptionAnalytics } from '@umituz/react-native-subscription/exports/analytics';
```

#### Experimental Features
```typescript
// Only if you want beta features (AI, smart paywall, etc.)
import { AIUpsell } from '@umituz/react-native-subscription/exports/experimental';
```

## 📁 Package Structure

```
@umituz/react-native-subscription/
├── Core (index.ts)
│   ├── Subscription management
│   ├── Paywall components
│   ├── Credits system
│   └── Premium hooks
│
└── Optional (exports/)
    ├── wallet.ts - Wallet UI & transactions
    ├── onboarding.ts - Advanced onboarding
    ├── analytics.ts - Subscription analytics
    └── experimental.ts - Beta features
```

## 💡 Bundle Size Impact

| Import Type | Bundle Impact |
|-------------|---------------|
| `@umituz/react-native-subscription` | ~50 KB (core) |
| `.../exports/wallet` | +15 KB |
| `.../exports/analytics` | +8 KB |
| `.../exports/experimental` | +12 KB |

**Total without optional features: ~50 KB**
**Total with all features: ~85 KB**

## 🎯 Best Practices

### ✅ DO
```typescript
// Import core features
import { usePremiumStatus } from '@umituz/react-native-subscription';

// Import optional features explicitly
import { WalletScreen } from '@umituz/react-native-subscription/exports/wallet';
```

### ❌ DON'T
```typescript
// Don't import everything if you don't need it
import {
  usePremiumStatus,
  WalletScreen  // ← Don't do this if you don't use wallet!
} from '@umituz/react-native-subscription';
```

## 📖 Documentation

For full documentation, see [API Documentation](./docs/API.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md)

## 📄 License

MIT
