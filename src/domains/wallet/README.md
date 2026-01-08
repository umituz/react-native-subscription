# Wallet Domain

Kredi bakiyesi yönetimi, işlem geçmişi takibi ve ürün metadata yönetimi için kapsamlı çözüm.

## Özellikler

- **Kredi Bakiyesi Yönetimi**: Kullanıcıların kredi bakiyelerini takip edin ve yönetin
- **İşlem Geçmişi**: Tüm kredi işlemlerini geçmişte takip edin
- **Ürün Metadata**: Satın alınan ürünler için metadata yönetimi
- **Tür Desteği**: Farklı kredi türlerini (AI, premium, vb.) destekleyin

## Kurulum

### 1. Service Konfigürasyonu

```typescript
import { configureProductMetadataService } from '@umituz/react-native-subscription';

// Service'i konfigüre edin
configureProductMetadataService({
  firebase: firebaseInstance,
  storage: storageInstance,
});
```

### 2. Repository Oluşturma

```typescript
import { createTransactionRepository } from '@umituz/react-native-subscription';

const transactionRepository = createTransactionRepository({
  firebase: firebaseInstance,
  userId: 'user-123',
});
```

## Kullanım

### useWallet Hook

Kredi bakiyesi ve temel cüzdan işlemleri için:

```typescript
import { useWallet } from '@umituz/react-native-subscription';

function MyComponent() {
  const { balance, loading, error, refresh } = useWallet({
    userId: 'user-123',
  });

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      <Text>Balance: {balance.credits}</Text>
      <Button onPress={refresh} title="Refresh" />
    </View>
  );
}
```

### useTransactionHistory Hook

İşlem geçmişini görüntülemek için:

```typescript
import { useTransactionHistory } from '@umituz/react-native-subscription';

function TransactionHistory() {
  const { transactions, loading, hasMore, loadMore } = useTransactionHistory({
    userId: 'user-123',
    limit: 20,
  });

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      onEndReached={hasMore ? loadMore : undefined}
      renderItem={({ item }) => (
        <View>
          <Text>{item.reason}</Text>
          <Text>{item.amount} credits</Text>
          <Text>{new Date(item.timestamp).toLocaleString()}</Text>
        </View>
      )}
    />
  );
}
```

### useProductMetadata Hook

Ürün metadata yönetimi için:

```typescript
import { useProductMetadata } from '@umituz/react-native-subscription';

function ProductInfo() {
  const { metadata, loading, updateMetadata } = useProductMetadata({
    userId: 'user-123',
    productId: 'premium_monthly',
  });

  const handleUpdate = async () => {
    await updateMetadata({
      lastUsed: new Date().toISOString(),
      usageCount: (metadata?.usageCount || 0) + 1,
    });
  };

  return (
    <View>
      <Text>Product: {metadata?.productId}</Text>
      <Text>Usage: {metadata?.usageCount} times</Text>
      <Button onPress={handleUpdate} title="Update Usage" />
    </View>
  );
}
```

## Bileşenler

### BalanceCard

Kredi bakiyesini gösteren kart bileşeni:

```typescript
import { BalanceCard } from '@umituz/react-native-subscription';

<BalanceCard
  balance={150}
  currency="USD"
  translations={{
    title: "Your Balance",
    subtitle: "Credits available",
  }}
/>
```

### TransactionItem

Tek işlem öğesi:

```typescript
import { TransactionItem } from '@umituz/react-native-subscription';

<TransactionItem
  transaction={{
    id: 'tx-123',
    amount: -50,
    reason: 'purchase',
    timestamp: '2024-01-01T00:00:00Z',
  }}
  translations={{
    purchase: 'Purchase',
    refund: 'Refund',
  }}
/>
```

### TransactionList

İşlem listesi bileşeni:

```typescript
import { TransactionList } from '@umituz/react-native-subscription';

<TransactionList
  transactions={transactions}
  loading={loading}
  onEndReached={loadMore}
  translations={{
    title: 'Transaction History',
    empty: 'No transactions yet',
  }}
/>
```

### WalletScreen

Tam cüzdan ekranı:

```typescript
import { WalletScreen } from '@umituz/react-native-subscription';

<WalletScreen
  userId="user-123"
  config={{
    showBalance: true,
    showHistory: true,
    enableRefresh: true,
  }}
  translations={{
    title: 'My Wallet',
    balance: 'Balance',
    history: 'History',
  }}
/>
```

## API Referansı

### Tip Tanımlamaları

```typescript
interface CreditBalance {
  credits: number;
  lastUpdated: string;
}

interface TransactionLog {
  id: string;
  amount: number;
  reason: TransactionReason;
  timestamp: string;
  metadata?: Record<string, any>;
}

type TransactionReason =
  | 'purchase'
  | 'refund'
  | 'usage'
  | 'bonus'
  | 'expiration';
```

### Yardımcı Fonksiyonlar

```typescript
// Kredi maliyeti hesaplama
import { getCreditCost, creditsToDollars } from '@umituz/react-native-subscription';

const cost = getCreditCost('ai_generation'); // AI işlem maliyeti
const dollars = creditsToDollars(150, 0.01); // 150 kredi = $1.50
```

## Hata Yönetimi

```typescript
import {
  WalletError,
  CreditLimitError,
  handleWalletError,
} from '@umituz/react-native-subscription';

try {
  // İşlem
} catch (error) {
  if (error instanceof CreditLimitError) {
    console.log('Yetersiz bakiye');
  }
  handleWalletError(error);
}
```

## Örnek Uygulama

```typescript
import React from 'react';
import { View, Text, Button } from 'react-native';
import {
  useWallet,
  useTransactionHistory,
  BalanceCard,
  TransactionList,
} from '@umituz/react-native-subscription';

export default function WalletExample() {
  const { balance, refresh } = useWallet({ userId: 'user-123' });
  const { transactions, loading } = useTransactionHistory({
    userId: 'user-123',
  });

  return (
    <View>
      <BalanceCard balance={balance} />
      <Button title="Refresh" onPress={refresh} />
      <TransactionList transactions={transactions} loading={loading} />
    </View>
  );
}
```

## Best Practices

1. **Kredi Türleri**: Farklı kredi türleri için farklı cost config'leri kullanın
2. **Hata Yönetimi**: Tüm işlemleri try-catch blokları içinde sarın
3. **Loading State**: Yüklenme durumlarını her zaman gösterin
4. **Refresh**: Kullanıcıya manuel refresh imkanı verin
5. **Transaction Log**: Tüm işlemleri loglayın ve audit trail tutun
