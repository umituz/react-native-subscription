# DetailRow Component

Simple row component displaying a label-value pair for subscription details.

## Import

```typescript
import { DetailRow } from '@umituz/react-native-subscription';
```

## Signature

```typescript
interface DetailRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | **Required** | Row label (left side) |
| `value` | `string` | **Required** | Row value (right side) |
| `highlight` | `boolean` | `false` | Highlight value in warning color |
| `style` | `ViewStyle` | `undefined` | Container style override |
| `labelStyle` | `TextStyle` | `undefined` | Label text style override |
| `valueStyle` | `TextStyle` | `undefined` | Value text style override |

## Basic Usage

```typescript
function SubscriptionDetails() {
  return (
    <View>
      <DetailRow
        label="Status"
        value="Active"
      />
      <DetailRow
        label="Expires"
        value="January 15, 2025"
      />
      <DetailRow
        label="Purchased"
        value="January 15, 2024"
      />
    </View>
  );
}
```

## Advanced Usage

### With Highlight

```typescript
function ExpiringSoonRow() {
  const daysRemaining = 3;

  return (
    <DetailRow
      label="Expires"
      value={expirationDate.toLocaleDateString()}
      highlight={daysRemaining <= 7} // Highlight if expiring soon
    />
  );
}
```

### With Custom Styling

```typescript
function CustomDetailRow() {
  return (
    <DetailRow
      label="Subscription Type"
      value="Premium Yearly"
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F5F5F5',
      }}
      labelStyle={{
        fontWeight: '600',
        color: '#333',
      }}
      valueStyle={{
        fontWeight: '700',
        color: '#4CAF50',
      }}
    />
  );
}
```

### In Subscription Card

```typescript
function SubscriptionCard() {
  const { status, expirationDate, willRenew } = useSubscriptionStatus();

  return (
    <Card>
      <DetailRow
        label="Status"
        value={status.isActive ? 'Active' : 'Inactive'}
      />

      {expirationDate && (
        <DetailRow
          label="Expires"
          value={expirationDate.toLocaleDateString()}
          highlight={!willRenew}
        />
      )}

      <DetailRow
        label="Auto-renew"
        value={willRenew ? 'Enabled' : 'Disabled'}
      />
    </Card>
  );
}
```

## Color Options

### Default Colors

```typescript
// Label color (left side)
labelStyle = {
  color: tokens.colors.textSecondary, // Gray
}

// Value color (right side)
valueStyle = {
  color: tokens.colors.textPrimary, // Black
  fontWeight: '500',
}
```

### Highlight Colors

```typescript
// When highlight={true}
valueStyle = {
  color: tokens.colors.warning, // Orange/Yellow
  fontWeight: '500',
}
```

## Examples

### Subscription Info List

```typescript
function SubscriptionInfo() {
  const { status, expirationDate, purchaseDate, isLifetime } = useSubscriptionDetails();

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Subscription Details</Text>

      <DetailRow
        label="Plan"
        value={status.productId || 'Free'}
      />

      {status.isActive && !isLifetime && (
        <>
          {expirationDate && (
            <DetailRow
              label="Expires"
              value={expirationDate.toLocaleDateString()}
              highlight={true}
            />
          )}

          {purchaseDate && (
            <DetailRow
              label="Purchased"
              value={purchaseDate.toLocaleDateString()}
            />
          )}
        </>
      )}

      {isLifetime && (
        <DetailRow
          label="Type"
          value="Lifetime Access"
        />
      )}
    </View>
  );
}
```

### With Icons

```typescript
function IconDetailRow() {
  return (
    <View style={styles.row}>
      <Icon name="calendar" size={20} color="#666" />

      <DetailRow
        label="Expiration"
        value="December 31, 2025"
        style={{ flex: 1, marginLeft: 8 }}
      />
    </View>
  );
}
```

### Compact Layout

```typescript
function CompactDetails() {
  return (
    <View>
      <DetailRow
        label="Price"
        value="$9.99/month"
        style={{ paddingVertical: 4 }}
      />
      <DetailRow
        label="Duration"
        value="Monthly"
        style={{ paddingVertical: 4 }}
      />
      <DetailRow
        label="Features"
        value="Unlimited access"
        style={{ paddingVertical: 4 }}
      />
    </View>
  );
}
```

## Best Practices

1. **Use consistent labels** - Keep labels similar across screens
2. **Format values** - Ensure proper date/currency formatting
3. **Highlight wisely** - Only highlight important warnings
4. **Keep concise** - Don't make values too long
5. **Test layouts** - Verify display with different content lengths
6. **Localize labels** - Translate labels for i18n
7. **Match design system** - Use consistent spacing and colors

## Styling

```typescript
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // Add vertical padding for spacing between rows
    paddingVertical: 8,
  },
});
```

## Related Components

- **PremiumDetailsCard** - Uses this component internally
- **CreditRow** - Similar component for credit display
- **SubscriptionSection** - Section containing detail rows

## See Also

- [Subscription Details](../../hooks/useSubscriptionDetails.md)
- [Status Display](../../hooks/useSubscriptionStatus.md)
