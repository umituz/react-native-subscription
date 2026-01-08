# Domains

This directory contains specialized domain modules that implement specific business logic and features.

## Overview

The `domains` directory organizes business logic into focused, self-contained modules. Each domain follows Domain-Driven Design (DDD) principles and Clean Architecture patterns.

## Domain Modules

### Wallet Domain (`wallet/`)

Manages credits, transactions, and wallet operations.

**Key Features:**
- Credit balance tracking
- Transaction history
- Credit deduction and allocation
- Purchase initialization
- Duplicate protection

**Structure:**
```
wallet/
├── domain/              # Business logic and entities
│   ├── entities/        # UserCredits, Transaction, CreditPackage
│   ├── types/           # Type definitions
│   └── mappers/         # Data transformation
├── infrastructure/      # External integrations
│   ├── repositories/    # Data persistence
│   └── services/        # External services
└── presentation/        # UI layer
    ├── hooks/           # React hooks
    ├── components/      # React components
    └── screens/         # Screen components
```

**Key Entities:**
- `UserCredits`: Credit balance and allocations
- `Transaction`: Credit transaction records
- `CreditPackage`: Purchasable credit packages

**Allocation Modes:**
- **ACCUMULATE**: Add credits on renewal (default)
- **REPLACE**: Replace existing credits with new allocation

**Related:**
- [Wallet Domain README](./wallet/README.md)
- [Wallet Entities](./wallet/domain/entities/README.md)
- [Wallet Hooks](./wallet/presentation/hooks/README.md)

### Paywall Domain (`paywall/`)

Manages paywall display, triggers, and purchase flows.

**Key Features:**
- Paywall visibility management
- Trigger-based paywall display
- Package selection and comparison
- Purchase operations
- Feedback collection

**Structure:**
```
paywall/
├── domain/              # Business logic
│   └── entities/        # PaywallTrigger, PaywallConfig, PaywallState
├── components/          # UI components
│   ├── PaywallScreen/
│   ├── PackageCard/
│   └── FeatureComparison/
└── hooks/               # React hooks
    └── usePaywallOperations/
```

**Triggers:**
- `premium_feature`: User attempts premium feature
- `credit_gate`: Insufficient credits
- `manual`: Manually triggered
- `onboarding_complete`: After onboarding
- `usage_limit`: Reached usage limit

**Related:**
- [Paywall Domain README](./paywall/README.md)
- [Paywall Entities](./paywall/entities/README.md)
- [Paywall Components](./paywall/components/README.md)

### Config Domain (`config/`)

Manages subscription and feature configuration.

**Key Features:**
- Package configuration
- Feature flags
- Subscription settings
- Paywall customization

**Structure:**
```
config/
├── domain/              # Configuration entities
│   ├── entities/        # Config entities
│   └── value-objects/   # Configuration value objects
└── utils/               # Configuration utilities
```

**Related:**
- [Config Domain README](./config/README.md)

## Architecture Principles

### 1. Domain-Driven Design (DDD)
Each domain represents a distinct business capability with:
- Clear boundaries
- Ubiquitous language
- Domain entities
- Business rules

### 2. Clean Architecture
Each domain follows layered architecture:
- **Domain Layer**: Business logic, entities (pure)
- **Application Layer**: Use cases, orchestration
- **Infrastructure Layer**: External integrations (persistence, APIs)
- **Presentation Layer**: UI components, hooks

### 3. Independence
Domains are independent and can:
- Be developed in isolation
- Have their own data stores
- Be tested independently
- Scale independently

### 4. Communication
Domains communicate through:
- Well-defined interfaces
- Events (when needed)
- Shared kernels (when necessary)

## Usage Patterns

### Using Wallet Domain

```typescript
import { useCredits } from './wallet/presentation/hooks';
import { CreditBalanceCard } from './wallet/presentation/components';

function MyComponent() {
  const { credits, transactions } = useCredits({ userId: user?.uid });

  return (
    <CreditBalanceCard
      credits={credits}
      balance={calculateBalance(credits)}
    />
  );
}
```

### Using Paywall Domain

```typescript
import { usePaywallOperations } from './paywall/hooks';

function MyScreen() {
  const { handlePurchase } = usePaywallOperations({
    userId: user?.uid,
    isAnonymous: false,
  });

  const onBuyPress = () => {
    handlePurchase(selectedPackage);
  };
}
```

### Using Config Domain

```typescript
import { getPackageConfiguration } from './config/utils';

const packages = getPackageConfiguration('premium');
```

## Adding New Domains

When adding a new domain:

1. **Create Domain Structure**
```bash
src/domains/your-domain/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   └── types/
├── infrastructure/
│   ├── repositories/
│   └── services/
└── presentation/
    ├── hooks/
    ├── components/
    └── screens/
```

2. **Define Entities**
   - Create core business entities
   - Define business rules
   - Implement validations

3. **Implement Infrastructure**
   - Create repositories for data persistence
   - Implement external service integrations
   - Add mappers for data transformation

4. **Create Presentation Layer**
   - Implement React hooks
   - Create UI components
   - Build screens

5. **Add Documentation**
   - Create README for domain
   - Document entities
   - Provide usage examples

## Best Practices

1. **Encapsulation**: Keep domain logic isolated
2. **Purity**: Domain layer should have no external dependencies
3. **Interfaces**: Depend on abstractions, not concretions
4. **Testing**: Each domain should be independently testable
5. **Documentation**: Document business rules and entities
6. **Type Safety**: Use TypeScript for all domain models
7. **Validation**: Validate at domain boundaries
8. **Error Handling**: Use domain-specific errors

## Related

- [Domain Layer README](../domain/README.md)
- [Application Layer README](../application/README.md)
- [Infrastructure Layer README](../infrastructure/README.md)
- [RevenueCat Integration README](../revenuecat/README.md)
