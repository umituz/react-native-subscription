# Infrastructure Layer

Abonelik sisteminin dış dünya ile iletişimini sağlayan implementations ve repositories içeren katman.

## Sorumluluklar

- **Repositories**: Veri erişim implementasyonları
- **Services**: Dış servis entegrasyonları (Firebase, RevenueCat, vb.)
- **Managers**: Karmaşık operasyon yöneticileri
- **Handlers**: Özel durum ve event yöneticileri

## Yapı

```
infrastructure/
├── repositories/
│   └── CreditsRepositoryProvider.ts  # Kredi repository konfigürasyonu
├── services/
│   ├── SubscriptionService.ts        # Abonelik servisi implementasyonu
│   └── SubscriptionInitializer.ts    # Abonelik başlatıcı
└── [other implementations]
```

## Repositories

### CreditsRepositoryProvider

Kredi repository'sini konfigüre etmek ve yönetmek için:

```typescript
import {
  configureCreditsRepository,
  getCreditsRepository,
  getCreditsConfig,
  resetCreditsRepository,
  isCreditsRepositoryConfigured,
  type CreditsConfig,
} from '@umituz/react-native-subscription';

// Repository konfigürasyonu
const config: CreditsConfig = {
  initialCredits: 100,

  creditPackages: [
    {
      id: 'credits_small',
      productId: 'com.app.credits.small',
      amount: 100,
      price: 0.99,
      currency: 'USD',
    },
    {
      id: 'credits_medium',
      productId: 'com.app.credits.medium',
      amount: 500,
      price: 3.99,
      currency: 'USD',
    },
  ],

  creditCosts: {
    ai_generation: 1,
    ai_analysis: 2,
    premium_feature: 5,
  },

  expiration: {
    enabled: true,
    daysUntilExpiration: 365,
  },
};

// Repository'i konfigüre et
configureCreditsRepository({
  firebase: firebaseInstance,
  storage: storageInstance,
  config,
});

// Repository'e eriş
const repository = getCreditsRepository();
const creditsConfig = getCreditsConfig();

// Konfigürasyon kontrolü
if (isCreditsRepositoryConfigured()) {
  // Repository kullanıma hazır
}

// Reset (test için)
resetCreditsRepository();
```

### CreditsRepository

Kendi repository implementasyonunuzu oluşturun:

```typescript
import {
  createCreditsRepository,
  type CreditsRepository,
  type UserCredits,
  type CreditsResult,
} from '@umituz/react-native-subscription';

class MyCreditsRepository implements CreditsRepository {
  async getCredits(userId: string): Promise<UserCredits> {
    // Veritabanından kredi bilgilerini getir
    const doc = await db.collection('credits').doc(userId).get();
    return doc.data();
  }

  async addCredits(
    userId: string,
    amount: number,
    reason: string
  ): Promise<CreditsResult> {
    // Kredi ekle
    await db.collection('credits').doc(userId).update({
      balance: firebase.firestore.FieldValue.increment(amount),
      lastUpdated: new Date().toISOString(),
    });

    return {
      success: true,
      newBalance: currentBalance + amount,
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
    // Bakiye kontrolü
    const current = await this.getCredits(userId);
    if (current.balance < amount) {
      return {
        success: false,
        error: 'Insufficient credits',
      };
    }

    // Kredi düş
    await db.collection('credits').doc(userId).update({
      balance: firebase.firestore.FieldValue.increment(-amount),
      lastUpdated: new Date().toISOString(),
    });

    return {
      success: true,
      newBalance: current.balance - amount,
      transaction: {
        id: generateId(),
        amount: -amount,
        reason,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

// Repository oluştur ve kullan
const repository = new MyCreditsRepository();
```

## Services

### SubscriptionService

Abonelik servisi implementasyonu:

```typescript
import {
  SubscriptionService,
  initializeSubscriptionService,
  type SubscriptionConfig,
} from '@umituz/react-native-subscription';

// Manuel oluşturma
const service = new SubscriptionService({
  repository: myRepository,
  onStatusChanged: (userId, newStatus) => {
    console.log(`User ${userId}: ${newStatus.type}`);
  },
  onError: (error) => {
    console.error('Error:', error);
  },
});

// Helper ile başlatma
await initializeSubscriptionService({
  repository: myRepository,
  firebase: firebaseInstance,
  revenueCatApiKey: 'your_api_key',
});

// Kullanım
const status = await service.getSubscriptionStatus('user-123');
const isPremium = await service.isPremium('user-123');
```

### SubscriptionInitializer

Uygulamanın başında abonlik sistemini başlatmak için:

```typescript
import {
  initializeSubscription,
  type SubscriptionInitConfig,
  type CreditPackageConfig,
} from '@umituz/react-native-subscription';

const config: SubscriptionInitConfig = {
  revenueCatApiKey: process.env.REVENUECAT_API_KEY,
  revenueCatEntitlementId: 'premium',

  // Opsiyonel kredi konfigürasyonu
  creditPackages: [
    {
      id: 'small',
      productId: 'com.app.credits.100',
      amount: 100,
      price: 0.99,
    },
    {
      id: 'medium',
      productId: 'com.app.credits.500',
      amount: 500,
      price: 3.99,
    },
  ],

  // Callback'ler
  onInitialized: () => {
    console.log('Subscription system initialized');
  },
  onError: (error) => {
    console.error('Initialization error:', error);
  },
};

// Başlat
await initializeSubscription(config);
```

