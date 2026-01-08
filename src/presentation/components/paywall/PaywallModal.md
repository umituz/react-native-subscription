# PaywallModal Component

Modal paywall component for subscription upgrade.

## Import

```typescript
import { PaywallModal } from '@umituz/react-native-subscription';
```

## Props

```typescript
interface PaywallModalProps {
  isVisible: boolean;
  onClose: () => void;
  config?: PaywallConfig;
  onPurchase?: (result: PurchaseResult) => void;
  isLoading?: boolean;
  translations?: PaywallTranslations;
  theme?: 'light' | 'dark';
}
```

## Basic Usage

```typescript
function PaywallExample() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <Button onPress={() => setIsVisible(true)} title="Show Paywall" />

      <PaywallModal
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
      />
    </>
  );
}
```

## Configuration

### Basic Config

```typescript
<PaywallModal
  isVisible={isVisible}
  onClose={handleClose}
  config={{
    title: 'Unlock Premium',
    description: 'Get unlimited access to all features',
    features: [
      { icon: '⭐', text: 'Unlimited Access' },
      { icon: '🚀', text: 'AI-Powered Tools' },
      { icon: '🛡️', text: 'Ad-Free Experience' },
    ],
  }}
/>
```

### Advanced Config

```typescript
const paywallConfig: PaywallConfig = {
  title: 'Go Premium',
  description: 'Join thousands of premium users',
  features: [
    {
      icon: '💎',
      text: 'Premium Content',
      description: 'Access exclusive articles and videos',
      highlight: true,
    },
    {
      icon: '⚡',
      text: 'Faster Processing',
      description: 'Get results in seconds, not minutes',
    },
    {
      icon: '💬',
      text: 'Priority Support',
      description: '24/7 dedicated support team',
    },
    {
      icon: '🎁',
      text: 'Exclusive Features',
      description: 'Early access to new features',
    },
  ],
  theme: 'dark',
  showCloseButton: true,
  closeOnBackdropPress: false,
};

<PaywallModal
  isVisible={isVisible}
  onClose={handleClose}
  config={paywallConfig}
/>
```

## Purchase Handling

### With Callback

```typescript
<PaywallModal
  isVisible={isVisible}
  onClose={handleClose}
  onPurchase={(result) => {
    if (result.success) {
      Alert.alert('Success', 'Welcome to Premium!');
      setIsVisible(false);
    } else {
      Alert.alert('Error', result.error?.message || 'Purchase failed');
    }
  }}
/>
```

### With Custom Handler

```typescript
function PaywallWithHandler() {
  const { handlePurchase, isLoading } = usePaywallActions();

  const onPurchase = async (pkg: Package) => {
    const result = await handlePurchase(pkg);

    if (result.success) {
      // Analytics
      analytics.track('purchase_completed', {
        packageId: pkg.identifier,
        revenue: pkg.product.price,
      });

      // Navigation
      navigation.goBack();

      // Success message
      Toast.show({
        type: 'success',
        text1: 'Purchase Successful!',
        text2: 'You are now a Premium user',
      });
    }

    return result;
  };

  return (
    <PaywallModal
      isVisible={isVisible}
      onClose={handleClose}
      onPurchase={onPurchase}
      isLoading={isLoading}
    />
  );
}
```

## Customization

### Custom Theme

```typescript
const customTheme = {
  colors: {
    primary: '#FF6B6B',
    background: '#1a1a1a',
    card: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#999999',
    border: '#3d3d3d',
  },
  fonts: {
    title: {
      fontSize: 28,
      fontWeight: 'bold',
    },
    body: {
      fontSize: 16,
    },
  },
  borderRadius: 16,
};

<PaywallModal
  isVisible={isVisible}
  onClose={handleClose}
  theme={customTheme}
/>
```

### Custom Package Display

```typescript
function CustomPaywall() {
  const { packages } = useSubscriptionPackages();

  return (
    <PaywallModal
      isVisible={isVisible}
      onClose={handleClose}
      config={{
        title: 'Choose Your Plan',
        packages: packages.map(pkg => ({
          identifier: pkg.identifier,
          title: pkg.product.title,
          description: pkg.product.description,
          price: pkg.product.priceString,
          popular: pkg.identifier.includes('annual'),
          savings: pkg.identifier.includes('annual')
            ? 'Save 33%'
            : undefined,
        })),
      }}
    />
  );
}
```

## A/B Testing

### Variant A

```typescript
const variantAConfig: PaywallConfig = {
  title: 'Unlock Premium',
  description: 'Get unlimited access',
  features: [
    { icon: '⭐', text: 'Unlimited Access' },
    { icon: '🚀', text: 'AI Tools' },
  ],
};

<PaywallModal
  config={variantAConfig}
  ...
/>
```

