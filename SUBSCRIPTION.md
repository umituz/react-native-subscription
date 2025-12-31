# Subscription Package - Best Practices

## Infinite Re-render Loop Prevention

### Problem Description

Using `usePremium` or subscription hooks in navigation components can cause infinite re-render loops if not properly memoized. The symptoms include:

- `HomeStack` or tab components constantly unmounting/remounting
- `creditsLoading` toggling between `true` and `false` endlessly
- App becoming unresponsive or extremely slow
- Console logs showing repeated render cycles

### Root Causes

1. **Inline object creation in hook parameters**
2. **Missing memoization in navigation components**
3. **Unstable references passed to navigation config**

---

## Prevention Strategies

### 1. Always Memoize Navigation Config Objects

**WRONG - Creates new object every render:**
```typescript
const tabConfig = useTabConfig({
  config: {
    screens: tabScreens,        // New object reference!
    initialRouteName: "Home",
  },
});
```

**CORRECT - Memoized config:**
```typescript
const tabNavigatorConfig = useMemo(
  () => ({
    screens: tabScreens,
    initialRouteName: "Home" as const,
  }),
  [tabScreens],  // Only recreate when tabScreens changes
);

const tabConfig = useTabConfig({
  config: tabNavigatorConfig,
});
```

### 2. Memoize Tab Screen Components

**WRONG - Creates new component every render:**
```typescript
const TabsScreen = () => <TabsNavigator config={tabConfig} />;
```

**CORRECT - Memoized component:**
```typescript
const TabsScreen = useCallback(
  () => <TabsNavigator config={tabConfig} />,
  [tabConfig],
);
```

### 3. Ensure Hook Dependencies are Stable

When using `usePremium` or similar hooks, ensure the `userId` parameter is stable:

```typescript
// userId from useAuth should be stable
const { user } = useAuth();
const { packages, isLoading, isPremium } = usePremium(user?.uid);
```

### 4. Use Proper staleTime for TanStack Query

The subscription package uses these defaults to prevent excessive refetching:

| Hook | staleTime | gcTime |
|------|-----------|--------|
| `useCredits` | 30 seconds | 5 minutes |
| `useSubscriptionPackages` | 5 minutes | 30 minutes |
| `useSubscriptionStatus` | 30 seconds | 5 minutes |

If you need to customize:
```typescript
const { credits } = useCredits({
  userId,
  cache: {
    staleTime: 60 * 1000,  // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
});
```

---

## Complete Example: Properly Configured MainNavigator

```typescript
import React, { useCallback, useMemo } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { TabsNavigator, useTabConfig } from "@umituz/react-native-design-system";
import { useTabScreens } from "../hooks/useTabScreens";
import { useStackScreens } from "../hooks/useStackScreens";

const Stack = createStackNavigator();

export const MainNavigator: React.FC = () => {
  // 1. Get tab screens (should be memoized in the hook itself)
  const tabScreens = useTabScreens();
  const stackScreens = useStackScreens();

  // 2. Memoize the config object
  const tabNavigatorConfig = useMemo(
    () => ({
      screens: tabScreens,
      initialRouteName: "Home" as const,
    }),
    [tabScreens],
  );

  // 3. Use memoized config
  const tabConfig = useTabConfig({
    config: tabNavigatorConfig,
  });

  // 4. Memoize the tabs component
  const TabsScreen = useCallback(
    () => <TabsNavigator config={tabConfig} />,
    [tabConfig],
  );

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabsScreen} />
      {stackScreens.map((screen) => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={screen.options}
        />
      ))}
    </Stack.Navigator>
  );
};
```

---

## Debugging Infinite Loops

### 1. Add Debug Logs

```typescript
// In your component
React.useEffect(() => {
  if (__DEV__) console.log("[MyComponent] Mounted");
  return () => {
    if (__DEV__) console.log("[MyComponent] Unmounting");
  };
}, []);
```

### 2. Check for Repeated Mount/Unmount Patterns

Look for these patterns in console:
```
[HomeStack] Mounted
[HomeStack] Unmounting
[HomeStack] Mounted
[HomeStack] Unmounting
...
```

### 3. Track Loading State Changes

```typescript
const { isLoading, creditsLoading, packagesLoading } = usePremium(userId);

if (__DEV__) {
  console.log('[DEBUG] Loading states:', {
    isLoading,
    creditsLoading,
    packagesLoading,
  });
}
```

If `creditsLoading` toggles rapidly between `true` and `false`, you have a re-render loop.

---

## Common Mistakes to Avoid

### 1. Using Translation Function in Dependencies

**WRONG:**
```typescript
const screens = useMemo(() => [
  { name: "Home", label: t("home") },
], [t]);  // t changes on every render in some i18n libraries
```

**CORRECT:**
```typescript
// Keep t in useMemo but ensure i18n library provides stable reference
// Or extract labels outside the memoization
```

### 2. Inline Functions in Navigation Options

**WRONG:**
```typescript
<Stack.Screen
  options={{
    headerRight: () => <Button onPress={() => doSomething()} />,
  }}
/>
```

**CORRECT:**
```typescript
const headerRight = useCallback(() => (
  <Button onPress={handlePress} />
), [handlePress]);

<Stack.Screen options={{ headerRight }} />
```

### 3. Non-Memoized Callbacks Passed to Hooks

**WRONG:**
```typescript
const { handlePurchase } = usePaywallOperations({
  onPurchaseSuccess: () => {
    // This creates new function every render
    closePaywall();
  },
});
```

**CORRECT:**
```typescript
const handlePurchaseSuccess = useCallback(() => {
  closePaywall();
}, [closePaywall]);

const { handlePurchase } = usePaywallOperations({
  onPurchaseSuccess: handlePurchaseSuccess,
});
```

---

## Quick Checklist

Before deploying, verify:

- [ ] All config objects passed to hooks are memoized with `useMemo`
- [ ] Tab/Stack screen components are wrapped with `useCallback`
- [ ] No inline object/function creation in render
- [ ] Dependencies in `useMemo`/`useCallback` are stable
- [ ] No rapid mount/unmount cycles in console logs
- [ ] `creditsLoading` settles to `false` and stays stable
