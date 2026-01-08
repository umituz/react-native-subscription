# Frequently Asked Questions

Common questions about @umituz/react-native-subscription.

## General Questions

### What is this package?

A complete subscription management solution for React Native apps that handles:
- RevenueCat integration
- Subscription status tracking
- Premium feature gating
- Credits system
- Paywall UI components
- Multi-language support

### What platforms are supported?

- **iOS**: 12.0+
- **Android**: 5.0+ (API 21+)
- **Expo**: Supported (with config plugin)

### Does this work with Expo?

Yes! This package works with Expo. However, you'll need:
- Expo SDK 50+
- Custom dev client (for RevenueCat)
- Or use Expo Application Services (EAS)

### Is this free to use?

Yes, this package is MIT licensed and free to use. However:
- **RevenueCat** has free tier with paid tiers for higher volume
- **Firebase** (for credits) has generous free tier

## Installation & Setup

### How do I install?

```bash
npm install @umituz/react-native-subscription
npm install react-native-purchases @tanstack/react-query
```

### What are the peer dependencies?

```json
{
  "@tanstack/react-query": ">=5.0.0",
  "expo-constants": ">=16.0.0",
  "expo-image": ">=2.0.0",
  "firebase": ">=10.0.0",
  "react": ">=18.2.0",
  "react-native": ">=0.74.0",
  "react-native-purchases": ">=7.0.0",
  "react-native-safe-area-context": ">=5.0.0"
}
```

### Do I need RevenueCat?

Yes, RevenueCat is required for subscription management. It's the industry standard for handling in-app purchases.

**Why RevenueCat?**
- Handles complex subscription logic
- Works across iOS and Android
- Great documentation and support
- Free tier available

### Do I need Firebase?

Firebase is optional but recommended for:
- Credits system
- Real-time subscription updates
- Cloud Firestore for data persistence

## Features

### Does this support multiple subscriptions?

Yes! You can offer:
- Monthly subscription
- Annual subscription
- Lifetime purchase
- Custom packages

### Can I use credits without subscriptions?

Yes! Credits work independently:
- Users can buy credit packs
- Credits are consumed per feature use
- No subscription required

### Does this support family sharing?

Yes, through RevenueCat:
- iOS Family Sharing automatically supported
- Android Play Store family library supported

### Can I offer trials?

Yes! Configure trials in:
- **App Store Connect** for iOS
- **Google Play Console** for Android

Then RevenueCat handles them automatically.

### Does this support promos and offers?

Yes! Through platform stores:
- **iOS**: Promotional offers in App Store Connect
- **Android**: Base plans and offers in Play Console

## Usage

### How do I check if user is premium?

```typescript
import { usePremium } from '@umituz/react-native-subscription';

function MyComponent() {
  const { isPremium, isLoading } = usePremium();

  if (isLoading) return <ActivityIndicator />;
  if (!isPremium) return <UpgradePrompt />;

  return <PremiumContent />;
}
```

### How do I gate premium features?

```typescript
import { usePremiumGate } from '@umituz/react-native-subscription';

function ProtectedFeature() {
  const { canAccess, showPaywall } = usePremiumGate();

  const handleAction = () => {
    if (!canAccess) {
      showPaywall();
      return;
    }
    // Execute feature
  };

  return <Button onPress={handleAction} title="Use Feature" />;
}
```

### How do I use credits?

```typescript
import { useCreditsGate } from '@umituz/react-native-subscription';

function CreditFeature() {
  const { hasCredits, consumeCredit } = useCreditsGate({
    creditCost: 5,
    featureId: 'export',
  });

  const handleExport = async () => {
    if (!hasCredits) {
      showPurchasePrompt();
      return;
    }

    const result = await consumeCredit();
    if (result.success) {
      await exportData();
    }
  };

  return <Button onPress={handleExport} title="Export (5 credits)" />;
}
```

### How do I show a paywall?

```typescript
import { PaywallModal } from '@umituz/react-native-subscription';

function MyComponent() {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <>
      <Button onPress={() => setShowPaywall(true)} title="Upgrade" />

      <PaywallModal
        isVisible={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </>
  );
}
```

### How do I handle restore purchases?

```typescript
import { useRestorePurchase } from '@umituz/react-native-subscription';

function Settings() {
  const { restorePurchase, isLoading } = useRestorePurchase();

  const handleRestore = async () => {
    const result = await restorePurchase();

    if (result.success) {
      Alert.alert('Success', 'Purchase restored!');
    } else {
      Alert.alert('Error', result.error?.message);
    }
  };

  return (
    <Button onPress={handleRestore} title="Restore Purchase" />
  );
}
```

## Technical

### What's the architecture?

