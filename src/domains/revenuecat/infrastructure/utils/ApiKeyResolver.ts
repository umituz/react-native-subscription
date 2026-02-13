import type { RevenueCatConfig } from '../../core/types';

export function resolveApiKey(config: RevenueCatConfig): string | null {
  return config.apiKey || null;
}
