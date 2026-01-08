# Testing Guide

Comprehensive testing guide for @umituz/react-native-subscription.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [E2E Testing](#e2e-testing)
- [Mocking](#mocking)
- [Test Utilities](#test-utilities)
- [Best Practices](#best-practices)

## Testing Philosophy

We believe in:

- **Testability First**: Code should be easy to test
- **Fast Tests**: Unit tests should run in milliseconds
- **Isolation**: Tests should be independent
- **Clarity**: Tests should document behavior
- **Coverage**: Aim for >80% coverage

## Unit Testing

### Testing Hooks

```typescript
import { renderHook, act, waitFor } from '@testing-library/react-hooks';
import { usePremium } from '@umituz/react-native-subscription';

describe('usePremium', () => {
  it('should return premium status', async () => {
    // Mock repository
    const mockRepository = {
      getSubscriptionStatus: jest.fn().mockResolvedValue({
        type: 'premium',
        isActive: true,
        isPremium: true,
      }),
    };

    const { result, waitFor } = renderHook(() => usePremium());

    await waitFor(() => {
      expect(result.current.isPremium).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => usePremium());

    expect(result.current.isLoading).toBe(true);
  });

  it('should handle errors', async () => {
    const mockRepository = {
      getSubscriptionStatus: jest.fn().mockRejectedValue(
        new Error('Failed to fetch')
      ),
    };

    const { result, waitFor } = renderHook(() => usePremium());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
```

### Testing Utilities

```typescript
import { formatPrice, calculateDiscount } from '@umituz/react-native-subscription/utils';

describe('Price Utilities', () => {
  describe('formatPrice', () => {
    it('should format USD prices', () => {
      expect(formatPrice(9.99, 'USD')).toBe('$9.99');
      expect(formatPrice(0, 'USD')).toBe('$0.00');
    });

    it('should format TRY prices', () => {
      expect(formatPrice(99.99, 'TRY')).toBe('99,99 ₺');
    });

    it('should handle negative prices', () => {
      expect(() => formatPrice(-10, 'USD')).toThrow();
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate discount percentage', () => {
      expect(calculateDiscount(100, 75)).toBe(25);
      expect(calculateDiscount(19.99, 14.99)).toBeCloseTo(25.01);
    });

    it('should handle zero original price', () => {
      expect(() => calculateDiscount(0, 10)).toThrow();
    });
  });
});
```

### Testing Domain Logic

```typescript
import { SubscriptionStatus } from '@umituz/react-native-subscription/domain';

describe('SubscriptionStatus', () => {
  describe('create', () => {
    it('should create valid premium status', () => {
      const status = SubscriptionStatus.create({
        type: 'premium',
        isActive: true,
        isPremium: true,
        expirationDate: '2025-12-31',
        willRenew: true,
      });

      expect(status.type).toBe('premium');
      expect(status.isPremium).toBe(true);
    });

    it('should reject invalid premium status', () => {
      expect(() => {
        SubscriptionStatus.create({
          type: 'premium',
          isActive: false, // Invalid: premium must be active
          isPremium: true,
        });
      }).toThrow('Premium users must be active');
    });
  });

  describe('isExpired', () => {
    it('should detect expired subscription', () => {
      const status = SubscriptionStatus.create({
        type: 'premium',
        isActive: true,
        isPremium: true,
        expirationDate: '2020-01-01', // Past date
        willRenew: true,
      });

      expect(status.isExpired()).toBe(true);
    });
  });
});
```

## Integration Testing

### Testing Component Integration

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaywallModal } from '@umituz/react-native-subscription';

describe('Paywall Flow', () => {
  it('should complete purchase flow', async () => {
    const mockPurchase = jest.fn().mockResolvedValue({
      success: true,
      customerInfo: { entitlements: { active: { premium: true } } },
    });

    const { getByText, getByRole } = render(
      <PaywallModal
        isVisible={true}
        onClose={jest.fn()}
        onPurchase={mockPurchase}
        config={{
          title: 'Unlock Premium',
          features: [{ icon: '⭐', text: 'Unlimited' }],
        }}
      />
    );

    // Verify title
    expect(getByText('Unlock Premium')).toBeTruthy();

    // Tap subscribe button
    fireEvent.press(getByText('Subscribe Now'));

    // Wait for purchase
    await waitFor(() => {
      expect(mockPurchase).toHaveBeenCalled();
    });
  });

  it('should handle purchase error', async () => {
    const mockPurchase = jest.fn().mockResolvedValue({
      success: false,
      error: new Error('Purchase failed'),
    });

    const { getByText, getByRole } = render(
      <PaywallModal
        isVisible={true}
        onClose={jest.fn()}
        onPurchase={mockPurchase}
      />
    );

    fireEvent.press(getByText('Subscribe Now'));

    await waitFor(() => {
      expect(getByText('Purchase failed')).toBeTruthy();
    });
  });
});
```

### Testing Repository Integration

```typescript
import { CreditsRepository } from '@umituz/react-native-subscription/infrastructure';

describe('CreditsRepository Integration', () => {
  let repository: CreditsRepository;
  let mockFirestore: any;

  beforeEach(() => {
    mockFirestore = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
    };

    repository = new CreditsRepository(mockFirestore);
  });

  it('should fetch credits from Firestore', async () => {
    const mockData = { balance: 100 };
    mockFirestore.get.mockResolvedValue({
      exists: true,
      data: () => mockData,
    });

    const credits = await repository.getCredits('user-123');

    expect(credits).toEqual(mockData);
    expect(mockFirestore.doc).toHaveBeenCalledWith('user-123');
  });

  it('should deduct credits', async () => {
    mockFirestore.get.mockResolvedValue({
      exists: true,
      data: () => ({ balance: 100 }),
    });

    const result = await repository.deductCredits('user-123', 10, 'test');

    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(90);
    expect(mockFirestore.update).toHaveBeenCalled();
  });
});
```

## E2E Testing

### Detox Setup

```typescript
// detox/e2e/subscription.e2e.js
describe('Subscription Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete full subscription flow', async () => {
    // Navigate to paywall
    await element(by.id('upgrade-button')).tap();

    // Wait for paywall to appear
    await expect(element(by.text('Unlock Premium'))).toBeVisible();

    // Select monthly plan
    await element(by.id('plan-monthly')).tap();

    // Subscribe
    await element(by.id('subscribe-button')).tap();

    // Wait for success
    await expect(element(by.text('Welcome to Premium!'))).toBeVisible();

    // Verify premium status
    await expect(element(by.id('premium-badge'))).toBeVisible();
  });
});
```

### Appium Setup

```typescript
// appium/subscription.spec.js
describe('Subscription E2E', () => {
  it('should handle restore purchase', async () => {
    const restoreButton = await driver.$('~restore-button');
    await restoreButton.click();

    const alert = await driver.$('~alert-message');
    expect(await alert.getText()).toContain('Purchase restored');
  });
});
```

## Mocking

### Mocking RevenueCat

```typescript
// __mocks__/react-native-purchases.ts
import { Purchases } from 'react-native-purchases';

