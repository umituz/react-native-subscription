# useDevTestCallbacks Hook

**Development-only** hook for testing subscription renewal and credit operations.

## Import

```typescript
import { useDevTestCallbacks } from '@umituz/react-native-subscription';
```

## Signature

```typescript
function useDevTestCallbacks(): {
  onTestRenewal: () => void;
  onCheckCredits: () => void;
  onTestDuplicate: () => void;
} | undefined
```

## Returns

Returns `undefined` in production. In development, returns:

| Property | Type | Description |
|----------|------|-------------|
| `onTestRenewal` | `() => void` | Simulate subscription renewal |
| `onCheckCredits` | `() => void` | Show current credits in alert |
| `onTestDuplicate` | `() => void` | Test duplicate renewal protection |

## Important Notes

⚠️ **Development Only**
- This hook only works in `__DEV__` mode
- Returns `undefined` in production builds
- Use for testing and development purposes only

## Basic Usage

```typescript
function DevTestSection() {
  const devCallbacks = useDevTestCallbacks();

  // Don't render in production
  if (!devCallbacks) return null;

  const { onTestRenewal, onCheckCredits, onTestDuplicate } = devCallbacks;

  return (
    <View style={styles.devSection}>
      <Text style={styles.title}>Developer Tools</Text>

      <Button onPress={onTestRenewal} title="Test Renewal" />
      <Button onPress={onCheckCredits} title="Check Credits" />
      <Button onPress={onTestDuplicate} title="Test Duplicate Protection" />
    </View>
  );
}
```

## Advanced Usage

### Complete Dev Test Panel

```typescript
function DevTestPanel() {
  const devCallbacks = useDevTestCallbacks();

  if (!__DEV__ || !devCallbacks) return null;

  const { onTestRenewal, onCheckCredits, onTestDuplicate } = devCallbacks;

  return (
    <ScrollView style={styles.devPanel}>
      <Text style={styles.header}>Developer Test Panel</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Renewal Testing</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={onTestRenewal}
        >
          <Text>Test Renewal (Add Credits)</Text>
        </TouchableOpacity>

        <Text style={styles.help}>
          Simulates a subscription renewal and adds credits using ACCUMULATE mode
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Credits Inspection</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={onCheckCredits}
        >
          <Text>Check Current Credits</Text>
        </TouchableOpacity>

        <Text style={styles.help}>
          Display current credit balance and purchase date
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Duplicate Protection</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={onTestDuplicate}
        >
          <Text>Test Duplicate Protection</Text>
        </TouchableOpacity>

        <Text style={styles.help}>
          Tests that duplicate renewals with the same ID are prevented
        </Text>
      </View>
    </ScrollView>
  );
}
```

### With Settings Screen Integration

```typescript
function SettingsScreen() {
  const devCallbacks = useDevTestCallbacks();

  return (
    <ScrollView>
      <Section title="Account">
        <SettingsItem label="Email" value={user?.email} />
        <SettingsItem label="Subscription" value={isPremium ? 'Premium' : 'Free'} />
      </Section>

      {/* Only show in development */}
      {__DEV__ && devCallbacks && (
        <Section title="Developer Tools">
          <SettingsItem
            label="Test Renewal"
            onPress={devCallbacks.onTestRenewal}
          />
          <SettingsItem
            label="Check Credits"
            onPress={devCallbacks.onCheckCredits}
          />
          <SettingsItem
            label="Test Duplicate Protection"
            onPress={devCallbacks.onTestDuplicate}
          />
        </Section>
      )}
    </ScrollView>
  );
}
```

### With Debug Menu

```typescript
function DebugMenu() {
  const devCallbacks = useDevTestCallbacks();

  if (!__DEV__) return null;

  return (
    <Menu>
      {devCallbacks && (
        <>
          <MenuItem onPress={devCallbacks.onTestRenewal}>
            Test Renewal
          </MenuItem>
          <MenuItem onPress={devCallbacks.onCheckCredits}>
            Check Credits
          </MenuItem>
          <MenuItem onPress={devCallbacks.onTestDuplicate}>
            Test Duplicate Protection
          </MenuItem>
        </>
      )}
    </Menu>
  );
}
```

## Test Functions

### onTestRenewal

Simulates a subscription renewal event:

```typescript
const onTestRenewal = () => {
  // Simulates renewal with:
  // - renewalId: `dev_renewal_${Date.now()}`
  // - productId: 'test_yearly_subscription'
  // - Mode: ACCUMULATE (adds to existing credits)

  // Shows alert with:
  // - New credit balance
  // - Confirmation of ACCUMULATE mode
};
```

