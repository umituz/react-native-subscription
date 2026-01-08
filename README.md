# @umituz/react-native-subscription

Complete subscription management with RevenueCat, paywall UI, and credits system for React Native apps.

## Package Overview

**Import Path**: `@umituz/react-native-subscription`

**Version**: Latest

**Type**: React Native Package

This package provides comprehensive subscription and credit management with:
- RevenueCat integration for subscriptions
- Credits system with transaction tracking
- Paywall UI components
- Feature gating (premium, auth, credits)
- DDD architecture with clean layers

## Strategy

### Architecture Principles

1. **Domain-Driven Design (DDD)**
   - Separate domains: Wallet, Paywall, Config
   - Each domain has its own entities, rules, and boundaries
   - Business logic stays in domain layer

2. **Clean Architecture**
   - Presentation: React hooks and components
   - Application: Use cases and orchestration
   - Domain: Entities and business rules
   - Infrastructure: External integrations

3. **Separation of Concerns**
   - UI components are pure and reusable
   - Business logic is in hooks and services
   - Data persistence is abstracted behind repositories

### Integration Flow

1. **Initialization**
   - Configure RevenueCat with API key
   - Set up Firebase for credits storage
   - Initialize providers at app root

2. **Subscription Management**
   - Check user tier and subscription status
   - Gate premium features
   - Handle purchase flows

3. **Credits System**
   - Initialize credits on purchase
   - Deduct credits for feature usage
   - Track all transactions
   - Handle credit exhaustion

4. **Paywall Display**
   - Show paywall on feature gates
   - Handle purchase operations
   - Manage paywall visibility state

### Key Dependencies

- **RevenueCat**: `react-native-purchases` >= 7.0.0
- **Firebase**: `firebase` >= 10.0.0
- **State Management**: `@tanstack/react-query` >= 5.0.0
- **React Native**: `react-native` >= 0.74.0

## Restrictions

### REQUIRED

- **RevenueCat Configuration**: MUST provide valid API key and entitlement ID
- **Firebase Setup**: MUST initialize Firebase for credits system
- **Provider Setup**: MUST wrap app with `SubscriptionProvider`
- **Authentication**: MUST have authenticated user for credits operations
- **Error Handling**: MUST handle all error states appropriately

### PROHIBITED

- **NEVER** use subscription hooks outside provider
- **NEVER** deduce credits without checking balance first
- **NEVER** gate features without proper user feedback
- **DO NOT** bypass gate hooks for premium features
- **DO NOT** initialize RevenueCat multiple times

### CRITICAL SAFETY

- **ALWAYS** check loading states before rendering
- **ALWAYS** handle edge cases (no subscription, expired, etc)
- **ALWAYS** validate return values from credit operations
- **NEVER** assume user has premium or credits
- **MUST** implement proper error boundaries

## Rules

### Provider Setup

```typescript
// CORRECT - Wrap app with provider
<SubscriptionProvider config={{ revenueCatApiKey: 'xxx' }}>
  <App />
</SubscriptionProvider>

// INCORRECT - No provider
<App /> // Hooks will fail

// INCORRECT - Multiple providers
<SubscriptionProvider>
  <SubscriptionProvider> // Duplicate
    <App />
  </SubscriptionProvider>
</SubscriptionProvider>
```

### Feature Gating

```typescript
// CORRECT - Use gate hooks
const { canAccess, showPaywall } = usePremiumGate();
if (!canAccess) {
  showPaywall();
  return;
}

// INCORRECT - Manual check
if (!user.isPremium) { // No feedback, no paywall
  return;
}
```

### Credit Operations

```typescript
// CORRECT - Check return value
const success = await deductCredit(5);
if (success) {
  executeFeature();
}

// INCORRECT - Assume success
await deductCredit(5);
executeFeature(); // May execute if deduction failed
```

### Loading States

```typescript
// CORRECT - Respect loading
if (isLoading) return <Spinner />;
if (!isPremium) return <UpgradePrompt />;
return <Content />;

// INCORRECT - Ignore loading
{!isPremium && <UpgradePrompt />} // Flickers during load
```

