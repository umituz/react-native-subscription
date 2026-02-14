import { useQuery } from "@umituz/react-native-design-system";
import { useMemo } from "react";
import type {
  ProductMetadata,
  ProductMetadataConfig,
  ProductType,
} from "../../domain/types/wallet.types";
import { ProductMetadataService } from "../../infrastructure/services/ProductMetadataService";

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
  const service = useMemo(
    () => new ProductMetadataService(config),
    [config]
  );

  const queryKey = type
    ? productMetadataQueryKeys.byType(type)
    : productMetadataQueryKeys.all;

  const { data, status, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (type) {
        return service.getByType(type);
      }
      return service.getAll();
    },
    enabled,
    gcTime: 0,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
  });

  const products = data ?? [];
  const isLoading = status === "pending";

  const creditsPackages = products.filter((p) => p.type === "credits");
  const subscriptionPackages = products.filter((p) => p.type === "subscription");

  return {
    products,
    isLoading,
    error: error as Error | null,
    refetch,
    creditsPackages,
    subscriptionPackages,
  };
}

