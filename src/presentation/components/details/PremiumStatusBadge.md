# PremiumStatusBadge Component

Compact badge component displaying premium status.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/components/details/PremiumStatusBadge.tsx`

**Type**: Component

## Strategy

### Status Badge Display

1. **Status Detection**: Display appropriate status (premium/free)
2. **Visual Indication**: Use color and icon to indicate status
3. **Compact Design**: Small footprint for various use cases
4. **Styling Options**: Support different sizes and styles
5. **Accessibility**: Include accessibility labels
6. **Color Coding**: Use consistent colors for status types

### Integration Points

- **usePremium**: For premium status check
- **Headers**: Display in screen headers
- **Cards**: Add to cards as status indicator
- **Lists**: Use in list items as badge
- **Buttons**: Add to buttons for premium features

## Restrictions

### REQUIRED

- **Status Prop**: MUST provide valid status boolean
- **Accessibility**: MUST include accessibility label
- **Color Consistency**: MUST use consistent colors
- **Size Constraint**: SHOULD maintain compact size

### PROHIBITED

- **NEVER** display without status prop
- **NEVER** use inconsistent colors
- **DO NOT** make badge too large
- **DO NOT** use for non-premium status

### CRITICAL SAFETY

- **ALWAYS** validate status prop
- **MUST** include accessibility support
- **ALWAYS** use approved color schemes
- **NEVER** expose implementation logic

## AI Agent Guidelines

### When Implementing Status Badges

1. **Always** provide valid status boolean
2. **Always** include accessibility label
3. **Always** use consistent colors
4. **Always** maintain compact size
5. **Never** use for non-status indicators

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Provide valid status prop
- [ ] Include accessibility label
- [ ] Apply appropriate styling
- [ ] Test with premium status
- [ ] Test with free status
- [ ] Test in different contexts
- [ ] Verify color consistency
- [ ] Check accessibility support
- [ ] Test size constraints

### Common Patterns

1. **Header Badge**: Display in screen headers
2. **Card Badge**: Add to premium cards
3. **List Indicator**: Use in list items
4. **Button Badge**: Add to premium feature buttons
5. **Profile Badge**: Show in user profile

## Related Documentation

- **PremiumDetailsCard**: Premium status card
- **DetailRow**: Detail row component
- **usePremium**: Premium status hook
- **Details README**: `./README.md`
