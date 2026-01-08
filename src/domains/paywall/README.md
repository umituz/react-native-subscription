# Paywall Domain

Subscription and credit purchase flow with user-friendly payment wall components and hooks.

## Location

- **Base Path**: `/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/domains/paywall/`
- **Entities**: `src/domains/paywall/entities/`
- **Components**: `src/domains/paywall/components/`
- **Hooks**: `src/domains/paywall/hooks/`

## Strategy

### Paywall Management

Centralized paywall system for subscription and credit purchase flows.

- **Modal and Full-Screen Support**: Flexible paywall display options
- **Multi-language Support**: Built-in i18n capabilities
- **A/B Test Ready**: Easy creation of different paywall variants
- **Analytics Integration**: User behavior tracking capabilities

### Component Architecture

Ready-to-use paywall components with customization support.

- **PaywallModal**: Modal-based paywall display
- **PaywallContainer**: Paywall content wrapper
- **PaywallScreen**: Full-screen paywall implementation
- **Feature Lists**: Customizable feature display components

### Hook Integration

Hooks for paywall state and behavior management.

- **usePaywall**: Paywall visibility and state control
- **usePaywallActions**: Purchase and restore action handling
- **usePaywallTranslations**: Translation management
- **useSubscriptionModal**: Subscription modal management

### Configuration Strategy

Theme and content customization system.

- **Theme Configuration**: Custom color schemes and styling
- **Feature Lists**: Customizable feature display
- **Translation Support**: Multi-language copy management
- **Event Tracking**: Analytics integration points

## Restrictions

### REQUIRED

- **Paywall Context**: All paywall components must be used within SubscriptionProvider
- **Config Validation**: Paywall configuration must be validated before use
- **Error Handling**: All paywall actions must have error handling
- **Loading States**: Purchase operations must show loading indicators

### PROHIBITED

- **Hardcoded Strings**: All text must support translations
- **Direct RevenueCat Calls**: Use paywall hooks instead of direct SDK calls
- **Missing Analytics**: All paywall interactions must be tracked
- **Blocking UI**: Never block app flow without escape options

### CRITICAL

- **User Experience**: Paywalls must be dismissible
- **Purchase Flow**: Complete purchase flow must be handled
- **Error Recovery**: Graceful error handling required
- **State Management**: Paywall state must be properly managed

## AI Agent Guidelines

### When Modifying Paywall Components

1. **Maintain UX Standards**: Keep user experience consistent
2. **Test All States**: Test loading, success, and error states
3. **Analytics Integration**: Add tracking for new interactions
4. **Translation Support**: All new text must be translatable

### When Adding New Paywall Features

1. **Hook Pattern**: Create corresponding hook for new features
2. **Type Safety**: Define proper TypeScript types
3. **Documentation**: Document all props and usage
4. **Testing**: Test with different subscription states

### When Fixing Paywall Bugs

1. **RevenueCat Integration**: Check RevenueCat SDK integration
2. **State Management**: Verify state transitions
3. **Edge Cases**: Test with null/undefined states
4. **User Flows**: Test complete purchase flows

## Related Documentation

- [RevenueCat Integration](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/revenuecat/README.md)
- [Config Domain](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/domains/config/README.md)
- [Wallet Domain](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/domains/wallet/README.md)
- [Presentation Components](/Users/umituz/Desktop/github/umituz/apps/artificial_intelligence/npm-packages/react-native-subscription/src/presentation/components/README.md)
