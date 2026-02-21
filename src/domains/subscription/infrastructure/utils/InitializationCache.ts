export class InitializationCache {
    private initPromise: Promise<boolean> | null = null;
    private cacheKey: string | null = null;
    private promiseCacheKey: string | null = null;
    private resolvedUserId: string | null = null;
    private promiseCompleted = true;
    private pendingQueue: Map<string, Promise<boolean>> = new Map();

    tryAcquireInitialization(cacheKey: string): { shouldInit: boolean; existingPromise: Promise<boolean> | null } {
        const queuedPromise = this.pendingQueue.get(cacheKey);
        if (queuedPromise) {
            return { shouldInit: false, existingPromise: queuedPromise };
        }

        if (
            this.initPromise &&
            this.cacheKey === cacheKey &&
            this.promiseCompleted &&
            this.promiseCacheKey === cacheKey
        ) {
            return { shouldInit: false, existingPromise: this.initPromise };
        }

        return { shouldInit: true, existingPromise: null };
    }

    setPromise(promise: Promise<boolean>, cacheKey: string, realUserId: string | null): void {
        this.promiseCacheKey = cacheKey;
        this.promiseCompleted = false;

        const chain: Promise<boolean> = promise
            .then((result) => {
                if (result && this.promiseCacheKey === cacheKey) {
                    this.cacheKey = cacheKey;
                    this.resolvedUserId = realUserId;
                }
                this.promiseCompleted = true;
                return result;
            })
            .catch((error) => {
                if (this.promiseCacheKey === cacheKey) {
                    this.initPromise = null;
                    this.promiseCacheKey = null;
                    this.cacheKey = null;
                    this.resolvedUserId = null;
                }
                this.promiseCompleted = true;
                console.error('[InitializationCache] Initialization failed', { cacheKey, error });
                return false;
            })
            .finally(() => {
                this.pendingQueue.delete(cacheKey);
            });

        this.initPromise = chain;
        this.pendingQueue.set(cacheKey, chain);
    }

    getCurrentUserId(): string | null {
        return this.resolvedUserId;
    }

    reset(): void {
        this.initPromise = null;
        this.cacheKey = null;
        this.promiseCacheKey = null;
        this.resolvedUserId = null;
        this.promiseCompleted = true;
        this.pendingQueue.clear();
    }
}