## AI Agent Guidelines

### When Implementing Features

1. **Always** use appropriate gate hooks for feature access
2. **Always** handle loading, error, and empty states
3. **Always** provide user feedback for blocked features
4. **Always** check return values from operations
5. **Never** bypass gate system or checks
6. **Must** test with different user tiers
7. **Must** handle network errors gracefully

### Implementation Checklist

- [ ] Import from correct path
- [ ] Wrap with necessary providers
- [ ] Use gate hooks for features
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Provide user feedback
- [ ] Test with guest user
- [ ] Test with free user
- [ ] Test with premium user
- [ ] Test with no credits
- [ ] Test with insufficient credits

### Common Patterns

1. **Premium Feature**: Use `usePremiumGate`
2. **Credit Feature**: Use `useCreditsGate` or `useDeductCredit`
3. **Auth Feature**: Use `useAuthGate`
4. **Combined Gates**: Use `useFeatureGate` for complex scenarios
5. **Paywall Trigger**: Use `usePaywallVisibility` for global state

### Error Scenarios to Handle

- **No Subscription**: Show upgrade prompt
- **Expired Subscription**: Show renewal prompt
- **No Credits**: Show credit purchase prompt
- **Insufficient Credits**: Show credit cost and purchase option
- **Network Error**: Show retry option
- **Purchase Failed**: Show error message and retry

## Documentation Structure

### Domain Documentation

- **[Wallet Domain](./src/domains/wallet/README.md)**: Credits and transactions
- **[Paywall Domain](./src/domains/paywall/README.md)**: Paywall components
- **[Config Domain](./src/domains/config/README.md)**: Configuration management

### Layer Documentation

- **[Presentation Layer](./src/presentation/README.md)**: Hooks and components
- **[Application Layer](./src/application/README.md)**: Use cases and ports
- **[Domain Layer](./src/domain/README.md)**: Entities and logic
- **[Infrastructure Layer](./src/infrastructure/README.md)**: Repositories and services

### Feature Documentation

- **[RevenueCat Integration](./src/revenuecat/README.md)**: RevenueCat setup
- **[Subscription Hooks](./src/presentation/hooks/README.md)**: Available hooks
- **[Premium Components](./src/presentation/components/README.md)**: UI components

### Quick Reference

#### Subscription Hooks

Location: `src/presentation/hooks/`

- `useSubscription` - Core subscription management
- `usePremium` - Check premium status
- `usePremiumGate` - Gate premium features
- `useUserTier` - Get user tier (guest/free/premium)

#### Credit Hooks

Location: `src/presentation/hooks/`

- `useCredits` - Access credit balance
- `useDeductCredit` - Deduct credits with optimistic updates
- `useCreditChecker` - Check credit availability
- `useCreditsGate` - Gate features by credits

#### Paywall Hooks

Location: `src/presentation/hooks/`

- `usePaywallVisibility` - Manage paywall state
- `usePaywallOperations` - Handle purchase operations

#### Components

Location: `src/presentation/components/`

- `PremiumDetailsCard` - Display subscription details
- `PremiumStatusBadge` - Show subscription badge
- `PaywallModal` - Full paywall modal
- `CreditRow` - Display credit balance with progress

## Contributing

When contributing to this package:

1. **Follow Documentation Template**: Use `README_TEMPLATE.md`
2. **Update Strategy Section**: Document architectural decisions
3. **List Restrictions**: Clearly state what's required/prohibited
4. **Provide Rules**: Show correct/incorrect usage
5. **AI Guidelines**: Include agent instructions
6. **No Code Examples**: Keep documentation code-agnostic
7. **English Only**: All documentation in English

## Support

- **Issues**: [GitHub Issues](https://github.com/umituz/react-native-subscription/issues)
- **Author**: Ümit UZ <umit@umituz.com>

## License

MIT License - see LICENSE file for details
