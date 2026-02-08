/**
 * useCustomerInfo Hook
 * Fetches and manages RevenueCat CustomerInfo with real-time updates
 *
 * BEST PRACTICE: Always get expiration date from CustomerInfo (source of truth)
 * Never calculate expiration dates client-side (purchaseDate + 1 year is WRONG)
 *
 * This hook provides:
 * - Initial fetch from SDK cache (instant, no network)
 * - Real-time listener for updates (renewals, purchases, restore)
 * - Automatic cleanup on unmount
 * - SDK caches CustomerInfo and fetches every ~5 minutes
 *
 * @see https://www.revenuecat.com/docs/customers/customer-info
 */

import { useEffect, useState, useCallback } from "react";
import Purchases, { type CustomerInfo } from "react-native-purchases";

export interface UseCustomerInfoResult {
  /** Current CustomerInfo from RevenueCat SDK */
  customerInfo: CustomerInfo | null;
  /** Loading state (only true on initial fetch) */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Manually refetch CustomerInfo (usually not needed, listener handles updates) */
  refetch: () => Promise<void>;
  /** Whether SDK is currently fetching */
  isFetching: boolean;
}

/**
 * Hook to get CustomerInfo from RevenueCat SDK
 *
 * Features:
 * - SDK cache: First call returns cached data (instant)
 * - Auto-updates: Listener triggers on renewals, purchases, restore
 * - Network fetch: SDK fetches every ~5 minutes in background
 * - Grace periods: Expiration dates include grace period automatically
 *
 * @example
 * ```typescript
 * const { customerInfo, loading } = useCustomerInfo();
 *
 * // Check premium status
 * const isPremium = !!customerInfo?.entitlements.active['premium'];
 *
 * // Get expiration date (ALWAYS from CustomerInfo, NEVER calculate!)
 * const expiresAt = customerInfo?.entitlements.active['premium']?.expirationDate;
 *
 * // Check will renew
 * const willRenew = customerInfo?.entitlements.active['premium']?.willRenew;
 * ```
 *
 * @returns CustomerInfo and loading state
 */
export function useCustomerInfo(): UseCustomerInfoResult {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerInfo = useCallback(async () => {
    try {
      setIsFetching(true);
      setError(null);

      // SDK returns cached data instantly if available
      // Network fetch happens in background automatically
      const info = await Purchases.getCustomerInfo();

      setCustomerInfo(info);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch customer info";
      setError(errorMessage);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchCustomerInfo();

    // Listen for real-time updates (renewals, purchases, restore)
    const listener = (info: CustomerInfo) => {
      setCustomerInfo(info);
      setError(null);
    };

    Purchases.addCustomerInfoUpdateListener(listener);

    // Cleanup listener on unmount
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [fetchCustomerInfo]);

  return {
    customerInfo,
    loading,
    error,
    refetch: fetchCustomerInfo,
    isFetching,
  };
}
