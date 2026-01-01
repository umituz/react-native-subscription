/**
 * User ID Provider
 * Manages user ID retrieval (anonymous or authenticated)
 */

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
            throw new Error("Anonymous user ID provider not configured");
        }

        this.cachedAnonUserId = await this.getAnonymousUserIdFn();
        return this.cachedAnonUserId;
    }

    reset(): void {
        this.cachedAnonUserId = null;
    }
}
