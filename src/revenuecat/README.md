# RevenueCat Integration

Comprehensive integration and API wrapper for subscription management with RevenueCat.

## Location

- **Base Path**: `/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/revenuecat/`
- **Domain**: `src/revenuecat/domain/`
- **Infrastructure**: `src/revenuecat/infrastructure/`
- **Presentation**: `src/revenuecat/presentation/`

## Strategy

### RevenueCat SDK Integration

Seamless RevenueCat SDK initialization and configuration.

- **Automatic Initialization**: SDK startup and configuration
- **User ID Management**: Auth system integration
- **Purchase Flow**: Managed purchase operations
- **Restore Operations**: Purchase restoration support
- **Error Handling**: RevenueCat error management

### Hook Architecture

React hooks for RevenueCat functionality.

- **useRevenueCat**: Core RevenueCat access
- **useCustomerInfo**: Subscription information tracking
- **useInitializeSubscription**: Initialization status monitoring
- **useSubscriptionPackages**: Package listing and selection
- **usePaywallFlow**: Complete paywall flow management
- **useRestorePurchase**: Purchase restoration

### State Management

Customer info and subscription state tracking.

- **Customer Info Tracking**: Real-time subscription updates
- **Offerings Management**: Package offering configuration
- **Purchase State**: Purchase operation states
- **Error States**: Comprehensive error handling

### User ID Synchronization

Auth system integration for user management.

- **Auth Sync**: Automatic user ID synchronization
- **Login/Logout**: User ID management on auth changes
- **Anonymous Users**: Anonymous user support
- **Migration**: User migration support

## Restrictions

### REQUIRED

- **Initialization**: Must initialize before any operations
- **User ID Sync**: Sync user IDs with auth system
- **Error Handling**: All operations must handle errors
- **Loading States**: Show appropriate loading indicators

### PROHIBITED

- **Direct SDK Calls**: Use hooks instead of direct RevenueCat calls
- **Missing User IDs**: Operations require valid user IDs
- **Uninitialized Access**: Don't call methods before initialization
- **Ignoring Errors**: All errors must be handled

### CRITICAL

- **API Key Security**: Never expose API keys in client code
- **User ID Consistency**: Maintain consistent user IDs
- **Purchase Validation**: Validate all purchase results
- **Entitlement Check**: Always verify entitlements

## AI Agent Guidelines

### When Modifying RevenueCat Integration

1. **SDK Version**: Check RevenueCat SDK version compatibility
2. **Type Definitions**: Update TypeScript types
3. **Error Handling**: Maintain comprehensive error handling
4. **Testing**: Test with different subscription states

### When Adding New Hooks

1. **Hook Pattern**: Follow existing hook patterns
2. **State Management**: Proper state management
3. **Error Handling**: Comprehensive error handling
4. **Documentation**: Document hook usage and return values

### When Fixing RevenueCat Bugs

1. **SDK Integration**: Check RevenueCat SDK integration
2. **State Updates**: Verify state update mechanisms
3. **User ID**: Verify user ID consistency
4. **Purchase Flow**: Test complete purchase flows

## Related Documentation

- [Paywall Domain](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/domains/paywall/README.md)
- [Config Domain](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/domains/config/README.md)
- [Infrastructure Layer](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/infrastructure/README.md)
- [Application Layer](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/application/README.md)
