# useSubscriptionDetails Hook

Hook for accessing detailed subscription information including package details.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/useSubscriptionDetails.ts`

**Type**: Hook

## Strategy

### Detailed Subscription Information

1. **Subscription Status**: Fetch current subscription status object
2. **Package Details**: Retrieve RevenueCat package information
3. **Period Detection**: Determine subscription period (monthly/annual/lifetime)
4. **Price Calculation**: Calculate current price and monthly equivalent
5. **Feature List**: Extract feature list from package configuration
6. **Real-time Updates**: Refresh when subscription changes

### Integration Points

- **Subscription Repository**: `src/infrastructure/repositories/SubscriptionRepository.ts`
- **Package Configuration**: RevenueCat package definitions
- **useSubscriptionStatus**: For detailed status information
- **TanStack Query**: For caching and background updates

## Restrictions

### REQUIRED

- **Loading State**: MUST handle loading state
- **Null Handling**: MUST handle null subscription and package
- **Error Handling**: MUST handle error state
- **Price Formatting**: MUST format prices appropriately

### PROHIBITED

- **NEVER** assume subscription exists (check for null)
- **NEVER** assume package exists (check for null)
- **DO NOT** use prices without formatting
- **DO NOT** hardcode feature lists

### CRITICAL SAFETY

- **ALWAYS** check for null subscription and package
- **MUST** handle loading state before accessing details
- **ALWAYS** format prices with currency codes
- **NEVER** trust client-side details for security

## AI Agent Guidelines

### When Implementing Subscription Details

1. **Always** check for null subscription and package
2. **Always** handle loading state
3. **Always** format prices properly
4. **Always** handle all period types (monthly, annual, lifetime)
5. **Never** use for security decisions without server validation

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Handle loading state
- [ ] Check subscription for null
- [ ] Check package for null
- [ ] Format prices with currency codes
- [ ] Handle all period types
- [ ] Display features properly
- [ ] Test with monthly subscription
- [ ] Test with annual subscription
- [ ] Test with lifetime subscription
- [ ] Test with no subscription

### Common Patterns

1. **Detailed Card**: Display comprehensive subscription information
2. **Price Comparison**: Show monthly vs annual pricing
3. **Upgrade Suggestion**: Suggest upgrades based on current plan
4. **Feature List**: Display included features
5. **Billing History**: Show subscription history
6. **Cancellation Flow**: Handle subscription cancellation

## Related Documentation

- **useSubscription**: Basic subscription status
- **useSubscriptionStatus**: Detailed status
- **usePremium**: Simple premium check
- **useSubscriptionPackages**: Available packages
- **Package Utilities**: `src/utils/README.md`
