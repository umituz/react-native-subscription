# useAuthGate Hook

Hook for combining authentication and subscription gating.

## Import

```typescript
import { useAuthGate } from '@umituz/react-native-subscription';
```

## Signature

```typescript
function useAuthGate(config?: {
  requireAuth?: boolean;
  requireSubscription?: boolean;
}): {
  isAuthenticated: boolean;
  isAuthorized: boolean;
  user: User | null;
  subscription: SubscriptionStatus | null;
  signIn: () => void;
  signOut: () => void;
  isLoading: boolean;
}
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `requireAuth` | `boolean` | `false` | Require user to be logged in |
| `requireSubscription` | `boolean` | `false` | Require premium subscription |

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `isAuthenticated` | `boolean` | User is logged in |
| `isAuthorized` | `boolean` | User meets all requirements |
| `user` | `User \| null` | Current user object |
| `subscription` | `SubscriptionStatus \| null` | Subscription status |
| `signIn` | `() => void` | Trigger sign in |
| `signOut` | `() => void` | Trigger sign out |
| `isLoading` | `boolean` | Loading state |

## Basic Usage

```typescript
function ProtectedFeature() {
  const { isAuthorized, signIn, isLoading } = useAuthGate({
    requireAuth: true,
    requireSubscription: true,
  });

  if (isLoading) return <ActivityIndicator />;

  if (!isAuthorized) {
    return (
      <View>
        <Text>This feature requires Premium</Text>
        <Button onPress={signIn} title="Sign In / Subscribe" />
      </View>
    );
  }

  return <PremiumFeature />;
}
```

## Use Cases

### Auth Required Only

```typescript
function AuthRequiredComponent() {
  const { isAuthorized, signIn } = useAuthGate({
    requireAuth: true,
    requireSubscription: false,
  });

  if (!isAuthorized) {
    return (
      <View>
        <Text>Please sign in to continue</Text>
        <Button onPress={signIn} title="Sign In" />
      </View>
    );
  }

  return <UserDashboard />;
}
```

### Subscription Required (Auth Implicit)

```typescript
function SubscriptionRequiredComponent() {
  const { isAuthorized, user, subscription } = useAuthGate({
    requireAuth: false, // Auto-handles auth internally
    requireSubscription: true,
  });

  if (!isAuthorized) {
    return (
      <View>
        <Text>This feature requires Premium</Text>
        <Button
          onPress={() => user ? showPaywall() : signIn()}
          title={user ? 'Upgrade' : 'Sign In & Subscribe'}
        />
      </View>
    );
  }

  return <PremiumContent />;
}
```

### Both Auth and Subscription Required

```typescript
function FullyProtectedFeature() {
  const {
    isAuthorized,
    user,
    subscription,
    signIn,
    isLoading
  } = useAuthGate({
    requireAuth: true,
    requireSubscription: true,
  });

  if (isLoading) return <LoadingScreen />;

  if (!isAuthorized) {
    if (!user) {
      return <SignInPrompt onSignIn={signIn} />;
    }

    if (!subscription?.isPremium) {
      return <UpgradePrompt onUpgrade={() => navigation.navigate('Paywall')} />;
    }
  }

  return <PremiumContent />;
}
```

## Advanced Usage

### Progressive Gating

```typescript
function ProgressiveAccess() {
  const { isAuthorized, user, subscription } = useAuthGate({
    requireAuth: true,
    requireSubscription: true,
  });

  // Determine access level
  const accessLevel = !user
    ? 'public'
    : !subscription?.isPremium
    ? 'authenticated'
    : 'premium';

  const features = {
    public: ['Basic Browse'],
    authenticated: ['Save Favorites', 'View History'],
    premium: ['Advanced Filters', 'AI Features', 'Priority Support'],
  };

  return (
    <FeatureList
      availableFeatures={features[accessLevel]}
      onFeatureLocked={(feature) => showUpgradePrompt(feature, accessLevel)}
    />
  );
}
```

### With Graceful Degradation

```typescript
function GracefulDegradationComponent() {
  const { isAuthorized, user, subscription } = useAuthGate({
    requireAuth: true,
    requireSubscription: true,
  });

  if (!isAuthorized) {
    // Show limited version with upgrade prompt
    return (
      <View>
        <FeatureFreeVersion />

        <View style={styles.upgradeBanner}>
          <Text>Upgrade to unlock all features</Text>
          <Button onPress={() => user ? showPaywall() : signIn()} />
        </View>
      </View>
    );
  }

  return <FullVersion />;
}
```

### With Custom Auth Flow

```typescript
function CustomAuthFlow() {
  const { isAuthorized, signIn } = useAuthGate({
    requireAuth: true,
  });

  const handleSignIn = () => {
    // Navigate to custom auth flow
    navigation.navigate('CustomAuth', {
      onSuccess: () => {
        // Auth success, callback will trigger re-render
      },
    });
  };

  if (!isAuthorized) {
    return (
      <View>
        <Text>Sign in to access this feature</Text>
        <Button onPress={handleSignIn} title="Sign In" />
      </View>
    );
  }

  return <ProtectedContent />;
}
```

## Integration Examples

### Navigation Guard

```typescript
function ProtectedScreen() {
  const { isAuthorized, signIn } = useAuthGate({
    requireAuth: true,
    requireSubscription: true,
  });

  useEffect(() => {
    if (!isAuthorized) {
      // Replace navigation instead of just showing UI
      navigation.replace('AuthGate', {
        requireAuth: true,
        requireSubscription: true,
        returnTo: 'ProtectedScreen',
      });
    }
  }, [isAuthorized]);

  if (!isAuthorized) return null;

  return <ScreenContent />;
}
```

### Settings Screen

```typescript
function SettingsScreen() {
  const { user, subscription, signIn, signOut } = useAuthGate({
    requireAuth: true,
  });

  return (
  <ScrollView>
    <Section title="Account">
      <InfoRow label="Email" value={user?.email} />
      <InfoRow
        label="Subscription"
        value={subscription?.type || 'Free'}
      />
    </Section>

    <Section title="Actions">
      <Button
        onPress={signIn}
        title="Sign In"
      />
      <Button
        onPress={signOut}
        title="Sign Out"
      />
    </Section>
  </ScrollView>
);
}
```

### Content Based on Access Level

```typescript
function DynamicContent() {
  const { isAuthorized, user, subscription } = useAuthGate({
    requireAuth: true,
    requireSubscription: false,
  });

  return (
    <View>
      {/* Always visible */}
      <PublicContent />

      {/* Authenticated users */}
      {user && <AuthenticatedContent />}

      {/* Premium users */}
      {subscription?.isPremium && <PremiumContent />}
    </View>
  );
}
```

## Best Practices

1. **Check authorization first** - Before rendering content
2. **Provide clear messaging** - Tell users what's required
3. **Easy sign-in flow** - Make authentication simple
4. **Show upgrade path** - Guide users to subscription
5. **Handle loading** - Show loading states appropriately
6. **Cache auth state** - Avoid unnecessary re-authentication
7. **Sign out cleanup** - Clear sensitive data on sign out

## Testing

```typescript
describe('useAuthGate', () => {
  it('should authorize authenticated user', () => {
    const { result } = renderHook(() =>
      useAuthGate({ requireAuth: true }),
      {
        wrapper: ({ children }) => (
          <AuthProvider value={{ user: { uid: '123' }}}>
            {children}
          </AuthProvider>
        ),
      }
    );

    expect(result.current.isAuthorized).toBe(true);
  });

  it('should not authorize unauthenticated user', () => {
    const { result } = renderHook(() =>
      useAuthGate({ requireAuth: true }),
      {
        wrapper: ({ children }) => (
          <AuthProvider value={{ user: null }}>
            {children}
          </AuthProvider>
        ),
      }
    );

    expect(result.current.isAuthorized).toBe(false);
  });

  it('should authorize premium user', () => {
    const { result } = renderHook(() =>
      useAuthGate({ requireSubscription: true }),
      {
        wrapper: ({ children }) => (
          <AuthProvider
            value={{
              user: { uid: '123' },
              subscription: { type: 'premium', isActive: true },
            }}
          >
            {children}
          </AuthProvider>
        ),
      }
    );

    expect(result.current.isAuthorized).toBe(true);
  });
});
```

## Related Hooks

- **useAuth** - Authentication only
- **usePremium** - Premium check only
- **useSubscriptionGate** - Subscription gating
- **useUserTier** - Tier information

## See Also

- [Auth Integration](../../hooks/useAuthSubscriptionSync.md)
- [usePremium](./usePremium.md)
- [useUserTier](./useUserTier.md)
