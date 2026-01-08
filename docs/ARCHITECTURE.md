# Architecture

Technical architecture and design patterns used in @umituz/react-native-subscription.

## Overview

This package follows Domain-Driven Design (DDD) principles with Clean Architecture, creating a maintainable and scalable codebase.

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (React Hooks, Components, Screens)                         │
│  - User Interface                                           │
│  - State Management                                         │
│  - User Interaction                                         │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                         │
│  (Use Cases, Ports)                                         │
│  - Business Use Cases                                       │
│  - Service Contracts                                        │
│  - Orchestration                                            │
├─────────────────────────────────────────────────────────────┤
│                      Domain Layer                            │
│  (Entities, Value Objects, Business Logic)                  │
│  - Core Business Rules                                      │
│  - Domain Models                                            │
│  - Domain Services                                          │
├─────────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                        │
│  (Repositories, External Services)                          │
│  - Data Access                                              │
│  - External Integrations                                    │
│  - Technical Details                                        │
└─────────────────────────────────────────────────────────────┘
```

## Layer Details

### 1. Presentation Layer

**Purpose**: User interface and interaction

**Components**:
- React Hooks
- UI Components
- Screens
- Navigation

**Responsibilities**:
- Display data to users
- Capture user input
- Manage UI state
- Handle navigation

**Key Files**:
```
presentation/
├── hooks/              # React hooks
│   ├── usePremium.ts
│   ├── useCredits.ts
│   └── usePaywall*.ts
├── components/         # UI components
│   ├── details/
│   ├── feedback/
│   └── sections/
└── screens/           # Full screens
    └── SubscriptionDetailScreen.tsx
```

**Example**:
```typescript
// Presentation hook
export function usePremium() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    // Delegate to application/service layer
    subscriptionService.getStatus(userId).then(setStatus);
  }, [userId]);

  return {
    isPremium: status?.isPremium ?? false,
    status,
  };
}
```

### 2. Application Layer

**Purpose**: Orchestrate business use cases

**Components**:
- Use Cases
- Service Interfaces (Ports)
- Application Services

**Responsibilities**:
- Define service contracts
- Orchestrate domain operations
- Handle cross-cutting concerns
- Coordinate between layers

**Key Files**:
```
application/
└── ports/
    ├── ISubscriptionService.ts
    └── ISubscriptionRepository.ts
```

**Example**:
```typescript
// Service interface (Port)
export interface ISubscriptionService {
  getStatus(userId: string): Promise<SubscriptionStatus>;
  activateSubscription(
    userId: string,
    productId: string,
    expiresAt: string
  ): Promise<SubscriptionStatus>;
  isPremium(userId: string): Promise<boolean>;
}
```

### 3. Domain Layer

**Purpose**: Core business logic and rules

**Components**:
- Entities
- Value Objects
- Domain Services
- Domain Events
- Business Rules

**Responsibilities**:
- Define core business concepts
- Implement business rules
- Validate domain invariants
- Remain framework-agnostic

**Key Files**:
```
domain/
├── entities/
│   └── SubscriptionStatus.ts
├── value-objects/
│   └── SubscriptionConfig.ts
└── errors/
    ├── SubscriptionError.ts
    └── InsufficientCreditsError.ts
```

**Example**:
```typescript
// Domain Entity
export class SubscriptionStatus {
  public readonly type: SubscriptionStatusType;
  public readonly isActive: boolean;
  public readonly isPremium: boolean;
  public readonly expirationDate: string | null;

  private constructor(data: SubscriptionStatusData) {
    this.type = data.type;
    this.isActive = data.isActive;
    this.isPremium = data.isPremium;
    this.expirationDate = data.expirationDate;

    // Validate invariants
    this.validate();
  }

  private validate(): void {
    if (this.isPremium && !this.isActive) {
      throw new SubscriptionValidationError(
        'Premium users must be active'
      );
    }
  }

