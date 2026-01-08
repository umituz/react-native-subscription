# DetailRow Component

Simple row component displaying a label-value pair for subscription details.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/components/details/DetailRow.tsx`

**Type**: Component

## Strategy

### Label-Value Display

1. **Label Positioning**: Display label on left side
2. **Value Positioning**: Display value on right side
3. **Space Distribution**: Even spacing between label and value
4. **Highlight Option**: Support highlighting values (e.g., expiration warnings)
5. **Custom Styling**: Allow style overrides for flexibility
6. **Consistent Layout**: Maintain consistent vertical spacing

### Integration Points

- **PremiumDetailsCard**: Uses this component internally
- **SubscriptionSection**: For subscription detail display
- **Settings Screens**: For settings detail items
- **List Components**: For detail lists

## Restrictions

### REQUIRED

- **Label Prop**: MUST provide valid label string
- **Value Prop**: MUST provide valid value string
- **Spacing**: MUST maintain consistent spacing
- **Null Handling**: MUST handle null or undefined values

### PROHIBITED

- **NEVER** display without label and value
- **NEVER** use highlight for non-warning cases
- **DO NOT** use excessively long labels (affects layout)
- **DO NOT** mix different data types in same list

### CRITICAL SAFETY

- **ALWAYS** validate label and value props
- **MUST** handle empty strings
- **ALWAYS** use highlight sparingly (for warnings only)
- **NEVER** expose sensitive raw data

## AI Agent Guidelines

### When Implementing Detail Rows

1. **Always** provide clear, concise labels
2. **Always** format values appropriately
3. **Always** use highlight only for warnings
4. **Always** keep labels short and consistent
5. **Never** display implementation details

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Provide valid label prop
- [ ] Provide valid value prop
- [ ] Format values appropriately
- [ ] Use highlight for warnings only
- [ ] Apply custom styling if needed
- [ ] Test with short values
- [ ] Test with long values
- [ ] Test with highlight enabled
- [ ] Test in list context
- [ ] Test standalone display

### Common Patterns

1. **Subscription Details**: Show subscription info
2. **Settings Items**: Display settings values
3. **Status Information**: Show various status types
4. **Date Display**: Format and show dates
5. **Compact Lists**: Display multiple details

## Related Documentation

- **PremiumDetailsCard**: Uses this component
- **CreditRow**: Similar component for credits
- **SubscriptionSection**: Section containing detail rows
- **Details README**: `./README.md`
