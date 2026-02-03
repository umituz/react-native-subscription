import type { RevenueCatConfig } from '../../domain/value-objects/RevenueCatConfig';

export function resolveApiKey(config: RevenueCatConfig): string | null {
  return config.apiKey || null;
}
