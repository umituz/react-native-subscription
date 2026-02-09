/**
 * Product Metadata Service
 *
 * Generic service for fetching product metadata from Firestore.
 * Collection name is configurable for use across hundreds of apps.
 */

import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getFirestore } from "@umituz/react-native-firebase";
import type {
  ProductMetadata,
  ProductMetadataConfig,
  ProductType,
} from "../../domain/types/wallet.types";

interface CacheEntry {
  data: ProductMetadata[];
  timestamp: number;
}

const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class ProductMetadataService {
  private config: ProductMetadataConfig;
  private cache: CacheEntry | null = null;

  constructor(config: ProductMetadataConfig) {
    this.config = config;
  }

  private isCacheValid(): boolean {
    if (!this.cache) return false;
    const ttl = this.config.cacheTTL ?? DEFAULT_CACHE_TTL_MS;
    return Date.now() - this.cache.timestamp < ttl;
  }

  private async fetchFromFirebase(): Promise<ProductMetadata[]> {
    const db = getFirestore();
    if (!db) {
      throw new Error("Firestore not initialized");
    }

    const colRef = collection(db, this.config.collectionName);
    const q = query(colRef, orderBy("order", "asc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      productId: docSnap.id,
      ...docSnap.data(),
    })) as ProductMetadata[];
  }

  async getAll(): Promise<ProductMetadata[]> {
    if (this.isCacheValid() && this.cache) {
      return this.cache.data;
    }

    try {
      const data = await this.fetchFromFirebase();
      this.cache = { data, timestamp: Date.now() };
      return data;
    } catch (error) {
      if (this.cache) {
        return this.cache.data;
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
    this.cache = null;
  }
}

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