jest.mock('react-native-purchases', () => ({
  Purchases: {
    configure: jest.fn(),
    getOfferings: jest.fn(),
    purchasePackage: jest.fn(),
    getCustomerInfo: jest.fn(),
    restorePurchases: jest.fn(),
    setDebugLogsEnabled: jest.fn(),
  },
}));

// Usage in tests
import { Purchases } from 'react-native-purchases';

describe('With RevenueCat Mocked', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get offerings', async () => {
    const mockOfferings = {
      current: {
        availablePackages: [
          {
            identifier: 'monthly',
            product: { price: 9.99 },
          },
        ],
      },
    };

    Purchases.getOfferings.mockResolvedValue(mockOfferings);

    const { result, waitFor } = renderHook(() =>
      useSubscriptionPackages()
    );

    await waitFor(() => {
      expect(result.current.packages).toHaveLength(1);
    });
  });
});
```

### Mocking Firebase

```typescript
// __mocks__/@react-native-firebase/firestore.ts
import { firestore } from '@react-native-firebase/firestore';

jest.mock('@react-native-firebase/firestore', () => ({
  firestore: () => ({
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    onSnapshot: jest.fn(),
  }),
}));

// Usage
import { firestore } from '@react-native-firebase/firestore';

describe('With Firestore Mocked', () => {
  it('should save subscription status', async () => {
    const mockDb = firestore();
    const mockDoc = jest.fn().mockReturnThis();

    mockDb.collection.mockReturnValue({
      doc: mockDoc,
    });

    await repository.saveSubscriptionStatus('user-123', status);

    expect(mockDoc).toHaveBeenCalledWith('user-123');
    expect(mockDb.set).toHaveBeenCalled();
  });
});
```

### Mocking Hooks

```typescript
// Mock custom hooks
jest.mock('@umituz/react-native-subscription', () => ({
  ...jest.requireActual('@umituz/react-native-subscription'),
  usePremium: () => ({
    isPremium: true,
    isLoading: false,
  }),
  useCredits: () => ({
    credits: 100,
    consumeCredit: jest.fn(),
  }),
}));

