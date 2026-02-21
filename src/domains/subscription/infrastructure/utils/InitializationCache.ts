export class InitializationCache {
    private initPromise: Promise<boolean> | null = null;
    private currentUserId: string | null = null;
    private promiseUserId: string | null = null;
    private promiseCompleted = true;
    private pendingQueue: Map<string, Promise<boolean>> = new Map();

    tryAcquireInitialization(userId: string): { shouldInit: boolean; existingPromise: Promise<boolean> | null } {
        const queuedPromise = this.pendingQueue.get(userId);
        if (queuedPromise) {
            return { shouldInit: false, existingPromise: queuedPromise };
        }

        if (
            this.initPromise &&
            this.currentUserId === userId &&
            this.promiseCompleted &&
            this.promiseUserId === userId
        ) {
            return { shouldInit: false, existingPromise: this.initPromise };
        }

        return { shouldInit: true, existingPromise: null };
    }

    setPromise(promise: Promise<boolean>, userId: string): void {
        this.promiseUserId = userId;
        this.promiseCompleted = false;

        const targetUserId = userId;

        const chain: Promise<boolean> = promise
            .then((result) => {
                if (result && this.promiseUserId === targetUserId) {
                    this.currentUserId = targetUserId;
                }
                this.promiseCompleted = true;
                return result;
            })
            .catch((error) => {
                if (this.promiseUserId === targetUserId) {
                    this.initPromise = null;
                    this.promiseUserId = null;
                    this.currentUserId = null;
                }
                this.promiseCompleted = true;
                console.error('[InitializationCache] Initialization failed', { userId: targetUserId, error });
                return false as boolean;
            })
            .finally(() => {
                this.pendingQueue.delete(targetUserId);
            });

        this.initPromise = chain;
        this.pendingQueue.set(userId, chain);
    }

    getCurrentUserId(): string | null {
        return this.currentUserId;
    }

    reset(): void {
        this.initPromise = null;
        this.currentUserId = null;
        this.promiseUserId = null;
        this.promiseCompleted = true;
        this.pendingQueue.clear();
    }
}
