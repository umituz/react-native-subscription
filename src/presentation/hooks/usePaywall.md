# usePaywall Hook

Hook for controlling paywall visibility and state.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/usePaywall.ts`

**Type**: Hook

## Strategy

### Paywall State Management

1. **Visibility Control**: Show/hide paywall on demand
2. **Trigger Tracking**: Record what triggered paywall display
3. **Context Management**: Store paywall context and metadata
4. **Dynamic Configuration**: Support custom paywall configs per trigger
5. **State Persistence**: Maintain paywall state across component renders
6. **Event Tracking**: Enable analytics for paywall interactions

### Integration Points

- **Paywall Context**: Global paywall state management
- **Paywall Domain**: `src/domains/paywall/README.md`
- **Analytics**: For tracking paywall impressions and conversions
- **Navigation**: For paywall screen routing

## Restrictions

### REQUIRED

- **State Management**: MUST use showPaywall/hidePaywall functions
- **Trigger Tracking**: SHOULD include trigger information for analytics
- **Context**: SHOULD provide relevant context for paywall display

### PROHIBITED

- **NEVER** manage paywall state locally (use this hook instead)
- **NEVER** show paywall without user action or clear trigger
- **DO NOT** show paywall too frequently (respect user experience)

### CRITICAL SAFETY

- **ALWAYS** hide paywall on successful purchase
- **NEVER** trap users in paywall (provide clear exit)
- **MUST** track paywall triggers for analytics
- **ALWAYS** provide close/dismiss option

## AI Agent Guidelines

### When Implementing Paywall Triggers

1. **Always** include trigger source/context
2. **Always** track paywall impressions
3. **Always** provide clear close button
4. **Never** show paywall without clear reason
5. **Always** hide paywall after successful purchase

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Use showPaywall with trigger information
- [ ] Implement hidePaywall callback
- [ ] Track paywall impressions in analytics
- [ ] Track paywall dismissals
- [ ] Provide clear close button
- [ ] Test manual trigger
- [ ] Test automatic trigger (usage limit, etc.)
- [ ] Test purchase flow completion
- [ ] Verify paywall hides after purchase

### Common Patterns

1. **Manual Trigger**: User clicks upgrade button
2. **Usage Limit**: Show after N free uses
3. **Feature Gate**: Show when accessing premium feature
4. **Time-based**: Show after certain time/usage
5. **Event-driven**: Show on specific app events

## Related Documentation

- **usePaywallActions**: Paywall purchase actions
- **usePaywallVisibility**: Conditional paywall display logic
- **usePaywallOperations**: Complete paywall operations
- **Paywall Domain**: `src/domains/paywall/README.md`
- **Paywall Components**: `src/presentation/components/paywall/README.md`
