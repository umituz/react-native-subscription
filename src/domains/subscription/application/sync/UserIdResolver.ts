/**
 * User ID Resolver
 * Handles resolution of RevenueCat user ID to credits user ID
 */

import { createLogger } from "../../../../shared/utils/logger";

const logger = createLogger("UserIdResolver");

export class UserIdResolver {
  constructor(private getAnonymousUserId: () => Promise<string>) {}

  async resolveCreditsUserId(revenueCatUserId: string | null | undefined): Promise<string> {
    // Try revenueCatUserId first
    const trimmed = revenueCatUserId?.trim();
    if (trimmed && this.isValidUserId(trimmed)) {
      return trimmed;
    }

    // Fallback to anonymous user ID
    logger.warn("revenueCatUserId is empty/null, falling back to anonymousUserId");
    const anonymousId = await this.getAnonymousUserId();
    const trimmedAnonymous = anonymousId?.trim();

    if (!this.isValidUserId(trimmedAnonymous)) {
      throw new Error("[UserIdResolver] Cannot resolve credits userId: both revenueCatUserId and anonymousUserId are empty");
    }

    return trimmedAnonymous;
  }

  private isValidUserId(userId: string | undefined): boolean {
    return !!userId && userId.length > 0 && userId !== 'undefined' && userId !== 'null';
  }
}
