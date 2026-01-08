# Domain Layer

Abonelik sisteminin temel domain logic'ini, entity'lerini ve value object'lerini içeren katman.

## Sorumluluklar

- **Entities**: Domain entity'lerini tanımlama
- **Value Objects**: Değer objelerini oluşturma
- **Domain Errors**: Domain-specific hataları tanımlama
- **Business Rules**: İş kurallarını encapsulate etme

## Yapı

```
domain/
├── entities/
│   └── SubscriptionStatus.ts      # Abonelik durumu entity'si
├── value-objects/
│   └── SubscriptionConfig.ts      # Konfigürasyon value object
└── errors/
    ├── SubscriptionError.ts       # Abonelik hataları
    └── InsufficientCreditsError.ts # Kredi yetersizlik hatası
```

## Entities

### SubscriptionStatus

Kullanıcının abonelik durumunu temsil eden ana entity:

```typescript
import {
  SubscriptionStatus,
  SubscriptionStatusType,
  createDefaultSubscriptionStatus,
  isSubscriptionValid,
} from '@umituz/react-native-subscription';

// Varsayılan durum oluştur
const defaultStatus = createDefaultSubscriptionStatus();
// {
//   type: 'unknown',
//   isActive: false,
//   isPremium: false,
//   expirationDate: null,
//   willRenew: false,
// }

// Premium durumu oluştur
const premiumStatus: SubscriptionStatus = {
  type: 'premium',
  isActive: true,
  isPremium: true,
  expirationDate: '2025-12-31T23:59:59Z',
  willRenew: true,
  productId: 'com.app.premium.annual',
};

// Abonelik geçerliliğini kontrol et
const isValid = isSubscriptionValid(premiumStatus); // true
```

**SubscriptionStatusType:**

```typescript
type SubscriptionStatusType =
  | 'unknown'      // Durum bilinmiyor
  | 'guest'        // Misafir kullanıcı
  | 'free'         // Free kullanıcı
  | 'premium';     // Premium kullanıcı
```

## Value Objects

### SubscriptionConfig

Abonelik konfigürasyonu için value object:

```typescript
import type { SubscriptionConfig } from '@umituz/react-native-subscription';

const config: SubscriptionConfig = {
  revenueCatApiKey: 'your_api_key',
  revenueCatEntitlementId: 'premium',

  plans: {
    monthly: monthlyPlan,
    annual: annualPlan,
  },

  defaultPlan: 'monthly',

  features: {
    requireAuth: true,
    allowRestore: true,
    syncWithFirebase: true,
  },

  ui: {
    showAnnualDiscount: true,
    highlightPopularPlan: true,
  },

  // Optional callbacks
  onStatusChanged: (userId, newStatus) => {
    console.log(`Status changed for ${userId}:`, newStatus);
  },

  onError: (error) => {
    console.error('Subscription error:', error);
  },
};
```

## Domain Errors

### SubscriptionError

Abonelik işlemleri için hata sınıfı:

```typescript
import {
  SubscriptionError,
  SubscriptionValidationError,
  SubscriptionRepositoryError,
} from '@umituz/react-native-subscription';

// Doğrulama hatası
throw new SubscriptionValidationError('Invalid user ID');

// Repository hatası
throw new SubscriptionRepositoryError('Database connection failed');

// Genel hata
throw new SubscriptionError('Subscription operation failed');
```

### InsufficientCreditsError

Kredi yetersizliği hatası:

```typescript
import {
  InsufficientCreditsError,
  type CreditErrorContext,
} from '@umituz/react-native-subscription';

const context: CreditErrorContext = {
  required: 10,
  available: 5,
  featureId: 'ai_generation',
  currency: 'USD',
};

throw new InsufficientCreditsError(
  'Not enough credits',
  context
);

// Hata yakalama
try {
  await deductCredits(userId, 10);
} catch (error) {
  if (error instanceof InsufficientCreditsError) {
    console.log(`Required: ${error.context.required}`);
    console.log(`Available: ${error.context.available}`);
    // Paywall göster
    showPaywall();
  }
}
```

## Helper Functions

### SubscriptionStatus Helpers

```typescript
import {
  createDefaultSubscriptionStatus,
  isSubscriptionValid,
  isSubscriptionActive,
  isUserPremium,
  getSubscriptionTier,
} from '@umituz/react-native-subscription';

// Varsayılan durum oluştur
const status = createDefaultSubscriptionStatus();

// Geçerlilik kontrolü
const isValid = isSubscriptionValid(status);

// Aktif kontrolü
const isActive = isSubscriptionActive(status);

// Premium kontrolü
const isPremium = isUserPremium(status);

// Tier bilgisi
const tier = getSubscriptionTier(status); // 'free', 'premium'
```

## Factory Functions

### Entity Factory

