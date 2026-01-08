# Wallet Presentation Components

UI components for wallet and credit display.

## Overview

This directory contains React Native components for displaying credits, transactions, and wallet information.

## Components

### CreditBalanceCard
Card displaying current credit balance.

```typescript
interface CreditBalanceCardProps {
  credits: number;
  balance: number;
  isLoading?: boolean;
  onPress?: () => void;
  onRefresh?: () => void;
}
```

**Usage:**
```typescript
<CreditBalanceCard
  credits={50}
  balance={0.50}
  onPress={() => navigation.navigate('CreditHistory')}
  onRefresh={() => refetch()}
/>
```

### TransactionItem
Individual transaction display component.

```typescript
interface TransactionItemProps {
  transaction: Transaction;
  format?: 'full' | 'compact';
}
```

**Usage:**
```typescript
<TransactionItem
  transaction={{
    id: 'tx_123',
    amount: -5,
    reason: 'AI Generation',
    timestamp: new Date(),
    type: 'deduction',
  }}
  format="full"
/>
```

### CreditProgressBar
Progress bar showing credit usage.

```typescript
interface CreditProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  showPercentage?: boolean;
  height?: number;
}
```

**Usage:**
```typescript
<CreditProgressBar
  current={50}
  total={100}
  showLabel={true}
  showPercentage={true}
  height={8}
/>
```

### CreditPackageCard
Display card for purchasable credit packages.

```typescript
interface CreditPackageCardProps {
  package: {
    id: string;
    amount: number;
    price: number;
    bonus?: number;
    currency: string;
  };
  onPress: () => void;
  highlight?: boolean;
}
```

**Usage:**
```typescript
<CreditPackageCard
  package={{
    id: 'premium_credits',
    amount: 100,
    price: 9.99,
    bonus: 10,
    currency: 'USD',
  }}
  onPress={() => purchaseCredits('premium_credits')}
  highlight={true}
/>
```

## Usage Patterns

### Complete Credit Dashboard

```typescript
function CreditDashboard() {
  const { credits, transactions, isLoading, refetch } = useCredits();

  return (
    <ScrollView>
      <CreditBalanceCard
        credits={credits}
        balance={calculateBalance(credits)}
        onRefresh={refetch}
      />

      <View style={styles.section}>
        <Text style={styles.title}>Recent Transactions</Text>
        {transactions.slice(0, 10).map(tx => (
          <TransactionItem key={tx.id} transaction={tx} />
        ))}
      </View>

      <Button onPress={() => navigation.navigate('CreditPackages')}>
        Get More Credits
      </Button>
    </ScrollView>
  );
}
```

### Credit Warning Banner

```typescript
function LowCreditWarning() {
  const { credits } = useCredits();
  const warningThreshold = 20;

  if (credits > warningThreshold) return null;

  return (
    <Banner type={credits === 0 ? 'error' : 'warning'}>
      <Text>
        {credits === 0
          ? 'No credits remaining'
          : `Only ${credits} credits left`
        }
      </Text>
      <Button onPress={() => navigation.navigate('CreditPackages')}>
        Get More
      </Button>
    </Banner>
  );
}
```

### Credit History List

```typescript
function TransactionHistory() {
  const { transactions } = useCredits();

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TransactionItem transaction={item} format="compact" />
      )}
      ListHeaderComponent={() => (
        <Text style={styles.title}>Transaction History</Text>
      )}
      ListEmptyComponent={() => (
        <EmptyState
          icon="receipt"
          title="No transactions yet"
          message="Your credit transaction history will appear here"
        />
      )}
    />
  );
}
```

## Styling

Components use design system:

```typescript
import { useAppDesignTokens } from '@umituz/react-native-design-system';

const tokens = useAppDesignTokens();

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
  },
});
```

## Best Practices

1. **Visual Hierarchy**: Emphasize important information
2. **Color Coding**: Use colors to indicate status (low/warning/good)
3. **Loading States**: Show skeletons while loading
4. **Empty States**: Provide helpful empty state messages
5. **Refresh Capability**: Allow manual refresh
6. **Transactional History**: Show clear transaction history
7. **Purchase Links**: Easy access to purchase more credits

## Related

- [Credit Row](../../../presentation/components/details/CreditRow.md)
- [Credits Hook](../hooks/README.md)
- [Wallet Domain](../../domain/README.md)
