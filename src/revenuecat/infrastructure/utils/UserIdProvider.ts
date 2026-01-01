/**
 * User ID Provider
 * Manages user ID retrieval (anonymous or authenticated)
 */

import {

export class UserIdProvider {
  private cachedAnonUserId: string | null = null;
  private getAnonymousUserIdFn: (() => Promise<string>) | null = null;

  configure(getAnonymousUserId: () => Promise<string>): void {
    this.getAnonymousUserIdFn = getAnonymousUserId;
  }

  async getOrCreateAnonymousUserId(): Promise<string> {
    if (this.cachedAnonUserId) {
      return this.cachedAnonUserId;
    }

    if (!this.getAnonymousUserIdFn) {
      const error = new Error("Anonymous user ID provider not configured");
        packageName: "subscription",
        operation: "get_anon_user_id",
      });
      throw error;
    }

    this.cachedAnonUserId = await this.getAnonymousUserIdFn();
      userId: this.cachedAnonUserId,
    });

    return this.cachedAnonUserId;
  }

  reset(): void {
    this.cachedAnonUserId = null;
  }
}