// Test component with mocked hooks
describe('MyComponent with Mocked Hooks', () => {
  it('should render premium content', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('Premium Feature')).toBeTruthy();
  });
});
```

## Test Utilities

### Test Factories

```typescript
// test/factories.ts
export const createMockSubscription = (overrides = {}) => ({
  type: 'premium',
  isActive: true,
  isPremium: true,
  expirationDate: '2025-12-31',
  willRenew: true,
  ...overrides,
});

export const createMockPackage = (overrides = {}) => ({
  identifier: 'com.app.premium.monthly',
  packageType: 'MONTHLY',
  product: {
    identifier: 'com.app.premium.monthly',
    title: 'Premium Monthly',
    description: 'Monthly subscription',
    price: 9.99,
    priceString: '$9.99',
    currencyCode: 'USD',
  },
  offeringIdentifier: 'default',
  ...overrides,
});

// Usage
import { createMockSubscription, createMockPackage } from './factories';

describe('With Factories', () => {
  it('should handle mock subscription', () => {
    const subscription = createMockSubscription({
      type: 'free',
      isPremium: false,
    });

    expect(subscription.isPremium).toBe(false);
  });
});
```

### Custom Render

```typescript
// test/render.tsx
import { render } from '@testing-library/react-native';
import { SubscriptionProvider } from '@umituz/react-native-subscription';

export function renderWithProviders(
  ui: React.ReactElement,
  options = {}
) {
  const AllTheProviders = ({ children }) => {
    return (
      <SubscriptionProvider config={mockConfig}>
        {children}
      </SubscriptionProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Usage
import { renderWithProviders } from './render';

describe('With Custom Render', () => {
  it('should render with providers', () => {
    const { getByText } = renderWithProviders(<MyComponent />);
    expect(getByText('Hello')).toBeTruthy();
  });
});
```

### Test Helpers

```typescript
// test/helpers.ts
export async function waitForPremiumStatus(
  hook: RenderHookResult<unknown, ReturnType<typeof usePremium>>
) {
  await waitFor(() => {
    expect(hook.result.current.isLoading).toBe(false);
  });
}

export function mockSuccessfulPurchase() {
  return {
    success: true,
    customerInfo: {
      entitlements: {
        active: {
          premium: {
            isActive: true,
            willRenew: true,
          },
        },
      },
    },
  };
}

export function mockFailedPurchase(error: string) {
  return {
    success: false,
    error: new Error(error),
  };
}
```

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ❌ Bad - tests implementation
it('should call setPremium', () => {
  expect(setPremium).toHaveBeenCalledWith(true);
});

// ✅ Good - tests behavior
it('should show premium content when user is premium', () => {
  const { getByText } = render(<MyComponent isPremium={true} />);
  expect(getByText('Premium Content')).toBeTruthy();
});
```

### 2. Use Descriptive Test Names

```typescript
// ❌ Bad
it('works', () => {});

// ✅ Good
it('should show upgrade button when user is not premium', () => {});
```

### 3. Arrange, Act, Assert

```typescript
it('should deduct credits', async () => {
  // Arrange
  const { consumeCredit } = useCreditsGate({ creditCost: 5 });

  // Act
  const result = await consumeCredit();

  // Assert
  expect(result.success).toBe(true);
  expect(result.newBalance).toBe(95);
});
```

### 4. Test Edge Cases

```typescript
describe('Credit Deduction', () => {
  it('should handle zero credits', async () => {
    const result = await deductCredits(userId, 0);
    expect(result.success).toBe(true);
  });

  it('should handle negative amount', async () => {
    await expect(
      deductCredits(userId, -10)
    ).rejects.toThrow('Invalid amount');
  });

  it('should handle insufficient credits', async () => {
    const result = await deductCredits(userId, 1000); // Too many
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('Insufficient');
  });
});
```

### 5. Keep Tests Independent

```typescript
describe('Independent Tests', () => {
  beforeEach(() => {
    // Reset state before each test
    jest.clearAllMocks();
    resetTestDatabase();
  });

  it('test 1', () => {
    // Don't depend on test 2
  });

  it('test 2', () => {
    // Don't depend on test 1
  });
});
```

## Running Tests

### Run All Tests

```bash
npm test
# or
yarn test
```

### Run Specific File

```bash
npm test usePremium.test
# or
yarn test usePremium.test
```

### Run with Coverage

```bash
npm test -- --coverage
# or
yarn test --coverage
```

### Watch Mode

```bash
npm test -- --watch
# or
yarn test --watch
```

## Coverage Goals

Aim for:

- **Lines**: >80%
- **Functions**: >80%
- **Branches**: >75%
- **Statements**: >80%

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## More Information

- [Architecture](./ARCHITECTURE.md)
- [API Reference](./API_REFERENCE.md)
- [Contributing](../CONTRIBUTING.md)
