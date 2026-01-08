# useSubscriptionSettingsConfig Hook

Returns ready-to-use configuration for subscription settings screens.

## Location

**Import Path**: `@umituz/react-native-subscription`

**File**: `src/presentation/hooks/useSubscriptionSettingsConfig.ts`

**Type**: Hook

## Strategy

### Settings Configuration Generation

1. **Data Aggregation**: Combine subscription, credits, and tier information
2. **Status Determination**: Calculate status type (active/expired/free/canceled)
3. **Date Formatting**: Format expiration and purchase dates
4. **Credit Items**: Generate credit item list with optional limit
5. **Translation Support**: Apply provided translations to all strings
6. **Upgrade Prompt**: Optional upgrade prompt configuration

### Integration Points

- **useSubscriptionStatus**: For subscription status details
- **useCredits**: For credits information
- **useUserTier**: For tier determination
- **Settings UI**: For settings screen integration
- **Translation System**: For localization support

## Restrictions

### REQUIRED

- **User ID**: MUST provide valid userId parameter
- **Translations**: MUST provide all translation strings
- **Null Handling**: MUST handle null dates and values
- **Enabled Check**: MUST check config.enabled before use

### PROHIBITED

- **NEVER** use without providing all translations
- **NEVER** assume config is enabled (check enabled flag)
- **DO NOT** hardcode translation strings
- **DO NOT** use without userId

### CRITICAL SAFETY

- **ALWAYS** check config.enabled before rendering
- **MUST** provide complete translation objects
- **ALWAYS** handle null dates gracefully
- **NEVER** trust client-side config for security

## AI Agent Guidelines

### When Implementing Settings Config

1. **Always** provide complete translations
2. **Always** check config.enabled
3. **Always** handle null dates
4. **Always** format dates appropriately
5. **Never** use for security decisions without server validation

### Integration Checklist

- [ ] Import from correct path: `@umituz/react-native-subscription`
- [ ] Provide valid userId
- [ ] Provide complete translations
- [ ] Check config.enabled
- [ ] Handle null dates
- [ ] Format dates appropriately
- [ ] Apply credit limit if needed
- [ ] Configure upgrade prompt if needed
- [ ] Test with active subscription
- [ ] Test with expired subscription
- [ ] Test with free user
- [ ] Test with lifetime subscription

### Common Patterns

1. **Settings List Item**: Quick access item in settings
2. **Detailed Section**: Comprehensive subscription section
3. **Localized Settings**: Use with translation libraries
4. **Credit Limit**: Limit displayed credit items
5. **Upgrade Prompt**: Show upgrade prompt for free users

## Related Documentation

- **useSubscriptionStatus**: For subscription status details
- **useCredits**: For credits information
- **useSubscriptionDetails**: For package and pricing info
- **Settings Screen**: `src/presentation/screens/README.md`
- **Subscription Utilities**: `src/utils/subscriptionDateUtils.md`
