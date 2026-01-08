# Wallet Presentation Components

## Location
UI components for wallet and credit display.

## Strategy
This directory contains React Native components for displaying credits, transactions, and wallet information with clear visual hierarchy and status indicators.

## Restrictions

### REQUIRED
- Must show loading states appropriately
- Must provide empty state messages
- Must allow manual refresh capability
- Must display transaction history clearly

### PROHIBITED
- DO NOT hide credit balance from users
- DO NOT show technical errors directly
- DO NOT skip loading indicators
- DO NOT obscure transaction details

### CRITICAL SAFETY
- Credit balance MUST always be visible
- Status indicators MUST be color-coded appropriately
- Transaction history MUST be complete and accurate
- Purchase links MUST be easily accessible

## AI Agent Guidelines
1. Emphasize important information with visual hierarchy
2. Use color coding to indicate status (low/warning/good)
3. Show skeleton screens while loading data
4. Provide helpful empty state messages
5. Allow users to manually refresh credit data
6. Display complete transaction history
7. Make credit purchases easily accessible

## Related Documentation
- [Credit Row](../../../presentation/components/details/CreditRow.md)
- [Credits Hook](../hooks/README.md)
- [Wallet Domain](../../domain/README.md)
