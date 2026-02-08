import type { RevenueCatConfig } from '../../core/RevenueCatConfig';

export function resolveApiKey(config: RevenueCatConfig): string | null {
  return config.apiKey || null;
}
