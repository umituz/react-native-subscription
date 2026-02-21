import type { PremiumStatusFetcher } from './types';

export function getIsPremium(
  isAnonymous: boolean,
  userId: string | null,
  isPremiumOrFetcher: boolean | PremiumStatusFetcher,
): Promise<boolean> {
  if (isAnonymous || userId === null) return Promise.resolve(false);

  if (typeof isPremiumOrFetcher === 'boolean') return Promise.resolve(isPremiumOrFetcher);

  return (async () => {
    try {
      return await isPremiumOrFetcher.isPremium(userId!);
    } catch (error) {
      throw new Error(
        `Failed to fetch premium status: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  })();
}