  static create(data: SubscriptionStatusData): SubscriptionStatus {
    return new SubscriptionStatus(data);
  }
}
```

### 4. Infrastructure Layer

**Purpose**: External concerns and technical details

**Components**:
- Repositories
- External Service Adapters
- Data Mappers
- Technical Implementations

**Responsibilities**:
- Implement interfaces defined by Application layer
- Handle external integrations
- Manage persistence
- Provide technical capabilities

**Key Files**:
```
infrastructure/
├── repositories/
│   └── CreditsRepositoryProvider.ts
├── services/
│   ├── SubscriptionService.ts
│   └── SubscriptionInitializer.ts
└── managers/
    └── SubscriptionManager.ts
```

**Example**:
```typescript
// Repository implementation
export class FirestoreSubscriptionRepository
  implements ISubscriptionRepository
{
  constructor(private db: Firestore) {}

  async getSubscriptionStatus(
    userId: string
  ): Promise<SubscriptionStatus | null> {
    const doc = await this.db
      .collection('subscriptions')
      .doc(userId)
      .get();

    return doc.exists ? doc.data() : null;
  }

  async saveSubscriptionStatus(
    userId: string,
    status: SubscriptionStatus
  ): Promise<void> {
    await this.db
      .collection('subscriptions')
      .doc(userId)
      .set(status, { merge: true });
  }

  isSubscriptionValid(status: SubscriptionStatus): boolean {
    return status.isActive && !isExpired(status.expirationDate);
  }
}
```

## Domain Separation

The package is organized into domains based on business capabilities:

### 1. Wallet Domain

**Purpose**: Credits and wallet management

**Structure**:
```
domains/wallet/
├── domain/
│   ├── entities/       # Credit, Transaction
│   ├── types/          # Domain types
│   └── errors/         # Domain errors
├── infrastructure/
│   ├── repositories/   # Transaction repository
│   └── services/       # Product metadata
└── presentation/
    ├── hooks/          # useWallet, useTransactionHistory
    └── components/     # BalanceCard, TransactionList
```

### 2. Paywall Domain

**Purpose**: Paywall UI and flows

**Structure**:
```
domains/paywall/
├── entities/          # Paywall configurations
├── components/        # Paywall UI components
└── hooks/            # usePaywall, usePaywallActions
```

### 3. Config Domain

**Purpose**: Plan and package configuration

**Structure**:
```
domains/config/
├── domain/
│   ├── entities/      # Plan entity
│   └── value-objects/ # Config value objects
└── utils/            # Configuration helpers
```

## Design Patterns

### 1. Dependency Inversion

High-level modules don't depend on low-level modules:

```typescript
// High-level (Application) defines interface
interface ISubscriptionRepository {
  getSubscriptionStatus(userId: string): Promise<SubscriptionStatus>;
}

// Low-level (Infrastructure) implements interface
class FirestoreRepository implements ISubscriptionRepository {
  async getSubscriptionStatus(userId: string) {
    // Implementation
  }
}
```

### 2. Repository Pattern

Abstract data access:

```typescript
// Interface
interface ISubscriptionRepository {
  get(id: string): Promise<Entity>;
  save(id: string, entity: Entity): Promise<void>;
}

// Implementation
class FirestoreRepository implements ISubscriptionRepository {
  async get(id: string) {
    // Firestore logic
  }
}
```

### 3. Factory Pattern

Create complex objects:

```typescript
class SubscriptionStatus {
  static create(data: SubscriptionStatusData): SubscriptionStatus {
    // Validation and creation logic
    return new SubscriptionStatus(data);
  }
}
```

### 4. Strategy Pattern

Interchangeable algorithms:

```typescript
interface CreditDeductionStrategy {
  deduct(amount: number, credits: number): CreditsResult;
}

class StandardDeduction implements CreditDeductionStrategy {
  deduct(amount: number, credits: number): CreditsResult {
    if (credits < amount) {
      return { success: false, error: 'Insufficient credits' };
    }
    return { success: true, newBalance: credits - amount };
  }
}
```

### 5. Observer Pattern

React to state changes:

```typescript
class CustomerInfoListenerManager {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(info: CustomerInfo): void {
    this.listeners.forEach(listener => listener(info));
  }
}
```

## Data Flow

### 1. Reading Subscription Status

```
User Component (Presentation)
    ↓ calls hook
usePremium Hook (Presentation)
    ↓ queries service
SubscriptionService (Application)
    ↓ uses repository
