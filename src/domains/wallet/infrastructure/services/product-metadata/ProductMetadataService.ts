import type {
  ProductMetadata,
  ProductMetadataConfig,
  ProductType,
} from "../../../domain/types/wallet.types";
import { CacheManager } from "./CacheManager";
import { fetchProductsFromFirebase } from "./FirebaseFetcher";

export class ProductMetadataService {
  private config: ProductMetadataConfig;
  private cacheManager: CacheManager;

  constructor(config: ProductMetadataConfig) {
    this.config = config;
    this.cacheManager = new CacheManager();
  }

  async getAll(): Promise<ProductMetadata[]> {
    if (this.cacheManager.isCacheValid(this.config.cacheTTL)) {
      return this.cacheManager.get()!;
    }

    try {
      const data = await fetchProductsFromFirebase(this.config.collectionName);
      this.cacheManager.set(data);
      return data;
    } catch (error) {
      const cachedData = this.cacheManager.get();
      if (cachedData) {
        return cachedData;
      }
      throw error;
    }
  }

  async getByProductId(productId: string): Promise<ProductMetadata | null> {
    const all = await this.getAll();
    return all.find((p) => p.productId === productId) ?? null;
  }

  async getByType(type: ProductType): Promise<ProductMetadata[]> {
    const all = await this.getAll();
    return all.filter((p) => p.type === type);
  }

  async getCreditsPackages(): Promise<ProductMetadata[]> {
    return this.getByType("credits");
  }

  async getSubscriptionPackages(): Promise<ProductMetadata[]> {
    return this.getByType("subscription");
  }

  clearCache(): void {
    this.cacheManager.clear();
  }
}
