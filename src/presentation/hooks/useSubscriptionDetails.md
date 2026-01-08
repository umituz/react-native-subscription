# useSubscriptionDetails Hook

Hook for accessing detailed subscription information including package details.

## Import

```typescript
import { useSubscriptionDetails } from '@umituz/react-native-subscription';
```

## Signature

```typescript
function useSubscriptionDetails(): {
  subscription: SubscriptionStatus | null;
  package: Package | null;
  period: PackagePeriod | null;
  price: number | null;
  pricePerMonth: number | null;
  features: string[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
```

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `subscription` | `SubscriptionStatus \| null` | Subscription status object |
| `package` | `Package \| null` | RevenueCat package object |
| `period` | `'monthly' \| 'annual' \| 'lifetime' \| null` | Subscription period |
| `price` | `number \| null` | Current price |
| `pricePerMonth` | `number \| null` | Monthly equivalent price |
| `features` | `string[] \| null` | List of features |
| `isLoading` | `boolean` | Loading state |
| `error` | `Error \| null` | Error if any |

## Basic Usage

```typescript
function SubscriptionDetails() {
  const {
    subscription,
    package,
    period,
    price,
    features,
    isLoading,
  } = useSubscriptionDetails();

  if (isLoading) return <ActivityIndicator />;

  return (
    <View>
      <Text>Plan: {package?.product.title}</Text>
      <Text>Price: {price} / {period}</Text>
      <Text>Features:</Text>
      {features?.map((feature, index) => (
        <Text key={index}>• {feature}</Text>
      ))}
    </View>
  );
}
```

## Advanced Usage

### Detailed Subscription Card

```typescript
function DetailedSubscriptionCard() {
  const {
    subscription,
    package,
    period,
    price,
    pricePerMonth,
    features,
  } = useSubscriptionDetails();

  if (!subscription || !package) return null;

  return (
    <Card>
      <Card.Title>
        {package.product.title}
      </Card.Title>

      <Card.Body>
        <DetailRow
          label="Status"
          value={subscription.isActive ? 'Active' : 'Inactive'}
        />

        <DetailRow
          label="Price"
          value={`${price} ${package?.product.currencyCode}`}
        />

        {period !== 'lifetime' && pricePerMonth && (
          <DetailRow
            label="Per Month"
            value={`${pricePerMonth.toFixed(2)} ${package?.product.currencyCode}`}
          />
        )}

        <Divider />

        <Text>Features:</Text>
        {features?.map((feature, index) => (
          <FeatureItem key={index} feature={feature} />
        ))}
      </Card.Body>
    </Card>
  );
}
```

### Price Comparison

```typescript
function PriceComparison() {
  const { price, period, pricePerMonth } = useSubscriptionDetails();

  if (!price || !period) return null;

  const monthlyPrices = {
    monthly: price,
    annual: pricePerMonth ? pricePerMonth * 12 : price,
  };

  return (
    <View>
      <Text>Total: ${price}</Text>
      <Text>Per Month: ${pricePerMonth?.toFixed(2) || 'N/A'}</Text>

      {period === 'annual' && (
        <SavingsBadge
          original={monthlyPrices.monthly * 12}
          current={price}
        />
      )}
    </View>
  );
}
```

### With Upgrade Suggestion

```typescript
function UpgradeSuggestion() {
  const {
    subscription,
    package: currentPackage,
    price,
  } = useSubscriptionDetails();

  const { packages: allPackages } = useSubscriptionPackages();

  // Find upgrade options
  const upgradeOptions = allPackages.filter(
    (pkg) =>
      pkg.product.price > (currentPackage?.product.price || 0)
  );

  if (!subscription?.isPremium) {
    return (
      <View>
        <Text>Upgrade to Premium for full access</Text>
        <Button
          onPress={() => navigation.navigate('Paywall')}
          title="View Plans"
        />
      </View>
    );
  }

  return (
    <View>
      <Text>Current Plan: {currentPackage?.product.title}</Text>
      <Button
        onPress={() => navigation.navigate('ManageSubscription')}
        title="Manage Subscription"
      />
    </View>
  );
}
```

### With Feature List

```typescript
function FeatureList() {
  const { features } = useSubscriptionDetails();

  if (!features) return null;

  const featureIcons = {
    'unlimited_access': '∞',
    'ai_tools': '🤖',
    'ad_free': '🛡️',
    'priority_support': '💬',
    'advanced_filters': '🔍',
  };

  return (
    <View>
      <Text style={styles.title}>Your Premium Features:</Text>

      {features.map((feature) => (
        <FeatureItem
          key={feature}
          icon={featureIcons[feature] || '✓'}
          text={formatFeatureName(feature)}
        />
      ))}
    </View>
  );
}
```

