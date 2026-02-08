# PaywallModal Component

Modal paywall component for subscription upgrade.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/components/paywall/PaywallModal.tsx`

**Type**: Component

## Strategy

### Paywall Display Flow

1. **Modal Visibility**: Control visibility via isVisible prop
2. **Configuration**: Display features, pricing, and benefits
3. **Package Display**: Show available subscription packages
4. **Purchase Handling**: Handle purchase initiation and completion
5. **Close Behavior**: Handle modal close/dismissal
6. **Responsive Design**: Adapt to different screen sizes

### Integration Points

- **usePaywallVisibility**: For modal visibility control
- **useSubscriptionPackages**: For available packages
- **usePaywallOperations**: For purchase handling
- **Analytics**: For tracking impressions and conversions
- **Navigation**: For post-purchase navigation

## Restrictions

### REQUIRED

- **Visibility Control**: MUST control via isVisible prop
- **Close Handler**: MUST provide onClose callback
- **Purchase Handler**: MUST implement onPurchase callback
- **Package Display**: MUST show available packages

### PROHIBITED

- **NEVER** trap users without close option
- **NEVER** show without user trigger or clear reason
- **DO NOT** show too frequently
- **DO NOT** hide pricing information

### CRITICAL SAFETY

- **ALWAYS** provide clear close button
- **NEVER** trap users in modal
- **MUST** handle all purchase outcomes
- **ALWAYS** show pricing clearly

## AI Agent Guidelines

### When Implementing Paywall Modals

1. **Always** provide clear close button
2. **Always** show pricing transparently
3. **Always** handle all purchase outcomes
4. **Always** track impressions and conversions
5. **Never** trap users without exit

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Control visibility via isVisible prop
- [ ] Implement onClose callback
- [ ] Implement onPurchase callback
- [ ] Configure features and benefits
- [ ] Display package options
- [ ] Handle loading states
- [ ] Track analytics events
- [ ] Test purchase flow
- [ ] Test close behavior
- [ ] Verify responsive design

### Common Patterns

1. **Manual Trigger**: Show on button press
2. **Usage Limit**: Show after N free uses
3. **Feature Gate**: Show when accessing premium feature
4. **Time-based**: Show after certain time/usage
5. **Event-driven**: Show on specific app events
6. **A/B Testing**: Test different copy and layouts

## Related Documentation

- **usePaywall**: Paywall state management
- **usePaywallOperations**: Purchase operations
- **usePaywallVisibility**: Visibility control
- **PaywallDomain**: `../../../domains/paywall/README.md`
- **Paywall README**: `./README.md`