Domain-Driven Design (DDD) with clean architecture:

```
┌─────────────────────────┐
│   Presentation Layer    │  ← React Hooks & Components
├─────────────────────────┤
│   Application Layer     │  ← Use Cases & Ports
├─────────────────────────┤
│      Domain Layer       │  ← Entities & Business Logic
├─────────────────────────┤
│  Infrastructure Layer   │  ← Repositories & Services
└─────────────────────────┘
```

### Is it TypeScript?

Yes! Written entirely in TypeScript with full type safety.

### Does it work offline?

Partially:
- **Subscription status**: Requires network (from RevenueCat)
- **Credits**: Can work offline with Firebase offline support
- **Premium features**: Works with last known status

### How does it handle errors?

Graceful error handling:
- Errors returned in result objects
- Error callbacks available
- User-friendly error messages
- Detailed error logging in dev

## Pricing & Revenue

### How much does RevenueCat cost?

RevenueCat has a free tier:
- **Free**: Up to $10k monthly tracked revenue
- **Growth**: $0.59 per $1k tracked revenue (above $10k)
- See [RevenueCat Pricing](https://www.revenuecat.com/pricing)

### What platform fees apply?

- **Apple App Store**: 15-30% of purchases
- **Google Play Store**: 15-30% of purchases
- Note: This applies to all in-app purchases

### Can I use my own payment system?

No, for in-app purchases:
- **iOS**: Must use Apple In-App Purchase
- **Android**: Must use Google Play Billing

Exception: Web-based purchases (different rules apply)

## Testing

### How do I test purchases?

**iOS:**
1. Create sandbox tester in App Store Connect
2. Sign out of App Store on device
3. Use sandbox account to purchase
4. Test all flows (purchase, restore, cancel)

**Android:**
1. Add license testers in Google Play Console
2. Use test account to purchase
3. Test all flows

### Can I test in development?

Yes! Use RevenueCat test mode:
```typescript
const config = {
  revenueCatApiKey: __DEV__
    ? 'your_test_key'
    : 'your_production_key',
};
```

### How do I mock for unit tests?

```typescript
jest.mock('@umituz/react-native-subscription', () => ({
  usePremium: () => ({ isPremium: true }),
  useCredits: () => ({ credits: 100 }),
}));
```

## Troubleshooting

### Why is my subscription not showing?

Check:
1. RevenueCat dashboard for subscription
2. Entitlement ID matches
3. Product IDs match
4. Subscription is active in store

### Why are credits not working?

Check:
1. Firebase configured correctly
2. Firestore rules allow access
3. `configureCreditsRepository` called
4. Network connection available

### Why does purchase fail?

Common reasons:
1. Not using sandbox/test account
2. Product not found in store
3. App not signed correctly
4. Network connectivity issue

## Best Practices

### Should I use provider or manual init?

**Use Provider** (recommended):
```typescript
<SubscriptionProvider config={config}>
  <App />
</SubscriptionProvider>
```

**Manual init** (only if needed):
```typescript
await initializeSubscription(config);
```

### How do I handle user authentication?

```typescript
import { useAuthSubscriptionSync } from '@umituz/react-native-subscription';

function AuthManager() {
  const { user } = useAuth();
  const { syncSubscription, clearSubscription } = useAuthSubscriptionSync();

  useEffect(() => {
    if (user) {
      syncSubscription(user.uid);
    } else {
      clearSubscription();
    }
  }, [user?.uid]);
}
```

### Should I track analytics?

Yes! Track important events:
```typescript
import { usePaywallFeedback } from '@umituz/react-native-subscription';

const { trackEvent, trackPurchase } = usePaywallFeedback();

trackEvent('paywall_impression', { source: 'home' });
trackPurchase('premium_monthly', { revenue: 9.99 });
```

## Support

### Where can I get help?

- 📖 [Documentation](../README.md)
- 💬 [GitHub Discussions](https://github.com/umituz/react-native-subscription/discussions)
- 🐛 [Report Issues](https://github.com/umituz/react-native-subscription/issues)
- 📧 Email: umit@umituz.com

### How do I report bugs?

Create an issue on GitHub with:
1. Clear description
2. Steps to reproduce
3. Expected vs actual behavior
4. Environment details
5. Error logs

### How do I request features?

Create a GitHub issue with:
1. Feature description
2. Use case
3. Proposed solution
4. Alternatives considered

## More Questions?

Still have questions? Check:
- [Getting Started Guide](./GETTING_STARTED.md)
- [Advanced Usage](./ADVANCED_USAGE.md)
- [API Reference](./API_REFERENCE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

Or reach out directly:
- Email: umit@umituz.com
- GitHub: @umituz
