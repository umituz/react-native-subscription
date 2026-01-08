# RevenueCat Integration

RevenueCat ile abonelik yönetimi için kapsamlı entegrasyon ve API wrapper.

## Özellikler

- **Otomatik Başlatma**: RevenueCat SDK otomatik başlatma ve konfigürasyon
- **User ID Yönetimi**: Auth sistemleriyle entegre user ID yönetimi
- **Purchase Flow**: Satın alma işlemleri için yönetilen flow
- **Restore İşlemi**: Satın alma geri yükleme desteği
- **Customer Info**: Kullanıcı abonelik bilgilerini takip
- **Error Handling**: RevenueCat hatalarını yönetme

## Kurulum

### 1. RevenueCat SDK Kurulumu

```bash
npm install react-native-purchases
# veya
yarn add react-native-purchases
```

### 2. Başlatma

```typescript
import {
  initializeSubscription,
  SubscriptionInitConfig,
} from '@umituz/react-native-subscription';

const config: SubscriptionInitConfig = {
  revenueCatApiKey: 'your_api_key',
  revenueCatEntitlementId: 'premium',

  // Opsiyonel
  userDefaultsSuiteName: 'app.revenuecat',
  diagnosticsEnabled: __DEV__,
};

await initializeSubscription(config);
```

### 3. Provider ile Kullanım

```typescript
import { SubscriptionProvider } from '@umituz/react-native-subscription';

function App() {
  return (
    <SubscriptionProvider config={config}>
      <YourApp />
    </SubscriptionProvider>
  );
}
```

## Hooks

### useRevenueCat

RevenueCat'e erişim ve temel işlemler için:

```typescript
import { useRevenueCat } from '@umituz/react-native-subscription';

function RevenueCatExample() {
  const {
    isReady,
    isInitialized,
    error,
    purchaserInfo,
    offerings,
  } = useRevenueCat();

  if (!isInitialized) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <Text>Status: {isReady ? 'Ready' : 'Loading'}</Text>
    </View>
  );
}
```

### useCustomerInfo

Kullanıcı abonelik bilgileri için:

```typescript
import { useCustomerInfo } from '@umituz/react-native-subscription';

function SubscriptionStatus() {
  const {
    customerInfo,
    isLoading,
    error,
    refetch,
  } = useCustomerInfo();

  if (isLoading) return <ActivityIndicator />;

  const entitlement = customerInfo?.entitlements.active['premium'];

  return (
    <View>
      <Text>
        Status: {entitlement ? 'Premium' : 'Free'}
      </Text>
      {entitlement && (
        <Text>
          Expires: {new Date(entitlement.expirationDate).toLocaleDateString()}
        </Text>
      )}
      <Button onPress={refetch} title="Refresh" />
    </View>
  );
}
```

### useInitializeSubscription

Başlatma durumu kontrolü için:

```typescript
import { useInitializeSubscription } from '@umituz/react-native-subscription';

function InitCheck() {
  const {
    isInitialized,
    isInitializing,
    error,
    initialize,
  } = useInitializeSubscription();

  useEffect(() => {
    if (!isInitialized && !isInitializing) {
      initialize();
    }
  }, []);

  if (isInitializing) {
    return <Text>Initializing...</Text>;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return <Text>Ready!</Text>;
}
```

### useSubscriptionPackages

Mevcut abonelik paketleri için:

```typescript
import { useSubscriptionPackages } from '@umituz/react-native-subscription';

function PackageList() {
  const {
    packages,
    offerings,
    isLoading,
    error,
  } = useSubscriptionPackages({
    offeringId: 'default',
  });

  if (isLoading) return <ActivityIndicator />;

  return (
    <ScrollView>
      {packages.map((pkg) => (
        <PackageCard
          key={pkg.identifier}
          package={pkg}
          onPress={() => handlePurchase(pkg)}
        />
      ))}
    </ScrollView>
  );
}
```

### usePaywallFlow

Tam paywall flow'u için:

```typescript
import { usePaywallFlow } from '@umituz/react-native-subscription';

function Paywall() {
  const {
    packages,
    selectedPackage,
    isLoading,
    error,
    selectPackage,
    purchaseSelectedPackage,
    restorePurchases,
  } = usePaywallFlow();

  const handlePurchase = async () => {
    try {
      const result = await purchaseSelectedPackage();

      if (result.success) {
        Alert.alert('Success', 'You are now a premium user!');
      } else {
        Alert.alert('Error', result.error?.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Purchase failed');
    }
  };

  return (
    <View>
      {packages.map((pkg) => (
        <TouchableOpacity
          key={pkg.identifier}
          onPress={() => selectPackage(pkg)}
          style={selectedPackage?.identifier === pkg.identifier &&
            styles.selected
          }
        >
          <Text>{pkg.product.title}</Text>
          <Text>{pkg.product.priceString}</Text>
        </TouchableOpacity>
      ))}

      <Button
        onPress={handlePurchase}
        disabled={!selectedPackage || isLoading}
        title="Subscribe"
      />

      <Button
        onPress={restorePurchases}
        disabled={isLoading}
        title="Restore"
      />
    </View>
  );
}
```

### useRestorePurchase

Satın alma geri yükleme için:

```typescript
import { useRestorePurchase } from '@umituz/react-native-subscription';

function RestoreButton() {
  const { restorePurchase, isLoading, error, isRestored } = useRestorePurchase();

  const handleRestore = async () => {
    const result = await restorePurchase();

    if (result.success) {
      Alert.alert('Success', 'Purchase restored!');
    } else {
      Alert.alert('Error', result.error?.message || 'Restore failed');
    }
  };

  return (
    <Button
      onPress={handleRestore}
      disabled={isLoading}
      title={isLoading ? 'Restoring...' : 'Restore Purchase'}
    />
  );
}
```

