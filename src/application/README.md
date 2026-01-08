# Application Layer

Abonelik uygulamasının iş mantığını ve servis kontratlarını içeren katman.

## Sorumluluklar

- **Service Contracts**: Servis arayüzlerini tanımlama
- **Use Cases**: İş kullanım durumlarını gerçekleştirme
- **Business Logic**: Uygulama kurallarını yönetme

## Yapı

```
application/
├── ports/
│   ├── ISubscriptionService.ts    # Subscription servisi kontratı
│   └── ISubscriptionRepository.ts # Repository kontratı
└── [future use cases]
```

## Port Interfaces

### ISubscriptionService

Abonelik servisi için ana kontrat:

```typescript
interface ISubscriptionService {
  getStatus(userId: string): Promise<SubscriptionStatus | null>;
  activateSubscription(
    userId: string,
    productId: string,
    expiresAt: string | null
  ): Promise<SubscriptionStatus>;
  deactivateSubscription(userId: string): Promise<SubscriptionStatus>;
  isPremium(userId: string): Promise<boolean>;
}
```

**Kullanım:**

```typescript
import type { ISubscriptionService } from '@umituz/react-native-subscription';

class MyService {
  constructor(private subscriptionService: ISubscriptionService) {}

  async checkUserAccess(userId: string) {
    const isPremium = await this.subscriptionService.isPremium(userId);
    return isPremium;
  }
}
```

### ISubscriptionRepository

Abonelik verisi erişimi için kontrat:

```typescript
interface ISubscriptionRepository {
  getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null>;
  saveSubscriptionStatus(
    userId: string,
    status: SubscriptionStatus
  ): Promise<void>;
  deleteSubscriptionStatus(userId: string): Promise<void>;
  isSubscriptionValid(status: SubscriptionStatus): boolean;
}
```

**Kullanım:**

```typescript
import type { ISubscriptionRepository } from '@umituz/react-native-subscription';

class FirebaseRepository implements ISubscriptionRepository {
  async getSubscriptionStatus(userId: string) {
    // Firebase'den abonelik durumu getir
    const doc = await firestore().collection('subscriptions').doc(userId).get();
    return doc.data();
  }

  async saveSubscriptionStatus(userId: string, status: SubscriptionStatus) {
    // Firebase'e abonelik durumu kaydet
    await firestore().collection('subscriptions').doc(userId).set(status);
  }

  isSubscriptionValid(status: SubscriptionStatus): boolean {
    // Abonelik geçerliliğini kontrol et
    return status.isActive && !isExpired(status.expirationDate);
  }
}
```

## Dependency Injection

Application layer bağımlılıkları dependency injection ile alır:

```typescript
import { SubscriptionService } from '@umituz/react-native-subscription';

const subscriptionService = new SubscriptionService({
  repository: myRepository,
  onStatusChanged: (userId, newStatus) => {
    console.log(`User ${userId} status changed to ${newStatus.type}`);
  },
  onError: (error) => {
    console.error('Subscription error:', error);
  },
});
```

## Repository Implementation

Kendi repository'nizi oluşturun:

```typescript
import {
  type ISubscriptionRepository,
  SubscriptionStatus,
} from '@umituz/react-native-subscription';

class CustomRepository implements ISubscriptionRepository {
  constructor(private db: Database) {}

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
    const data = await this.db.query(
      'SELECT * FROM subscriptions WHERE user_id = ?',
      [userId]
    );
    return data ? SubscriptionStatus.parse(data) : null;
  }

  async saveSubscriptionStatus(
    userId: string,
    status: SubscriptionStatus
  ): Promise<void> {
    await this.db.execute(
      'INSERT OR REPLACE INTO subscriptions (user_id, status, expires_at) VALUES (?, ?, ?)',
      [userId, status.type, status.expirationDate]
    );
  }

  async deleteSubscriptionStatus(userId: string): Promise<void> {
    await this.db.execute(
      'DELETE FROM subscriptions WHERE user_id = ?',
      [userId]
    );
  }

  isSubscriptionValid(status: SubscriptionStatus): boolean {
    if (!status.isActive) return false;
    if (!status.expirationDate) return true; // Lifetime
    return new Date(status.expirationDate) > new Date();
  }
}
```

## Best Practices

1. **Interface Segregation**: Küçük, odaklanmış interface'ler tanımlayın
2. **Dependency Inversion**: High-level modüller low-level modüllere bağımlı olmamalı
3. **Single Responsibility**: Her service/repository tek bir sorumluluğa sahip olmalı
4. **Error Handling**: Hataları uygun şekilde handle edin ve yukarı传播 edin
5. **Testing**: Interface'ler mock ile kolay test edilebilir

## Örnek: Service Kullanımı

```typescript
import {
  SubscriptionService,
  type SubscriptionConfig,
} from '@umituz/react-native-subscription';

// Konfigürasyon
const config: SubscriptionConfig = {
  repository: myRepository,
  onStatusChanged: (userId, status) => {
    // Status değiştiğinde çalışacak callback
    analytics.track('subscription_status_changed', {
      userId,
      status: status.type,
    });
  },
  onError: (error) => {
    // Hata yönetimi
    crashlytics().recordError(error);
  },
};

// Service oluştur
const service = new SubscriptionService(config);

// Kullan
async function manageSubscription(userId: string) {
  // Durumu kontrol et
  const status = await service.getSubscriptionStatus(userId);
  console.log('Current status:', status?.type);

  // Premium kontrolü
  const isPremium = await service.isPremium(userId);
  if (!isPremium) {
    // Aboneliği aktifleştir
    await service.activateSubscription(
      userId,
      'com.app.premium.monthly',
      '2025-01-01T00:00:00Z'
    );
  }

  // Aboneliği iptal et
  // await service.deactivateSubscription(userId);
}
```

## Type Safety

Tüm interface'ler tam tip güvenliği sağlar:

```typescript
// ✓ Type-safe
const status: SubscriptionStatus = await service.getStatus(userId);

// ✗ Compile error
const wrong = await service.getStatus(123);

// ✓ Type-safe repository
const repository: ISubscriptionRepository = new MyRepository();
```
