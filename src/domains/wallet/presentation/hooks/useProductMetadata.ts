/**
 * useProductMetadata Hook
 *
 * TanStack Query hook for fetching product metadata.
 * Generic and reusable - uses config from ProductMetadataService.
 */

import { useQuery } from "@umituz/react-native-design-system";
import type {
  ProductMetadata,
  ProductMetadataConfig,
  ProductType,
} from "../../domain/types/wallet.types";
import { ProductMetadataService } from "../../infrastructure/services/ProductMetadataService";

const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
};

export const productMetadataQueryKeys = {
  all: ["productMetadata"] as const,
  byType: (type: ProductType) => ["productMetadata", type] as const,
};

export interface UseProductMetadataParams {
  config: ProductMetadataConfig;
  type?: ProductType;
  enabled?: boolean;
}

export interface UseProductMetadataResult {
  products: ProductMetadata[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  creditsPackages: ProductMetadata[];
  subscriptionPackages: ProductMetadata[];
}

export function useProductMetadata({
  config,
  type,
  enabled = true,
}: UseProductMetadataParams): UseProductMetadataResult {
  const service = new ProductMetadataService(config);

  const queryKey = type
    ? productMetadataQueryKeys.byType(type)
    : productMetadataQueryKeys.all;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (type) {
        return service.getByType(type);
      }
      return service.getAll();
    },
    enabled,
    staleTime: CACHE_CONFIG.staleTime,
    gcTime: CACHE_CONFIG.gcTime,
  });

  const products = data ?? [];

  const creditsPackages = products.filter((p) => p.type === "credits");
  const subscriptionPackages = products.filter((p) => p.type === "subscription");

  if (__DEV__) {
    console.log("[useProductMetadata] State", {
      enabled,
      isLoading,
      count: products.length,
      credits: creditsPackages.length,
      subscriptions: subscriptionPackages.length,
    });
  }

  return {
    products,
    isLoading,
    error: error as Error | null,
    refetch,
    creditsPackages,
    subscriptionPackages,
  };
}
