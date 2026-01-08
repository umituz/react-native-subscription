# CreditRow Component

Row component displaying credit information with amount and label.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/components/details/CreditRow.tsx`

**Type**: Component

## Strategy

### Credit Information Display

1. **Amount Display**: Show credit amount with icon
2. **Label Display**: Show credit type or source label
3. **Visual Hierarchy**: Clear separation between amount and label
4. **Icon Integration**: Display appropriate icon for credit type
5. **Styling Options**: Support custom styling override
6. **Compact Layout**: Efficient use of space for list items

### Integration Points

- **useCredits**: For credit balance and transaction data
- **Icon System**: For credit type icons
- **List Components**: For credit transaction lists
- **Settings UI**: For credits section in settings

## Restrictions

### REQUIRED

- **Amount Prop**: MUST provide valid credit amount
- **Label Prop**: MUST provide descriptive label
- **Icon Display**: SHOULD display appropriate icon
- **Null Handling**: MUST handle null or zero values

### PROHIBITED

- **NEVER** display without amount
- **NEVER** hardcode icon types
- **DO NOT** use for non-credit data
- **DO NOT** display negative amounts without clear indication

### CRITICAL SAFETY

- **ALWAYS** validate amount prop
- **MUST** handle zero or null amounts
- **ALWAYS** provide clear labels
- **NEVER** expose raw transaction data

## AI Agent Guidelines

### When Implementing Credit Rows

1. **Always** provide valid amount
2. **Always** provide clear label
3. **Always** display appropriate icon
4. **Always** handle zero amounts
5. **Never** use for non-credit display

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Provide valid amount prop
- [ ] Provide clear label prop
- [ ] Display appropriate icon
- [ ] Handle zero amounts
- [ ] Handle null amounts
- [ ] Apply custom styling if needed
- [ ] Test with positive amount
- [ ] Test with zero amount
- [ ] Test in list context
- [ ] Test standalone display

### Common Patterns

1. **Transaction List**: Show credit transactions
2. **Balance Display**: Show current balance
3. **Allocation Breakdown**: Show credit sources
4. **History View**: Display transaction history
5. **Settings Section**: Credits section in settings

## Related Documentation

- **DetailRow**: Generic detail row component
- **PremiumDetailsCard**: Premium details card
- **useCredits**: Credits hook
- **Credits README**: `../../../../domains/wallet/README.md`
- **Details README**: `./README.md`
