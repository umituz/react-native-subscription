# Screens

Tam ekran UI bileşenleri ve ekranlar.

## Location

`src/presentation/screens/`

## Strategy

Tam ekran kullanıcı arayüzü bileşenleri ve navigasyon akışlarını içerir. Abonelik detaylarını gösterir ve yönetim işlevleri sağlar.

## Restrictions

### REQUIRED

- MUST integrate properly with React Navigation
- MUST provide appropriate headers and navigation
- MUST handle loading states gracefully
- MUST handle error states gracefully
- MUST support back navigation
- MUST be responsive across different screen sizes

### PROHIBITED

- MUST NOT bypass navigation stack
- MUST NOT create navigation dead-ends
- MUST NOT block user from navigating away
- MUST NOT hardcode navigation routes

### CRITICAL

- Always provide clear navigation paths
- Handle all loading and error states
- Ensure proper back button functionality
- Support deep linking when applicable
- Maintain consistent styling with rest of app

## AI Agent Guidelines

When working with screens:
1. Navigation - screen'i doğru navigation stack'e ekleyin
2. Header - uygun başlık ve stiller kullanın
3. Back Button - kullanıcının geri dönmesini sağlayın
4. Loading - yükleme durumlarını gösterin
5. Error - hata durumlarını graceful handle edin

## Related Documentation

- [Presentation Layer](../README.md)
- [Components](../components/README.md)
- [Hooks](../hooks/README.md)
