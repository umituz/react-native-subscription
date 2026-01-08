# @umituz/react-native-subscription

Complete subscription management with RevenueCat, paywall UI, and credits system for React Native apps.

## Features

- 🚀 **RevenueCat Integration** - Full RevenueCat SDK integration with auto-initialization
- 💳 **Subscription Management** - Handle monthly, annual, and lifetime subscriptions
- 💰 **Credits System** - Built-in credits system with transaction tracking
- 🎨 **Paywall Components** - Beautiful, customizable paywall UI components
- 🔐 **Gate System** - Premium, auth, and credit gates for feature access control
- 🌍 **Multi-language Support** - Built-in i18n support
- 📊 **Analytics Ready** - Track subscription events and user behavior
- 🏗️ **DDD Architecture** - Domain-driven design with clean architecture

## Installation

```bash
npm install @umituz/react-native-subscription
# or
yarn add @umituz/react-native-subscription
```

## Peer Dependencies

```json
{
  "@tanstack/react-query": ">=5.0.0",
  "expo-constants": ">=16.0.0",
  "expo-image": ">=2.0.0",
  "expo-linear-gradient": ">=14.0.0",
  "firebase": ">=10.0.0",
  "react": ">=18.2.0",
  "react-native": ">=0.74.0",
  "react-native-purchases": ">=7.0.0",
  "react-native-safe-area-context": ">=5.0.0"
}
```

## Quick Start

### 1. Initialize Subscription

```typescript
import { initializeSubscription, SubscriptionProvider } from '@umituz/react-native-subscription';

// Wrap your app with provider
function App() {
  return (
    <SubscriptionProvider
      config={{
        revenueCatApiKey: 'your_api_key',
        revenueCatEntitlementId: 'premium',
      }}
    >
      <YourApp />
    </SubscriptionProvider>
  );
}

// Or initialize manually
await initializeSubscription({
  revenueCatApiKey: process.env.REVENUECAT_API_KEY,
  revenueCatEntitlementId: 'premium',
});
```

### 2. Check Subscription Status

```typescript
import { usePremium } from '@umituz/react-native-subscription';

function PremiumFeature() {
  const { isPremium, isLoading } = usePremium();

  if (isLoading) return <ActivityIndicator />;

  if (!isPremium) {
    return <UpgradePrompt />;
  }

  return <PremiumContent />;
}
```

### 3. Show Paywall

```typescript
import { PaywallModal } from '@umituz/react-native-subscription';

function MyComponent() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <Button onPress={() => setIsVisible(true)} title="Upgrade" />

      <PaywallModal
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
        config={{
          title: 'Unlock Premium',
          description: 'Get unlimited access',
          features: [
            { icon: 'star', text: 'Unlimited credits' },
            { icon: 'zap', text: 'AI-powered tools' },
          ],
        }}
      />
    </>
  );
}
```

### 4. Use Credits

```typescript
import { useCreditsGate } from '@umituz/react-native-subscription';

function FeatureWithCredits() {
  const { hasCredits, consumeCredit } = useCreditsGate({
    creditCost: 5,
    featureId: 'ai_generation',
  });

  const handleAction = async () => {
    if (!hasCredits) {
      showPaywall();
      return;
    }

    const result = await consumeCredit();
    if (result.success) {
      await performAction();
    }
  };

  return <Button onPress={handleAction} title="Use Feature (5 credits)" />;
}
```

## Documentation

### Domain Architecture

The package follows Domain-Driven Design (DDD) principles:

- **[Wallet Domain](./src/domains/wallet/README.md)** - Credits, transactions, and wallet management
- **[Paywall Domain](./src/domains/paywall/README.md)** - Paywall components and flows
- **[Config Domain](./src/domains/config/README.md)** - Plan configuration and metadata

### Layer Architecture

- **[Application Layer](./src/application/README.md)** - Service contracts and ports
- **[Domain Layer](./src/domain/README.md)** - Entities, value objects, and domain logic
- **[Infrastructure Layer](./src/infrastructure/README.md)** - Repository implementations
- **[Presentation Layer](./src/presentation/README.md)** - React hooks and UI components

### Key Features

- **[RevenueCat Integration](./src/revenuecat/README.md)** - RevenueCat SDK wrapper
- **[Subscription Hooks](./src/presentation/hooks/README.md)** - React hooks for subscription management
- **[Premium Components](./src/presentation/components/details/README.md)** - Premium UI components
- **[Utils](./src/utils/README.md)** - Helper functions for subscriptions and credits

## API Reference

### Hooks

```typescript
// Subscription
import {
  useSubscription,
  useSubscriptionStatus,
  usePremium,
  usePremiumGate,
} from '@umituz/react-native-subscription';

// Credits
import {
  useCredits,
  useCreditsGate,
  useDeductCredit,
} from '@umituz/react-native-subscription';

// Paywall
import {
  usePaywall,
  usePaywallActions,
  usePaywallVisibility,
} from '@umituz/react-native-subscription';

// User Tier
import {
  useUserTier,
  useAuthGate,
  useFeatureGate,
} from '@umituz/react-native-subscription';
```

