# PremiumDetailsCard Component

Premium subscription details card component.

## Import

```typescript
import { PremiumDetailsCard } from '@umituz/react-native-subscription';
```

## Props

```typescript
interface PremiumDetailsCardProps {
  status: SubscriptionStatus;
  onUpgradePress?: () => void;
  onManagePress?: () => void;
  style?: ViewStyle;
  translations?: PremiumDetailsCardTranslations;
}
```

## Props Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `status` | `SubscriptionStatus` | Yes | Subscription status object |
| `onUpgradePress` | `() => void` | No | Callback when upgrade button pressed |
| `onManagePress` | `() => void` | No | Callback when manage button pressed |
| `style` | `ViewStyle` | No | Custom container style |
| `translations` | `PremiumDetailsCardTranslations` | No | Custom translations |

## Basic Usage

```typescript
function MyScreen() {
  const { subscription } = usePremium();

  return (
    <PremiumDetailsCard
      status={subscription}
      onUpgradePress={() => console.log('Upgrade')}
      onManagePress={() => console.log('Manage')}
    />
  );
}
```

## Examples

### With Custom Translations

```typescript
<PremiumDetailsCard
  status={subscription}
  translations={{
    title: 'Premium',
    active: 'Aktif',
    inactive: 'Aktif Değil',
    expires: 'Son Kullanma',
    renews: 'Yenileniyor',
    manage: 'Yönet',
    upgrade: 'Yükselt',
    lifetime: 'Ömür Boyu',
  }}
/>
```

### With Custom Styling

```typescript
const customStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
  },
});

<PremiumDetailsCard
  status={subscription}
  style={customStyles.card}
  titleStyle={customStyles.title}
/>
```

### Without Buttons

```typescript
<PremiumDetailsCard
  status={subscription}
  showManageButton={false}
  showUpgradeButton={false}
/>
```

## Translations Interface

```typescript
interface PremiumDetailsCardTranslations {
  title?: string;           // 'Premium'
  status?: string;          // 'Active' or 'Inactive'
  expires?: string;         // 'Expires on'
  renews?: string;          // 'Renews on'
  manage?: string;          // 'Manage Subscription'
  upgrade?: string;         // 'Upgrade to Premium'
  lifetime?: string;        // 'Lifetime Access'
}
```

## Component Structure

```
PremiumDetailsCard
├── Container
│   ├── Header
│   │   ├── Title (Premium Badge)
│   │   └── Status (Active/Inactive)
│   ├── Details
│   │   ├── Expiration Date
│   │   ├── Renewal Status
│   │   └── Product Info
│   └── Footer
│       ├── Manage Button (if premium)
│       └── Upgrade Button (if free)
```

## Styling

### Default Styles

```typescript
const defaultStyles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  badge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
```

### Theme Customization

```typescript
const darkTheme = {
  container: {
    backgroundColor: '#1a1a1a',
  },
  title: {
    color: '#fff',
  },
  text: {
    color: '#ccc',
  },
};

<PremiumDetailsCard
  status={subscription}
  theme={darkTheme}
/>
```

## Accessibility

The component includes:

- ✅ Accessibility label
- ✅ Accessibility hint
- ✅ Screen reader support
- ✅ Minimum touch target size (44x44)

```typescript
<PremiumDetailsCard
  status={subscription}
  accessibilityLabel="Premium subscription details"
  accessibilityHint="Shows your premium subscription status and options"
/>
```

## Best Practices

1. **Provide callbacks** - Always handle upgrade/manage presses
2. **Show for premium users** - Display current subscription info
3. **Show for free users** - Encourage upgrade
4. **Update on purchase** - Refetch after subscription change
5. **Handle loading** - Show skeleton while loading

## Complete Example

```typescript
function SubscriptionScreen() {
  const { subscription, isLoading, refetch } = usePremium();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (isLoading) {
    return <PremiumDetailsCardSkeleton />;
  }

  if (!subscription?.isPremium) {
    return (
      <PremiumDetailsCard
        status={{
          type: 'free',
          isActive: false,
          isPremium: false,
        }}
        onUpgradePress={() => navigation.navigate('Paywall')}
      />
    );
  }

  return (
    <ScrollView>
      <PremiumDetailsCard
        status={subscription}
        onManagePress={handleManageSubscription}
      />

      {/* Additional premium features */}
      <PremiumFeaturesList />
    </ScrollView>
  );
}
```

## Related Components

- **PremiumStatusBadge** - Compact premium badge
- **SubscriptionSection** - Full subscription section
- **PaywallModal** - Upgrade paywall

## See Also

- [Details Components README](../details/README.md)
- [PremiumStatusBadge](./PremiumStatusBadge.md)