**Example output:**
```
✅ Test Renewal Success
Credits Updated!

New Balance: 1200

(ACCUMULATE mode - credits added to existing)
```

### onCheckCredits

Displays current credit information:

```typescript
const onCheckCredits = () => {
  // Shows alert with:
  // - Current credit balance
  // - Purchase date (or "N/A")
};
```

**Example output:**
```
📊 Current Credits
Credits: 100

Purchased: January 15, 2024
```

### onTestDuplicate

Tests duplicate renewal protection:

```typescript
const onTestDuplicate = () => {
  // Performs two initialization calls with same renewalId:
  // - First call: Adds credits
  // - Second call: Should be skipped

  // Shows alert with:
  // - First call result
  // - Second call result (should indicate protection worked)
};
```

**Example output:**
```
Duplicate Test
First call: ✅ Added credits

Second call: ✅ Skipped (protection works!)
```

## Development Logging

The hook logs detailed information in development:

```typescript
// Test renewal
🧪 [Dev Test] Simulating auto-renewal...
{
  userId: 'user-123',
  renewalId: 'dev_renewal_1705311234567'
}
✅ [Dev Test] Renewal completed:
{
  success: true,
  credits: 1100
}

// Check credits
📊 Current Credits
Credits: 100
Purchased: January 15, 2024

// Test duplicate
🧪 [Dev Test] Testing duplicate protection...
First call: { credits: 100, ... }
Second call: { credits: 100, ... }
```

## Examples

### Comprehensive Dev Dashboard

```typescript
function DevDashboard() {
  const devCallbacks = useDevTestCallbacks();

  if (!__DEV__ || !devCallbacks) return null;

  const { user } = useAuth();
  const { credits } = useCredits();

  return (
    <View style={styles.dashboard}>
      <View style={styles.header}>
        <Text style={styles.title}>Development Dashboard</Text>
        <Text style={styles.subtitle}>
          User: {user?.uid || 'Not logged in'}
        </Text>
        <Text style={styles.subtitle}>
          Credits: {credits?.credits || 0}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={devCallbacks.onTestRenewal}
        >
          <Icon name="refresh" size={20} />
          <Text>Simulate Renewal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={devCallbacks.onCheckCredits}
        >
          <Icon name="search" size={20} />
          <Text>Inspect Credits</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={devCallbacks.onTestDuplicate}
        >
          <Icon name="shield" size={20} />
          <Text>Test Duplicate Protection</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>Test Mode Active</Text>
        <Text style={styles.infoText}>
          All operations use test data and won't affect production
        </Text>
      </View>
    </View>
  );
}
```

### With Flow Testing

```typescript
function RenewalFlowTest() {
  const devCallbacks = useDevTestCallbacks();

  if (!__DEV__ || !devCallbacks) return null;

  const testRenewalFlow = async () => {
    // 1. Check initial credits
    devCallbacks.onCheckCredits();

    // 2. Simulate renewal
    await new Promise(resolve => setTimeout(resolve, 1000));
    devCallbacks.onTestRenewal();

    // 3. Verify credits increased
    await new Promise(resolve => setTimeout(resolve, 1000));
    devCallbacks.onCheckCredits();

    // 4. Test duplicate protection
    await new Promise(resolve => setTimeout(resolve, 1000));
    devCallbacks.onTestDuplicate();
  };

  return (
    <Button
      onPress={testRenewalFlow}
      title="Run Complete Renewal Flow Test"
    />
  );
}
```

## Best Practices

1. **Development only** - Never use in production code
2. **Guard with `__DEV__`** - Always check if in development mode
3. **Clear UI** - Make dev tools visually distinct
4. **Test thoroughly** - Use for testing renewal flows
5. **Document behavior** - Leave clear comments for other developers
6. **Remove before release** - Ensure dev UI doesn't ship
7. **Test edge cases** - Duplicate handling, error cases

## Production Safety

The hook is production-safe:

```typescript
export const useDevTestCallbacks = (): DevTestActions | undefined => {
  // ... implementation

  if (!__DEV__) {
    return undefined; // ✅ Returns undefined in production
  }

  return { onTestRenewal, onCheckCredits, onTestDuplicate };
};
```

## Related Hooks

- **useCredits** - For accessing credits balance
- **useInitializeCredits** - For credit initialization
- **usePremiumWithCredits** - For premium + credits integration

## See Also

- [Credits README](../../../domains/wallet/README.md)
- [Renewal Testing Guide](../../../docs/RENEWAL_TESTING.md)
- [Development Tools](../../../docs/DEV_TOOLS.md)
