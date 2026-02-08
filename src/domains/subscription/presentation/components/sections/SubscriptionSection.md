# SubscriptionSection Component

Section component displaying subscription status with details and actions.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/components/sections/SubscriptionSection.tsx`

**Type**: Component

## Strategy

### Subscription Information Display

1. **Status Detection**: Display current subscription status (active/inactive/free)
2. **Detail Rendering**: Show expiration date, renewal status, product info
3. **Action Buttons**: Display manage or upgrade button based on status
4. **Loading States**: Handle loading and error states gracefully
5. **Translation Support**: Support custom translations for all text
6. **Visual Hierarchy**: Clear structure with status badge, details, and actions

### Integration Points

- **useSubscriptionStatus**: For subscription status data
- **usePremium**: For premium status check
- **DetailRow**: For displaying individual detail items
- **PremiumStatusBadge**: For status badge display
- **Navigation**: For manage/upgrade button actions

## Restrictions

### REQUIRED

- **Config Prop**: MUST provide valid subscription config object
- **Callback Handling**: MUST implement button callbacks
- **Loading State**: MUST handle loading state in UI
- **Null Handling**: MUST handle null status values

### PROHIBITED

- **NEVER** display without config data (show loading instead)
- **NEVER** hardcode status text (use translations)
- **DO NOT** show both manage and upgrade buttons simultaneously
- **DO NOT** show buttons for loading state

### CRITICAL SAFETY

- **ALWAYS** handle loading state before displaying data
- **MUST** validate config object before rendering
- **ALWAYS** provide clear button labels
- **NEVER** expose sensitive implementation details

## AI Agent Guidelines

### When Implementing Subscription Sections

1. **Always** provide valid subscription config
2. **Always** handle loading state
3. **Always** implement both button callbacks
4. **Always** use translations for localization
5. **Never** hardcode status strings

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Provide valid subscription config
- [ ] Implement onUpgradePress callback
- [ ] Implement onManagePress callback
- [ ] Handle loading state
- [ ] Handle null dates
- [ ] Provide translations for localization
- [ ] Test with active subscription
- [ ] Test with expired subscription
- [ ] Test with free user
- [ ] Test with lifetime subscription

### Common Patterns

1. **Settings Integration**: Add to settings screen
2. **Profile Display**: Show in user profile
3. **Status Card**: Display as standalone card
4. **With Navigation**: Navigate to detailed management
5. **Localized Display**: Use with i18n libraries
6. **Conditional Rendering**: Show/hide based on auth state

## Related Documentation

- **PremiumDetailsCard**: Detailed premium card
- **DetailRow**: Individual detail item
- **PremiumStatusBadge**: Status badge component
- **Subscription Hooks**: `../../hooks/README.md`
- **Sections README**: `./README.md`