SubscriptionRepository (Infrastructure)
    ↓ fetches data
RevenueCat/Firebase (External)
    ↓ returns data
↑ All the way back up
```

### 2. Making a Purchase

```
User taps "Subscribe" (Presentation)
    ↓ triggers action
handlePurchase (Application)
    ↓ validates
PurchaseHandler (Infrastructure)
    ↓ calls API
RevenueCat SDK (External)
    ↓ processes
Return result (Infrastructure)
    ↓ updates state
Update UI (Presentation)
```

### 3. Consuming Credits

```
User action (Presentation)
    ↓ calls hook
consumeCredit (Application)
    ↓ checks balance
CreditsRepository (Infrastructure)
    ↓ validates
Deduct credits (Infrastructure)
    ↓ saves transaction
Firestore (External)
    ↓ returns result
Update UI (Presentation)
```

## Benefits of This Architecture

### 1. Maintainability

- Clear separation of concerns
- Easy to locate code
- Changes isolated to layers

### 2. Testability

- Each layer can be tested independently
- Mock dependencies easily
- Unit test business logic

### 3. Flexibility

- Swap implementations easily
- Add new features without breaking existing code
- Change external services without affecting domain

### 4. Scalability

- Add new domains
- Extend existing functionality
- Grow codebase organically

### 5. Reusability

- Domain logic reused across platforms
- Infrastructure shared between apps
- Components reused in different contexts

## Best Practices

### 1. Dependency Flow

```
Presentation → Application → Domain ← Infrastructure
```

**Rules**:
- Presentation can depend on Application
- Application defines interfaces for Domain
- Infrastructure implements Domain interfaces
- Domain never depends on other layers

### 2. Error Handling

```typescript
// Domain errors are specific
class InsufficientCreditsError extends DomainError {
  constructor(
    public readonly required: number,
    public readonly available: number
  ) {
    super('Insufficient credits');
  }
}

// Infrastructure wraps errors
try {
  await repository.deductCredits(amount);
} catch (error) {
  throw new RepositoryError('Failed to deduct credits', error);
}
```

### 3. Validation

```typescript
// Validate at domain boundaries
class SubscriptionStatus {
  private constructor(data: SubscriptionStatusData) {
    if (data.isPremium && !data.isActive) {
      throw new ValidationError('Invalid subscription state');
    }
    // ...
  }
}
```

### 4. State Management

```typescript
// Keep state in presentation layer
function usePremium() {
  const [status, setStatus] = useState(null);

  // Query domain through application layer
  useEffect(() => {
    service.getStatus().then(setStatus);
  }, []);

  return { isPremium: status?.isPremium };
}
```

## Anti-Patterns to Avoid

### ❌ 1. Bypassing Layers

```typescript
// Don't do this
function MyComponent() {
  const db = getFirestore(); // Infrastructure in presentation
  // ...
}

// Do this instead
function MyComponent() {
  const { credits } = useCredits(); // Use presentation hook
  // ...
}
```

### ❌ 2. Logic in Wrong Layer

```typescript
// Don't put business logic in presentation
function MyComponent() {
  if (subscription.isActive && !isExpired(subscription.expiry)) {
    // ...
  }
}

// Move to domain
class SubscriptionStatus {
  isValid(): boolean {
    return this.isActive && !this.isExpired();
  }
}
```

### ❌ 3. Tight Coupling

```typescript
// Don't depend on concrete implementations
class MyService {
  constructor(private repo: FirestoreRepository) {} // Tight coupling

// Depend on abstractions
class MyService {
  constructor(private repo: ISubscriptionRepository) {} // Loose coupling
```

## Migration Path

If you're refactoring to this architecture:

1. **Start with Domain**
   - Define entities and value objects
   - Implement business rules

2. **Add Infrastructure**
   - Implement repositories
   - Integrate external services

3. **Create Application**
   - Define service interfaces
   - Implement use cases

4. **Build Presentation**
   - Create hooks
   - Build UI components

## More Information

- [Domain README](../src/domain/README.md)
- [Application README](../src/application/README.md)
- [Infrastructure README](../src/infrastructure/README.md)
- [Presentation README](../src/presentation/README.md)