### Variant B

```typescript
const variantBConfig: PaywallConfig = {
  title: 'Join Premium Members',
  description: 'Over 10,000 users',
  features: [
    { icon: '💎', text: 'Premium Content' },
    { icon: '⚡', text: 'Priority Speed' },
    { icon: '💬', text: 'VIP Support' },
    { icon: '🎁', text: 'Exclusive Perks' },
  ],
};

<PaywallModal
  config={variantBConfig}
  ...
/>
```

## Translations

### Multi-Language Support

```typescript
const translations = {
  en: {
    title: 'Unlock Premium',
    subscribe: 'Subscribe Now',
    features: 'Features',
    restore: 'Restore Purchase',
    close: 'Close',
  },
  tr: {
    title: 'Premium\'e Geç',
    subscribe: 'Şimdi Abone Ol',
    features: 'Özellikler',
    restore: 'Satın Almayı Geri Yükle',
    close: 'Kapat',
  },
};

<PaywallModal
  translations={translations[userLanguage]}
  ...
/>
```

## Responsive Design

The modal is responsive and adapts to:

- **iPhone SE**: Compact layout
- **iPhone 14 Pro**: Standard layout
- **iPad**: Tablet-optimized layout
- **Landscape**: Adjusted spacing

## Performance

### Lazy Loading

```typescript
function LazyPaywall() {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <>
      <Button onPress={() => setShowPaywall(true)} />

      {showPaywall && (
        <PaywallModal
          isVisible={showPaywall}
          onClose={() => setShowPaywall(false)}
        />
      )}
    </>
  );
}
```

### Preloading Packages

```typescript
function PreloadedPaywall() {
  const { packages, isLoading } = useSubscriptionPackages({
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Preload packages before showing paywall
  useEffect(() => {
    if (!packages.length) {
      // Trigger background fetch
      refetch();
    }
  }, []);

  return (
    <PaywallModal
      isVisible={isVisible}
      config={{ packages }}
    />
  );
}
```

## Best Practices

1. **Track impressions** - Log when paywall is shown
2. **Track dismissals** - Log when and why users close
3. **Test different copy** - A/B test titles and features
4. **Use social proof** - Show user count or ratings
5. **Highlight savings** - Show annual savings
6. **Make it actionable** - Clear CTA buttons
7. **Handle orientation** - Test in landscape and portrait

## Complete Example

```typescript
function CompletePaywallFlow() {
  const { isPremium } = usePremium();
  const [isVisible, setIsVisible] = useState(false);
  const [paywallShown, setPaywallShown] = useState(false);

  // Auto-show after 3 actions
  const { actionCount } = useActionCounter();
  useEffect(() => {
    if (!isPremium && actionCount >= 3 && !paywallShown) {
      setIsVisible(true);
      setPaywallShown(true);

      analytics.track('auto_paywall_shown', {
        trigger: 'action_limit',
        actions: actionCount,
      });
    }
  }, [actionCount, isPremium, paywallShown]);

  const handlePurchase = async (result: PurchaseResult) => {
    if (result.success) {
      analytics.track('purchase_completed', {
        packageId: result.packageId,
        revenue: result.revenue,
        trigger: 'auto_paywall',
      });

      setIsVisible(false);

      Alert.alert(
        'Welcome to Premium!',
        'Thank you for subscribing.'
      );
    } else {
      analytics.track('purchase_failed', {
        error: result.error?.message,
        trigger: 'auto_paywall',
      });
    }
  };

  const handleClose = () => {
    const duration = Date.now() - paywallShownAt;
    analytics.track('paywall_closed', {
      duration,
      trigger: 'auto_paywall',
    });

    setIsVisible(false);
  };

  return (
    <PaywallModal
      isVisible={isVisible}
      onClose={handleClose}
      onPurchase={handlePurchase}
      config={{
        title: 'You\'re Awesome! 🎉',
        description: `${actionCount} actions completed. Upgrade for unlimited access!`,
        features: [
          { icon: '∞', text: 'Unlimited Actions', highlight: true },
          { icon: '⚡', text: 'Lightning Fast' },
          { icon: '🛡️', text: 'Ad-Free Experience' },
        ],
      }}
    />
  );
}
```

## Related Components

- **PaywallScreen** - Full-screen paywall
- **PremiumDetailsCard** - Premium status card
- **PaywallFeedbackModal** - Feedback collection

## See Also

- [Paywall Domain](../../../domains/paywall/README.md)
- [usePaywall Hooks](../../hooks/usePaywall.md)
- [Paywall README](../feedback/README.md)
