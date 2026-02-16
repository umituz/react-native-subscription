/**
 * Customer Info Hook
 * Fetches customer info without registering a listener
 * CustomerInfoListenerManager handles all listener logic
 */

import { useQuery, useQueryClient } from "@umituz/react-native-design-system";
import { useEffect, useRef } from "react";
import Purchases from "react-native-purchases";
import type { UseCustomerInfoResult } from "./types";
import { SUBSCRIPTION_QUERY_KEYS } from "../subscriptionQueryKeys";

export function useCustomerInfo(): UseCustomerInfoResult {
  const queryClient = useQueryClient();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const query = useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEYS.customerInfo,
    queryFn: async () => {
      const info = await Purchases.getCustomerInfo();
      return info;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Expose refetch as a method
  const refetch = async () => {
    if (!mountedRef.current) return;
    await queryClient.invalidateQueries({
      queryKey: SUBSCRIPTION_QUERY_KEYS.customerInfo,
    });
  };

  return {
    customerInfo: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch,
    isFetching: query.isFetching,
  };
}