## Examples

### Subscription Info Screen

```typescript
function SubscriptionInfoScreen() {
  const {
    subscription,
    package,
    period,
    price,
    features,
    isLoading,
    refetch,
  } = useSubscriptionDetails();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!subscription || !package) {
    return (
      <View>
        <Text>No subscription found</Text>
        <Button
          onPress={() => navigation.navigate('Paywall')}
          title="Subscribe"
        />
      </View>
    );
  }

  return (
    <ScrollView>
      {/* Status Banner */}
      <StatusBanner
        isActive={subscription.isActive}
        type={subscription.type}
      />

      {/* Package Details */}
      <Card style={styles.section}>
        <Card.Title>Current Plan</Card.Title>
        <Card.Body>
          <Text style={styles.planName}>{package.product.title}</Text>
          <Text style={styles.price}>
            {price} {package.product.currencyCode}
          </Text>

          {period !== 'lifetime' && (
            <Text style={styles.period}>
              per {period.slice(0, -2)} // "month" -> "month"
            </Text>
          )}

          {subscription.expirationDate && (
            <Text style={styles.expires}>
              Renews on {new Date(subscription.expirationDate).toLocaleDateString()}
            </Text>
          )}
        </Card.Body>
      </Card>

      {/* Features */}
      {features && features.length > 0 && (
        <Card style={styles.section}>
          <Card.Title>Features</Card.Title>
          <Card.Body>
            {features.map((feature, index) => (
              <FeatureItem
                key={index}
                icon="✓"
                text={formatFeatureName(feature)}
              />
            ))}
          </Card.Body>
        </Card>
      )}

      {/* Actions */}
      <Card style={styles.section}>
        <Card.Body>
          <Button
            onPress={() => navigation.navigate('ManageSubscription')}
            title="Manage Subscription"
          />

          <Button
            onPress={refetch}
            title="Refresh"
            variant="outline"
          />
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
```

### Billing History

```typescript
function BillingHistory() {
  const { subscription, package, price } = useSubscriptionDetails();

  if (!subscription || !package) return null;

  const transactions = [
    {
      date: subscription.expirationDate,
      description: `Renewal - ${package.product.title}`,
      amount: price,
      status: 'completed',
    },
  ];

  return (
    <View>
      <Text style={styles.title}>Billing History</Text>

      {transactions.map((tx, index) => (
        <TransactionItem
          key={index}
          date={tx.date}
          description={tx.description}
          amount={tx.amount}
          status={tx.status}
        />
      ))}
    </View>
  );
}
```

### Cancellation Flow

```typescript
function CancellationFlow() {
  const { subscription, package, willRenew } = useSubscriptionDetails();

  const handleCancel = async () => {
    if (!willRenew) {
      Alert.alert('Info', 'Your subscription will not renew');
      return;
    }

    Alert.alert(
      'Cancel Subscription',
      'Your subscription will expire at the end of the current period',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            // Cancel with RevenueCat
            try {
              // Link to platform-specific subscription management
              if (Platform.OS === 'ios') {
                Linking.openURL('https://apps.apple.com/account/subscriptions');
              } else {
                Linking.openURL('https://play.google.com/store/account/subscriptions');
              }
            } catch (error) {
              Alert.alert('Error', 'Could not open subscription settings');
            }
          },
        },
      ]
    );
  };

  return (
    <View>
      <Text>Plan: {package?.product.title}</Text>
      <Text>Auto-renew: {willRenew ? 'Yes' : 'No'}</Text>

      <Button
        onPress={handleCancel}
        title="Cancel Subscription"
        color="#F44336"
      />
    </View>
  );
}
```

## Best Practices

1. **Handle null values** - Check if subscription and package exist
2. **Format prices** - Use currency formatters
3. **Display all info** - Show status, price, features
4. **Provide actions** - Add manage, cancel, upgrade buttons
5. **Refresh on focus** - Update when screen gains focus
6. **Handle errors** - Show user-friendly error messages
7. **Test different plans** - Monthly, annual, lifetime

## Related Hooks

- **useSubscription** - Basic subscription status
- **useSubscriptionStatus** - Detailed status
- **usePremium** - Simple premium check
- **useSubscriptionPackages** - Available packages

## See Also

- [useSubscriptionStatus](./useSubscriptionStatus.md)
- [Subscription Details Screen](../screens/README.md)
- [Package Utilities](../../../utils/README.md#package-utilities)
