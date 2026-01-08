# Advanced Usage Guide

Advanced patterns and best practices for using @umituz/react-native-subscription.

## Table of Contents

- [Custom Paywall Design](#custom-paywall-design)
- [Analytics Integration](#analytics-integration)
- [A/B Testing](#ab-testing)
- [Multi-language Support](#multi-language-support)
- [Custom Repositories](#custom-repositories)
- [Performance Optimization](#performance-optimization)
- [Error Handling](#error-handling)
- [Testing Strategies](#testing-strategies)

## Custom Paywall Design

### Custom Paywall Component

```typescript
import { PaywallContainer, usePaywallActions } from '@umituz/react-native-subscription';

function CustomPaywall() {
  const { packages, selectedPackage, handlePurchase, isLoading } = usePaywallActions();

  return (
    <PaywallContainer>
      <Header title="Unlock Premium" />

      <ScrollView>
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.identifier}
            package={pkg}
            selected={selectedPackage?.identifier === pkg.identifier}
            onPress={() => setSelectedPackage(pkg)}
          />
        ))}
      </ScrollView>

      <Footer>
        <Button
          onPress={handlePurchase}
          disabled={!selectedPackage || isLoading}
          title="Subscribe Now"
        />
      </Footer>
    </PaywallContainer>
  );
}
```

### A/B Test Different Paywalls

```typescript
function ABTestedPaywall() {
  const [variant, setVariant] = useState<'A' | 'B'>('A');

  useEffect(() => {
    // Determine variant (e.g., from Firebase Remote Config)
    const variant = RemoteConfig.getValue('paywall_variant').asString();
    setVariant(variant === 'B' ? 'B' : 'A');
  }, []);

  if (variant === 'A') {
    return <PaywallVariantA />;
  }

  return <PaywallVariantB />;
}
```

## Analytics Integration

### Track Subscription Events

```typescript
import { usePaywallFeedback } from '@umituz/react-native-subscription';
import analytics from '@react-native-firebase/analytics';

function PaywallWithTracking() {
  const { trackEvent, trackPurchase, trackDismiss } = usePaywallFeedback();

  useEffect(() => {
    // Track paywall impression
    trackEvent('paywall_impression', {
      source: 'home_screen',
      timestamp: new Date().toISOString(),
    });

    analytics().logEvent('paywall_viewed', {
      screen: 'home',
    });
  }, []);

  const handlePurchase = async () => {
    const result = await purchasePackage();

    if (result.success) {
      // Track purchase
      trackPurchase('premium_monthly', {
        revenue: 9.99,
        currency: 'USD',
        transactionId: result.transactionId,
      });

      await analytics().logPurchase({
        value: 9.99,
        currency: 'USD',
      });
    }
  };

  const handleClose = () => {
    trackDismiss('paywall_closed', {
      duration: 30,
    });
  };
}
```

### Custom Analytics Service

```typescript
class AnalyticsService {
  trackSubscriptionEvent(event: string, data: any) {
    // Send to your analytics backend
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ event, data }),
    });
  }

  trackPurchase(packageId: string, revenue: number) {
    this.trackSubscriptionEvent('purchase_completed', {
      packageId,
      revenue,
      timestamp: Date.now(),
    });
  }

  trackPaywallShown(source: string) {
    this.trackSubscriptionEvent('paywall_shown', {
      source,
      timestamp: Date.now(),
    });
  }
}

// Use with subscription hooks
const analyticsService = new AnalyticsService();

function MyComponent() {
  const { showPaywall } = usePaywall();

  const handleUpgradeClick = () => {
    analyticsService.trackPaywallShown('upgrade_button');
    showPaywall();
  };
}
```

## A/B Testing

### Feature Flag Integration

```typescript
import { useFeatureGate } from '@umituz/react-native-subscription';

function ABTestedFeature() {
  const { canAccess } = useFeatureGate({
    featureId: 'new_feature',
    requirements: {
      tier: 'premium',
    },
    featureFlag: 'enable_new_feature', // Remote config flag
  });

  if (!canAccess) {
    return <LockedFeature />;
  }

  return <NewFeature />;
}
```

### Remote Config Integration

```typescript
import RemoteConfig from '@react-native-firebase/remote-config';

function RemoteConfiguredPaywall() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    async function fetchConfig() {
      await RemoteConfig().fetchAndActivate();
      const paywallConfig = RemoteConfig().getValue('paywall_config').asString();
      setConfig(JSON.parse(paywallConfig));
    }

    fetchConfig();
  }, []);

  if (!config) return null;

  return <Paywall config={config} />;
}
```

## Multi-language Support

### Setup Translations

```typescript
import { usePaywallTranslations } from '@umituz/react-native-subscription';

const translations = {
  en: {
    title: 'Unlock Premium',
    subscribe: 'Subscribe Now',
    features: {
      unlimited: 'Unlimited Access',
      adfree: 'Ad-Free Experience',
      support: 'Priority Support',
    },
  },
  tr: {
    title: 'Premium\'e Geç',
    subscribe: 'Şimdi Abone Ol',
    features: {
      unlimited: 'Sınırsız Erişim',
      adfree: 'Reklamsız Deneyim',
      support: 'Öncelikli Destek',
    },
  },
  de: {
    title: 'Premium Freischalten',
    subscribe: 'Jetzt Abonnieren',
    features: {
      unlimited: 'Unbegrenzter Zugang',
      adfree: 'Werbefreie Erfahrung',
      support: 'Prioritäts-Support',
    },
  },
};

function LocalizedPaywall() {
  const { locale } = useLocale(); // Your locale hook
  const t = translations[locale] || translations.en;

  return (
    <PaywallModal
      title={t.title}
      subscribeText={t.subscribe}
      features={[
        { icon: '∞', text: t.features.unlimited },
        { icon: '🛡️', text: t.features.adfree },
        { icon: '💬', text: t.features.support },
      ]}
    />
  );
}
```

### i18n Integration

```typescript
import { useTranslation } from 'react-i18next';
import { PaywallModal } from '@umituz/react-native-subscription';

function I18nPaywall() {
  const { t } = useTranslation();

  return (
    <PaywallModal
      title={t('paywall.title')}
      description={t('paywall.description')}
      features={[
        {
          icon: 'star',
          text: t('paywall.features.unlimited'),
        },
      ]}
    />
  );
}
```

## Custom Repositories

### Custom Subscription Repository

```typescript
import type { ISubscriptionRepository } from '@umituz/react-native-subscription';

class CustomSubscriptionRepository implements ISubscriptionRepository {
  private api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  async getSubscriptionStatus(userId: string) {
    const response = await this.api.get(`/subscriptions/${userId}`);
    return response.data;
  }

  async saveSubscriptionStatus(userId: string, status: SubscriptionStatus) {
    await this.api.put(`/subscriptions/${userId}`, status);
  }

  async deleteSubscriptionStatus(userId: string) {
    await this.api.delete(`/subscriptions/${userId}`);
  }

  isSubscriptionValid(status: SubscriptionStatus): boolean {
    if (!status.isActive) return false;
    if (!status.expirationDate) return true;
    return new Date(status.expirationDate) > new Date();
  }

  // Real-time updates
  subscribeToStatus(
    userId: string,
    callback: (status: SubscriptionStatus) => void
  ): () => void {
    const websocket = new WebSocket(`wss://api.example.com/subscriptions/${userId}`);

    websocket.onmessage = (event) => {
      callback(JSON.parse(event.data));
    };

    return () => websocket.close();
  }
}

// Use custom repository
const customRepository = new CustomSubscriptionRepository(apiClient);

const service = new SubscriptionService({
  repository: customRepository,
});
```

### Custom Credits Repository

```typescript
import type { CreditsRepository } from '@umituz/react-native-subscription';

class RedisCreditsRepository implements CreditsRepository {
  private redis: RedisClient;

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async getCredits(userId: string): Promise<UserCredits> {
    const data = await this.redis.get(`credits:${userId}`);
    return JSON.parse(data);
  }

  async addCredits(
    userId: string,
    amount: number,
    reason: string
  ): Promise<CreditsResult> {
    const current = await this.getCredits(userId);
    const newBalance = current.balance + amount;

    await this.redis.set(`credits:${userId}`, JSON.stringify({
      balance: newBalance,
      lastUpdated: new Date().toISOString(),
    }));

    return {
      success: true,
      newBalance,
      transaction: {
        id: generateId(),
        amount,
        reason,
        timestamp: new Date().toISOString(),
      },
    };
  }

  async deductCredits(
    userId: string,
    amount: number,
    reason: string
  ): Promise<CreditsResult> {
    const current = await this.getCredits(userId);

    if (current.balance < amount) {
      return {
        success: false,
        error: 'Insufficient credits',
      };
    }

    const newBalance = current.balance - amount;

    await this.redis.set(`credits:${userId}`, JSON.stringify({
      balance: newBalance,
      lastUpdated: new Date().toISOString(),
    }));

    return {
      success: true,
      newBalance,
      transaction: {
        id: generateId(),
        amount: -amount,
        reason,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
```

## Performance Optimization

### Memoization

```typescript
import { useMemo, useCallback } from 'react';

function OptimizedPaywall() {
  const { packages } = useSubscriptionPackages();

  // Memoize expensive computations
  const sortedPackages = useMemo(() => {
    return packages.sort((a, b) => a.product.price - b.product.price);
  }, [packages]);

  // Memoize callbacks
  const handlePurchase = useCallback((pkg) => {
    purchasePackage(pkg);
  }, []);

  return (
    <FlatList
      data={sortedPackages}
      renderItem={({ item }) => (
        <PackageCard package={item} onPress={handlePurchase} />
      )}
    />
  );
}
```

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react';

const PaywallModal = lazy(() => import('./PaywallModal'));

function MyComponent() {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <>
      <Button onPress={() => setShowPaywall(true)} title="Upgrade" />

      {showPaywall && (
        <Suspense fallback={<ActivityIndicator />}>
          <PaywallModal onClose={() => setShowPaywall(false)} />
        </Suspense>
      )}
    </>
  );
}
```

### Query Optimization

```typescript
import { useSubscriptionPackages } from '@umituz/react-native-subscription';

function OptimizedSubscription() {
  const {
    packages,
    isLoading,
    refetch,
  } = useSubscriptionPackages({
    offeringId: 'default',
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  return (
    <View>
      <Button
        onPress={() => refetch({ cancelRefetch: false })}
        title="Refresh"
      />
      {/* ... */}
    </View>
  );
}
```

## Error Handling

### Global Error Handler

```typescript
import { SubscriptionProvider } from '@umituz/react-native-subscription';

function App() {
  const handleError = (error: Error) => {
    // Log to error tracking service
    crashlytics().recordError(error);

    // Show user-friendly message
    Alert.alert('Error', error.message);

    // Log to console in dev
    if (__DEV__) {
      console.error('Subscription error:', error);
    }
  };

  return (
    <SubscriptionProvider
      config={config}
      onError={handleError}
    >
      <YourApp />
    </SubscriptionProvider>
  );
}
```

### Retry Logic

```typescript
async function purchaseWithRetry(
  package: Package,
  maxRetries = 3
): Promise<PurchaseResult> {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await purchasePackage(package);
    } catch (error) {
      lastError = error;

      if (i < maxRetries - 1) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }
  }

  throw lastError;
}
```

### User-Friendly Error Messages

```typescript
function getErrorMessage(error: Error): string {
  if (error.code === 'PurchaseCancelled') {
    return 'Purchase was cancelled';
  }

  if (error.code === 'NetworkError') {
    return 'Please check your internet connection';
  }

  if (error.code === 'InvalidProduct') {
    return 'This product is not available';
  }

  return 'An error occurred. Please try again';
}
```

## Testing Strategies

### Unit Tests

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { usePremium } from '@umituz/react-native-subscription';

describe('usePremium', () => {
  it('should return premium status', async () => {
    const { result, waitFor } = renderHook(() => usePremium());

    await waitFor(() => {
      expect(result.current.isPremium).toBe(true);
    });
  });
});
```

### Integration Tests

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';

describe('Paywall Flow', () => {
  it('should complete purchase flow', async () => {
    const { getByText } = render(<PaywallScreen />);

    fireEvent.press(getByText('Subscribe'));

    await waitFor(() => {
      expect(getByText('Purchase Successful')).toBeTruthy();
    });
  });
});
```

### Mock RevenueCat

```typescript
import { Purchases } from 'react-native-purchases';

jest.mock('react-native-purchases', () => ({
  Purchases: {
    purchasePackage: jest.fn(),
    getOfferings: jest.fn(),
  },
}));

test('purchase flow', async () => {
  Purchases.purchasePackage.mockResolvedValue({
    transactionId: 'test-123',
  });

  // Test your component
});
```

## Best Practices

1. **Always show loading states** during async operations
2. **Provide clear error messages** to users
3. **Test different subscription states** (guest, free, premium)
4. **Handle edge cases** (network errors, cancelled purchases)
5. **Track important events** with analytics
6. **Cache subscription data** appropriately
7. **Use type safety** throughout your code
8. **Provide restore purchase** option
9. **Test on real devices** with sandbox accounts
10. **Keep paywalls simple** and focused

## More Resources

- [API Reference](./API_REFERENCE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Examples](../examples/)
