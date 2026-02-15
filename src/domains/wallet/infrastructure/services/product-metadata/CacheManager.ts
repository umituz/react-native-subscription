import type { ProductMetadata } from "../../../domain/types/wallet.types";

interface CacheEntry {
  data: ProductMetadata[];
  timestamp: number;
}

const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

export class CacheManager {
  private cache: CacheEntry | null = null;

  isCacheValid(cacheTTL?: number): boolean {
    if (!this.cache) return false;
    const ttl = cacheTTL ?? DEFAULT_CACHE_TTL_MS;
    return Date.now() - this.cache.timestamp < ttl;
  }

  get(): ProductMetadata[] | null {
    return this.cache?.data ?? null;
  }

  set(data: ProductMetadata[]): void {
    this.cache = { data, timestamp: Date.now() };
  }

  clear(): void {
    this.cache = null;
  }
}