```typescript
import { SubscriptionStatus } from '@umituz/react-native-subscription';

// Factory method ile oluştur
const status = SubscriptionStatus.create({
  type: 'premium',
  isActive: true,
  isPremium: true,
  expirationDate: '2025-12-31T23:59:59Z',
  willRenew: true,
});

// Validation içerir
try {
  const invalid = SubscriptionStatus.create({
    type: 'premium',
    isActive: false, // Çelişki: premium ama aktif değil
    isPremium: true,
  });
} catch (error) {
  console.error('Validation error:', error.message);
}
```

## Type Guards

Domain entities için type guard'lar:

```typescript
import {
  isSubscriptionStatus,
  isValidSubscriptionStatus,
} from '@umituz/react-native-subscription';

// Type guard
const obj = { type: 'premium', isActive: true, isPremium: true };

if (isSubscriptionStatus(obj)) {
  // obj artık SubscriptionStatus tipinde
  console.log(obj.type); // Type-safe!
}

// Validasyon + type guard
if (isValidSubscriptionStatus(obj)) {
  // Geçerli bir SubscriptionStatus
}
```

## Domain Rules

### Business Rule Examples

```typescript
import { SubscriptionStatus } from '@umituz/react-native-subscription';

class SubscriptionDomain {
  // Kural: Premium kullanıcı her zaman aktif olmalı
  static validatePremiumStatus(status: SubscriptionStatus): boolean {
    if (status.isPremium && !status.isActive) {
      throw new Error('Premium users must be active');
    }
    return true;
  }

  // Kural: Abonelik tarihi geçmişse aktif olmamalı
  static validateExpiration(status: SubscriptionStatus): boolean {
    if (status.expirationDate) {
      const isExpired = new Date(status.expirationDate) < new Date();
      if (isExpired && status.isActive) {
        throw new Error('Expired subscription cannot be active');
      }
    }
    return true;
  }

  // Kural: Lifetime aboneliklerin son kullanma tarihi olmamalı
  static validateLifetime(status: SubscriptionStatus): boolean {
    if (status.type === 'premium' && status.willRenew === false) {
      if (status.expirationDate !== null) {
        throw new Error('Lifetime subscriptions cannot have expiration date');
      }
    }
    return true;
  }
}
```

## Best Practices

1. **Immutable Objects**: Entity'leri immutable olarak tasarlayın
2. **Validation**: Entity creation'da validation yapın
3. **Encapsulation**: Business logic'i entity içinde tutun
4. **Type Safety**: Strong typing kullanın
5. **Domain Events**: Önemli domain olaylarını event olarak yayınlayın
6. **Error Handling**: Domain-specific hatalar tanımlayın

## Örnek: Domain Service

```typescript
import {
  SubscriptionStatus,
  SubscriptionError,
  isSubscriptionValid,
} from '@umituz/react-native-subscription';

class SubscriptionDomainService {
  // Abonelik aktifleştirme
  activateSubscription(
    currentStatus: SubscriptionStatus,
    productId: string,
    expiresAt: string
  ): SubscriptionStatus {
    // Business rule: Zaten aktifse hata
    if (currentStatus.isActive) {
      throw new SubscriptionError('Subscription is already active');
    }

    // Yeni durum oluştur
    const newStatus: SubscriptionStatus = {
      type: 'premium',
      isActive: true,
      isPremium: true,
      expirationDate: expiresAt,
      willRenew: productId.includes('monthly') || productId.includes('annual'),
      productId,
    };

    return newStatus;
  }

  // Abonelik iptali
  deactivateSubscription(
    status: SubscriptionStatus
  ): SubscriptionStatus {
    if (!status.isActive) {
      throw new SubscriptionError('Subscription is not active');
    }

    return {
      ...status,
      isActive: false,
      willRenew: false,
    };
  }

  // Abonelik yenileme
  renewSubscription(
    status: SubscriptionStatus,
    newExpirationDate: string
  ): SubscriptionStatus {
    if (!status.willRenew) {
      throw new SubscriptionError('Subscription is set to not renew');
    }

    return {
      ...status,
      expirationDate: newExpirationDate,
      isActive: true,
    };
  }
}
```

## Testing

Domain entities test edilebilir olmalı:

```typescript
import { SubscriptionStatus, isSubscriptionValid } from '@umituz/react-native-subscription';

describe('SubscriptionStatus', () => {
  it('should create valid premium status', () => {
    const status = SubscriptionStatus.create({
      type: 'premium',
      isActive: true,
      isPremium: true,
      expirationDate: '2025-12-31T23:59:59Z',
      willRenew: true,
    });

    expect(status.type).toBe('premium');
    expect(status.isPremium).toBe(true);
  });

  it('should validate expiration', () => {
    const expired = SubscriptionStatus.create({
      type: 'premium',
      isActive: true,
      isPremium: true,
      expirationDate: '2020-01-01T00:00:00Z',
      willRenew: true,
    });

    expect(isSubscriptionValid(expired)).toBe(false);
  });
});
```
