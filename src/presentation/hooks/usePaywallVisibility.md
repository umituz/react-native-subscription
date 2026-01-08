# usePaywallVisibility Hook

Simple global state management for paywall visibility using external store.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/usePaywallVisibility.ts`

**Type**: Hook

## Strategy

### Global Paywall State Management

1. **External Store**: Use Zustand or similar for global state
2. **Visibility Control**: Simple boolean for show/hide
3. **Global Access**: Available from any component
4. **Direct Control**: Provide paywallControl for non-React contexts
5. **Single Instance**: One paywall modal at app root
6. **State Persistence**: Maintain visibility across component unmounts

### Integration Points

- **App Root**: Paywall modal should be placed at app root
- **Any Component**: Can trigger paywall from anywhere
- **Deep Links**: Can open paywall from URLs
- **Push Notifications**: Can open paywall from notifications
- **usePremium**: For conditional display based on status

## Restrictions

### REQUIRED

- **Single Modal**: MUST place paywall modal once at app root
- **Close Handler**: MUST provide close button in paywall
- **Premium Check**: SHOULD hide paywall when user becomes premium
- **Back Handler**: SHOULD handle Android back button

### PROHIBITED

- **NEVER** place multiple paywall modals in component tree
- **NEVER** manage visibility locally (use this hook instead)
- **DO NOT** show paywall too frequently
- **DO NOT** trap users without exit option

### CRITICAL SAFETY

- **ALWAYS** provide close button
- **NEVER** trap users in paywall
- **MUST** handle back button on Android
- **ALWAYS** hide paywall after successful purchase

## AI Agent Guidelines

### When Implementing Paywall Visibility

1. **Always** place paywall modal once at app root
2. **Always** provide close button
3. **Always** use openPaywall/closePaywall functions
4. **Always** hide paywall after successful purchase
5. **Never** manage visibility locally in components

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Place paywall modal once at app root
- [ ] Use openPaywall to show paywall
- [ ] Use closePaywall to hide paywall
- [ ] Provide close button in paywall
- [ ] Handle Android back button
- [ ] Hide paywall when user becomes premium
- [ ] Test paywall opens from any component
- [ ] Test paywallControl for non-React contexts
- [ ] Test deep link integration

### Common Patterns

1. **App Root Setup**: Single modal instance at app root
2. **Trigger Button**: Any component can open paywall
3. **Direct Control**: Use paywallControl in non-React code
4. **Conditional Display**: Auto-show based on user status
5. **History/Navigation**: Handle navigation with paywall
6. **Timeout/Auto-Close**: Auto-close after timeout
7. **Deep Links**: Open from URL schemes

## Related Documentation

- **usePaywallOperations**: For paywall purchase operations
- **usePremium**: For subscription status
- **usePaywall**: For complete paywall management
- **Paywall Screen**: `src/presentation/screens/README.md`
- **Paywall Components**: `src/presentation/components/paywall/README.md`
- **Modal Integration**: `src/docs/MODAL_INTEGRATION.md`