## Hata Yönetimi

### RevenueCatError

```typescript
import {
  RevenueCatError,
  ErrorCode,
  handleRevenueCatError,
} from '@umituz/react-native-subscription';

try {
  await purchasePackage(packageToPurchase);
} catch (error) {
  if (error instanceof RevenueCatError) {
    switch (error.code) {
      case ErrorCode.PurchaseCancelledError:
        console.log('User cancelled');
        break;
      case ErrorCode.PurchaseInvalidError:
        console.log('Invalid purchase');
        break;
      case ErrorCode.NetworkError:
        console.log('Network error');
        break;
      default:
        handleRevenueCatError(error);
    }
  }
}
```

## User ID Yönetimi

### Auth ile Entegrasyon

```typescript
import { useAuthSubscriptionSync } from '@umituz/react-native-subscription';

function AuthSync() {
  const { user } = useAuth();
  const { syncUserId, clearUserId } = useAuthSubscriptionSync();

  useEffect(() => {
    if (user?.uid) {
      // Kullanıcı giriş yaptığında
      syncUserId(user.uid);
    } else {
      // Kullanıcı çıkış yaptığında
      clearUserId();
    }
  }, [user?.uid]);

  return null;
}
```

### Manuel User ID

```typescript
import { configureUserId } from '@umituz/react-native-subscription';

// Kullanıcı giriş yaptığında
await configureUserId('user-123');

// Kullanıcı çıkış yaptığında
await configureUserId(null); // veya await resetUserId()
```

## API Key Çözümleme

### Environment Bazlı API Keys

```typescript
import {
  ApiKeyResolver,
  resolveApiKey,
} from '@umituz/react-native-subscription';

const apiKeyResolver = new ApiKeyResolver({
  development: 'dev_api_key',
  production: 'prod_api_key',
});

const apiKey = apiKeyResolver.resolve(__DEV__ ? 'development' : 'production');
```

## SubscriptionManager

Gelişmiş işlemler için SubscriptionManager kullanımı:

```typescript
import { SubscriptionManager } from '@umituz/react-native-subscription';

const manager = new SubscriptionManager(config);

// Başlatma
await manager.initialize(userId);

// Satın alma
const result = await manager.purchasePackage(packageToPurchase);

// Geri yükleme
const restoreResult = await manager.restorePurchases();

// Customer info
const info = await manager.getCustomerInfo();

// Offerings
const offerings = await manager.getOfferings();
```

## Best Practices

1. **User ID Sync**: Auth sistemiyle user ID'leri her zaman senkronize edin
2. **Error Handling**: TümRevenueCat işlemlerinde hata yönetimi kullanın
3. **Loading States**: Kullanıcıya uygun loading feedback'i verin
4. **Restore**: Her zaman "Restore Purchase" seçeneği sunun
5. **Test Mode**: Geliştirme sırasında test mode kullanın
6. **Debug Mode**: Production'da debug modu kapalı tutun

## Örnek Uygulama

```typescript
import React, { useEffect } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import {
  usePaywallFlow,
  useCustomerInfo,
  useRestorePurchase,
} from '@umituz/react-native-subscription';

export default function SubscriptionScreen() {
  const {
    packages,
    selectedPackage,
    isLoading,
    selectPackage,
    purchaseSelectedPackage,
  } = usePaywallFlow();

  const { customerInfo, isLoading: infoLoading } = useCustomerInfo();
  const { restorePurchase } = useRestorePurchase();

  const entitlement = customerInfo?.entitlements.active['premium'];

  const handleSubscribe = async () => {
    if (!selectedPackage) return;

    try {
      const result = await purchaseSelectedPackage();

      if (result.success) {
        Alert.alert('Success', 'Welcome to Premium!');
      } else {
        Alert.alert('Error', result.error?.message || 'Purchase failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  if (isLoading || infoLoading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      {entitlement ? (
        <>
          <Text>You are Premium!</Text>
          <Text>
            Expires: {new Date(entitlement.expirationDate).toLocaleDateString()}
          </Text>
        </>
      ) : (
        <>
          <Text>Choose your plan:</Text>
          {packages.map((pkg) => (
            <TouchableOpacity
              key={pkg.identifier}
              onPress={() => selectPackage(pkg)}
              style={
                selectedPackage?.identifier === pkg.identifier &&
                styles.selected
              }
            >
              <Text>{pkg.product.title}</Text>
              <Text>{pkg.product.priceString}</Text>
              <Text>{pkg.product.description}</Text>
            </TouchableOpacity>
          ))}

          <Button
            onPress={handleSubscribe}
            disabled={!selectedPackage || isLoading}
            title="Subscribe"
          />

          <Button onPress={restorePurchase} title="Restore" />
        </>
      )}
    </View>
  );
}
```

## Tip Tanımlamaları

```typescript
interface RevenueCatConfig {
  apiKey: string;
  entitlements: {
    premium: string;
  };
  userDefaultsSuiteName?: string;
  diagnosticsEnabled?: boolean;
}

interface PurchaseResult {
  success: boolean;
  error?: Error;
  customerInfo?: CustomerInfo;
}

interface CustomerInfo {
  entitlements: {
    active: Record<string, EntitlementInfo>;
    all: Record<string, EntitlementInfo>;
  };
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  latestExpirationDate: string;
}

interface Package {
  identifier: string;
  packageType: PACKAGE_TYPE;
  product: Product;
  offeringIdentifier: string;
}
```
