# Utils

## Location
Abonelik sistemi için yardımcı fonksiyonlar ve utility araçları.

## Strategy
Bu dizin, premium durum kontrolü, kullanıcı tier yönetimi, paket işlemleri, fiyat hesaplama, periyot formatlama, asenkron işlemler, validasyon ve veri dönüşümü için yardımcı fonksiyonlar içerir.

## Restrictions

### REQUIRED
- Must maintain type safety for all functions
- Must handle null checks safely
- Must support localization
- Must validate all inputs

### PROHIBITED
- DO NOT bypass null safety checks
- DO NOT ignore error handling
- DO NOT hardcode locale values
- DO NOT skip validation

### CRITICAL SAFETY
- All functions MUST be type-safe
- Null checks MUST be performed safely
- Errors MUST be caught and handled
- Validation MUST return clear results

## AI Agent Guidelines
1. Maintain type safety for all utility functions
2. Perform null checks safely with proper guards
3. Catch and handle errors appropriately
4. Support localization for different locales
5. Write JSDoc comments for all functions
6. Test utility functions thoroughly with edge cases
7. Provide clear validation error messages

## Related Documentation
- Premium utilities for status checks
- User tier utilities for tier management
- Package utilities for RevenueCat integration
- Price utilities for formatting and calculation
