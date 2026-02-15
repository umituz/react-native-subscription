import { useEffect, useState, useCallback, useRef } from "react";
import Purchases, { type CustomerInfo } from "react-native-purchases";
import type { UseCustomerInfoResult } from "./types";

export function useCustomerInfo(): UseCustomerInfoResult {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerInfo = useCallback(async () => {
    try {
      setIsFetching(true);
      setError(null);

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

  const listenerRef = useRef<((info: CustomerInfo) => void) | null>(null);

  useEffect(() => {
    fetchCustomerInfo();

    const listener = (info: CustomerInfo) => {
      setCustomerInfo(info);
      setError(null);
    };

    listenerRef.current = listener;
    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      if (listenerRef.current) {
        Purchases.removeCustomerInfoUpdateListener(listenerRef.current);
        listenerRef.current = null;
      }
    };
  }, []); // fetchCustomerInfo is stable, setup listener once

  return {
    customerInfo,
    loading,
    error,
    refetch: fetchCustomerInfo,
    isFetching,
  };
}