### Components

```typescript
import {
  // Premium components
  PremiumDetailsCard,
  PremiumStatusBadge,
  DetailRow,
  CreditRow,

  // Paywall components
  PaywallModal,
  PaywallScreen,
  SubscriptionSection,

  // Feedback
  PaywallFeedbackModal,
} from '@umituz/react-native-subscription';
```

### Services

```typescript
import {
  // Initialization
  initializeSubscription,
  SubscriptionService,

  // Credits
  configureCreditsRepository,
  getCreditsRepository,

  // RevenueCat
  useRevenueCat,
  useCustomerInfo,
  useRestorePurchase,
} from '@umituz/react-native-subscription';
```

## Examples

### Complete Premium Feature Example

```typescript
import React from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import {
  usePremiumGate,
  useCreditsGate,
  useUserTier,
  PaywallModal,
} from '@umituz/react-native-subscription';

function PremiumFeature() {
  const { tier, isPremium } = useUserTier();
  const { canAccess, showPaywall } = usePremiumGate({
    featureId: 'ai_tools',
  });

  const { hasCredits, credits, consumeCredit } = useCreditsGate({
    creditCost: 5,
    featureId: 'ai_generation',
  });

  const handleGenerate = async () => {
    if (!canAccess) {
      showPaywall();
      return;
    }

    if (isPremium) {
      // Premium: unlimited access
      await generateContent();
    } else if (hasCredits) {
      // Free: use credits
      const result = await consumeCredit();
      if (result.success) {
        await generateContent();
      }
    } else {
      // No access: show upgrade
      showPaywall();
    }
  };

  return (
    <View>
      <Text>Tier: {tier}</Text>
      {!isPremium && <Text>Credits: {credits}</Text>}

      <Button
        onPress={handleGenerate}
        title={
          isPremium
            ? 'Generate (Unlimited)'
            : 'Generate (5 credits)'
        }
      />
    </View>
  );
}
```

### Complete Settings Screen Example

```typescript
import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import {
  PremiumDetailsCard,
  SubscriptionSection,
  useSubscription,
} from '@umituz/react-native-subscription';

function SettingsScreen() {
  const { subscription, isLoading, refetch } = useSubscription();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <SubscriptionSection
        subscription={subscription}
        onPress={() => navigation.navigate('SubscriptionDetail')}
      />

      {subscription?.isPremium && (
        <PremiumDetailsCard
          status={subscription}
          onManagePress={handleManageSubscription}
        />
      )}
    </ScrollView>
  );
}
```

## Configuration

### Subscription Config

```typescript
import type { SubscriptionConfig } from '@umituz/react-native-subscription';

const config: SubscriptionConfig = {
  revenueCatApiKey: 'your_api_key',
  revenueCatEntitlementId: 'premium',

  plans: {
    monthly: monthlyPlan,
    annual: annualPlan,
    lifetime: lifetimePlan,
  },

  defaultPlan: 'monthly',

  features: {
    requireAuth: true,
    allowRestore: true,
    syncWithFirebase: true,
  },

  ui: {
    showAnnualDiscount: true,
    highlightPopularPlan: true,
    showPerks: true,
  },
};
```

### Credits Config

```typescript
import type { CreditsConfig } from '@umituz/react-native-subscription';

const creditsConfig: CreditsConfig = {
  initialCredits: 100,

  creditPackages: [
    {
      id: 'credits_small',
      productId: 'com.app.credits.small',
      amount: 100,
      price: 0.99,
      currency: 'USD',
    },
    {
      id: 'credits_medium',
      productId: 'com.app.credits.medium',
      amount: 500,
      price: 3.99,
      currency: 'USD',
    },
  ],

  creditCosts: {
    ai_generation: 1,
    ai_analysis: 2,
    premium_feature: 5,
  },
};
```

## Architecture

The package follows Clean Architecture and Domain-Driven Design principles:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (React Hooks & Components)             │
├─────────────────────────────────────────┤
│         Application Layer               │
│  (Use Cases & Service Contracts)        │
├─────────────────────────────────────────┤
│           Domain Layer                  │
│  (Entities & Business Logic)            │
├─────────────────────────────────────────┤
│       Infrastructure Layer              │
│  (External Services & Repositories)     │
└─────────────────────────────────────────┘
```

## Best Practices

1. **Always check loading states** before rendering subscription-dependent UI
2. **Use gate hooks** (`usePremiumGate`, `useCreditsGate`) for feature access control
3. **Handle errors gracefully** and show user-friendly messages
4. **Provide restore purchase** option for iOS and Android
5. **Track subscription events** with analytics
6. **Use translations** for multi-language support
7. **Test different subscription states** (guest, free, premium, expired)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Author

Ümit UZ <umit@umituz.com>

## Links

- [GitHub](https://github.com/umituz/react-native-subscription)
- [NPM](https://www.npmjs.com/package/@umituz/react-native-subscription)

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/umituz/react-native-subscription/issues).