## Firebase Integration

### Firestore Repository

Firebase Firestore ile repository implementasyonu:

```typescript
import firestore from '@react-native-firebase/firestore';
import type { ISubscriptionRepository } from '@umituz/react-native-subscription';

class FirestoreSubscriptionRepository implements ISubscriptionRepository {
  private collection = firestore().collection('subscriptions');

  async getSubscriptionStatus(userId: string) {
    const doc = await this.collection.doc(userId).get();
    if (!doc.exists) return null;
    return doc.data();
  }

  async saveSubscriptionStatus(userId: string, status: any) {
    await this.collection.doc(userId).set(status, { merge: true });
  }

  async deleteSubscriptionStatus(userId: string) {
    await this.collection.doc(userId).delete();
  }

  isSubscriptionValid(status: any): boolean {
    if (!status.isActive) return false;
    if (!status.expirationDate) return true;
    return new Date(status.expirationDate) > new Date();
  }

  // Real-time updates
  subscribeToStatus(
    userId: string,
    callback: (status: any) => void
  ): () => void {
    const unsubscribe = this.collection
      .doc(userId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          callback(doc.data());
        }
      });

    return unsubscribe;
  }
}
```

## Error Handling

Infrastructure hatalarını yönetme:

```typescript
import {
  SubscriptionRepositoryError,
  SubscriptionValidationError,
} from '@umituz/react-native-subscription';

class SafeRepository {
  async getSubscriptionStatus(userId: string) {
    try {
      if (!userId || userId.length === 0) {
        throw new SubscriptionValidationError('Invalid user ID');
      }

      const data = await this.fetchFromDatabase(userId);

      if (!data) {
        return null;
      }

      return data;
    } catch (error) {
      if (error instanceof SubscriptionValidationError) {
        // Validation hatası
        console.error('Validation failed:', error.message);
        throw error;
      } else {
        // Beklenmedik hata
        throw new SubscriptionRepositoryError(
          'Failed to get subscription status',
          error
        );
      }
    }
  }
}
```

## Caching

Performans için caching implementasyonu:

```typescript
class CachedRepository {
  private cache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 dakika

  async getSubscriptionStatus(userId: string) {
    // Cache kontrolü
    const cached = this.cache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // Veritabanından getir
    const data = await this.fetchFromDatabase(userId);

    // Cache'e kaydet
    this.cache.set(userId, {
      data,
      timestamp: Date.now(),
    });

    return data;
  }

  invalidateCache(userId: string) {
    this.cache.delete(userId);
  }

  clearCache() {
    this.cache.clear();
  }
}
```

## Testing

Mock repository ile test:

```typescript
class MockSubscriptionRepository {
  private data = new Map<string, any>();

  async getSubscriptionStatus(userId: string) {
    return this.data.get(userId) || null;
  }

  async saveSubscriptionStatus(userId: string, status: any) {
    this.data.set(userId, status);
  }

  async deleteSubscriptionStatus(userId: string) {
    this.data.delete(userId);
  }

  isSubscriptionValid(status: any): boolean {
    return status?.isActive ?? false;
  }

  // Test helper
  __setTestData(userId: string, status: any) {
    this.data.set(userId, status);
  }

  __clearData() {
    this.data.clear();
  }
}

// Testlerde
const mockRepo = new MockSubscriptionRepository();
const service = new SubscriptionService({
  repository: mockRepo,
});

mockRepo.__setTestData('user-123', {
  type: 'premium',
  isActive: true,
  isPremium: true,
});

const status = await service.getSubscriptionStatus('user-123');
expect(status?.type).toBe('premium');
```

## Best Practices

1. **Dependency Injection**: Repository'leri constructor'da alın
2. **Error Handling**: Tüm hataları yakalayın ve uygun şekilde handle edin
3. **Caching**: Sık kullanılan verileri cache'leyin
4. **Validation**: Girdileri validate edin
5. **Logging**: Önemli operasyonları log'layın
6. **Testing**: Mock implementasyonlarla test edilebilir yapın
7. **Retry Logic**: Network hataları için retry logic ekleyin

## Örnek: Full Implementation

```typescript
import {
  SubscriptionService,
  type ISubscriptionRepository,
  SubscriptionStatus,
} from '@umituz/react-native-subscription';
import firestore from '@react-native-firebase/firestore';

class FirestoreRepository implements ISubscriptionRepository {
  private db = firestore();

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
    try {
      const doc = await this.db
        .collection('subscriptions')
        .doc(userId)
        .get();

      if (!doc.exists) return null;
      return doc.data() as SubscriptionStatus;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  async saveSubscriptionStatus(
    userId: string,
    status: SubscriptionStatus
  ): Promise<void> {
    try {
      await this.db
        .collection('subscriptions')
        .doc(userId)
        .set(status, { merge: true });
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  }

  async deleteSubscriptionStatus(userId: string): Promise<void> {
    try {
      await this.db
        .collection('subscriptions')
        .doc(userId)
        .delete();
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  }

  isSubscriptionValid(status: SubscriptionStatus): boolean {
    if (!status.isActive) return false;
    if (!status.expirationDate) return true;
    return new Date(status.expirationDate) > new Date();
  }
}

// Kullanım
const repository = new FirestoreRepository();
const service = new SubscriptionService({
  repository,
  onStatusChanged: (userId, status) => {
    console.log(`Status changed for ${userId}`);
  },
});

await service.activateSubscription('user-123', 'premium_monthly', null);
```
