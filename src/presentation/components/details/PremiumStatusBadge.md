# PremiumStatusBadge Component

Displays subscription status as a colored badge component.

## Import

```typescript
import { PremiumStatusBadge } from '@umituz/react-native-subscription';
```

## Signature

```typescript
interface PremiumStatusBadgeProps {
  status: SubscriptionStatusType;
  activeLabel: string;
  expiredLabel: string;
  noneLabel: string;
  canceledLabel: string;
}

type SubscriptionStatusType = 'active' | 'expired' | 'none' | 'canceled';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `SubscriptionStatusType` | **Required** | Current subscription status |
| `activeLabel` | `string` | **Required** | Label for active status |
| `expiredLabel` | `string` | **Required** | Label for expired status |
| `noneLabel` | `string` | **Required** | Label for no subscription |
| `canceledLabel` | `string` | **Required** | Label for canceled status |

## Basic Usage

```typescript
function SubscriptionStatus() {
  const { isPremium } = usePremium();

  return (
    <PremiumStatusBadge
      status={isPremium ? 'active' : 'none'}
      activeLabel="Active"
      expiredLabel="Expired"
      noneLabel="Free"
      canceledLabel="Canceled"
    />
  );
}
```

## Advanced Usage

### With Dynamic Status

```typescript
function DynamicStatusBadge() {
  const { status, isActive, isExpired } = useSubscriptionStatus();

  const getStatusType = (): SubscriptionStatusType => {
    if (!status) return 'none';
    if (isExpired) return 'expired';
    if (isActive) return 'active';
    return 'canceled';
  };

  return (
    <PremiumStatusBadge
      status={getStatusType()}
      activeLabel="Active"
      expiredLabel="Expired"
      noneLabel="Free"
      canceledLabel="Canceled"
    />
  );
}
```

### With Custom Labels

```typescript
function CustomStatusBadge() {
  const { isActive } = usePremium();

  return (
    <PremiumStatusBadge
      status={isActive ? 'active' : 'none'}
      activeLabel="✨ Premium"
      expiredLabel="⚠️ Expired"
      noneLabel="Free Tier"
      canceledLabel="❌ Canceled"
    />
  );
}
```

### With Localization

```typescript
function LocalizedStatusBadge() {
  const { t } = useTranslation();
  const { status } = useSubscriptionStatus();

  return (
    <PremiumStatusBadge
      status={status.type}
      activeLabel={t('subscription.status.active')}
      expiredLabel={t('subscription.status.expired')}
      noneLabel={t('subscription.status.free')}
      canceledLabel={t('subscription.status.canceled')}
    />
  );
}
```

## Badge Colors

The component automatically applies appropriate colors based on status:

| Status | Background Color | Text Color |
|--------|-----------------|------------|
| `active` | Success (green) | On-primary |
| `expired` | Error (red) | On-primary |
| `none` | Tertiary text | On-primary |
| `canceled` | Warning (orange) | On-primary |

## Examples

### In Header

```typescript
function SubscriptionHeader() {
  const { status } = useSubscriptionStatus();

  return (
    <View style={styles.header}>
      <Text style={styles.title}>My Subscription</Text>

      <PremiumStatusBadge
        status={status.type}
        activeLabel="Active"
        expiredLabel="Expired"
        noneLabel="Free"
        canceledLabel="Canceled"
      />
    </View>
  );
}
```

### With Icon

```typescript
function StatusWithIcon() {
  const { isActive } = usePremium();

  return (
    <View style={styles.container}>
      <Icon
        name={isActive ? 'check-circle' : 'circle'}
        size={20}
        color={isActive ? 'green' : 'gray'}
      />

      <PremiumStatusBadge
        status={isActive ? 'active' : 'none'}
        activeLabel="Active"
        expiredLabel="Expired"
        noneLabel="Free"
        canceledLabel="Canceled"
      />
    </View>
  );
}
```

### Status List

```typescript
function StatusList() {
  const statuses: SubscriptionStatusType[] = ['active', 'expired', 'none', 'canceled'];

  return (
    <View>
      {statuses.map((status) => (
        <View key={status} style={styles.row}>
          <Text>{status}</Text>

          <PremiumStatusBadge
            status={status}
            activeLabel="Active"
            expiredLabel="Expired"
            noneLabel="Free"
            canceledLabel="Canceled"
          />
        </View>
      ))}
    </View>
  );
}
```

### Compact Badge

```typescript
function CompactBadge() {
  const { isActive } = usePremium();

  return (
    <View style={styles.compactContainer}>
      <PremiumStatusBadge
        status={isActive ? 'active' : 'none'}
        activeLabel="Premium"
        expiredLabel="Expired"
        noneLabel="Free"
        canceledLabel="Canceled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  compactContainer: {
    transform: [{ scale: 0.85 }], // Smaller size
  },
});
```

## Styling

The badge uses design tokens for consistent styling:

```typescript
// Internal styles (simplified)
badge: {
  paddingHorizontal: tokens.spacing.sm,
  paddingVertical: tokens.spacing.xs,
  borderRadius: tokens.radius.xs,
  backgroundColor: statusColor, // Dynamic based on status
},
badgeText: {
  fontWeight: '600',
  color: tokens.colors.onPrimary,
}
```

## Best Practices

1. **Provide all labels** - Ensure all four status labels are provided
2. **Use consistent labels** - Keep labels consistent across app
3. **Localize labels** - Translate labels for i18n
4. **Check status first** - Determine correct status type
5. **Handle all states** - Cover active, expired, none, canceled
6. **Test colors** - Verify colors work with your theme

## Related Components

- **PremiumDetailsCard** - Uses this badge component
- **SubscriptionSection** - Displays badge in settings
- **DetailRow** - Displays status as detail row

## See Also

- [SubscriptionStatus Entity](../../../domain/entities/SubscriptionStatus.md)
- [Status Utilities](../../../utils/subscriptionUtils.md)
