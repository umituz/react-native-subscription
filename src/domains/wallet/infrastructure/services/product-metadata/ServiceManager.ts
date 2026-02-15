import type { ProductMetadataConfig } from "../../../domain/types/wallet.types";
import { ProductMetadataService } from "./ProductMetadataService";

export function createProductMetadataService(
  config: ProductMetadataConfig
): ProductMetadataService {
  return new ProductMetadataService(config);
}

let defaultService: ProductMetadataService | null = null;

export function configureProductMetadataService(
  config: ProductMetadataConfig
): void {
  defaultService = new ProductMetadataService(config);
}

export function getProductMetadataService(): ProductMetadataService {
  if (!defaultService) {
    throw new Error(
      "ProductMetadataService not configured. Call configureProductMetadataService first."
    );
  }
  return defaultService;
}

export function resetProductMetadataService(): void {
  defaultService = null;
}
