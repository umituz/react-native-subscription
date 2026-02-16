/**
 * Initialization Cache
 * Manages promise caching and user state for initialization
 * Thread-safe: Uses atomic promise-based locking pattern
 */

export class InitializationCache {
    private initPromise: Promise<boolean> | null = null;
    private currentUserId: string | null = null;
    // Track which userId the promise is for
    private promiseUserId: string | null = null;
    // Track promise completion state
    private promiseCompleted = true;
    // Pending initialization queue
    private pendingQueue: Map<string, Promise<boolean>> = new Map();

    /**
     * Atomically check if reinitialization is needed AND reserve the slot
     * Returns: { shouldInit: boolean, existingPromise: Promise | null }
     */
    tryAcquireInitialization(userId: string): { shouldInit: boolean; existingPromise: Promise<boolean> | null } {
        // Check if there's already a pending promise for this user in the queue
        const queuedPromise = this.pendingQueue.get(userId);
        if (queuedPromise) {
            return { shouldInit: false, existingPromise: queuedPromise };
        }

        // If already initialized for this user and promise completed successfully
        if (
            this.initPromise &&
            this.currentUserId === userId &&
            this.promiseCompleted &&
            this.promiseUserId === userId
        ) {
            return { shouldInit: false, existingPromise: this.initPromise };
        }

        // Different user or not initialized - need to initialize
        return { shouldInit: true, existingPromise: null };
    }

    setPromise(promise: Promise<boolean>, userId: string): void {
        // Add to pending queue immediately (atomic operation)
        this.pendingQueue.set(userId, promise);

        this.initPromise = promise;
        this.promiseUserId = userId;
        this.promiseCompleted = false;

        const targetUserId = userId;

        promise
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
                return false;
            })
            .finally(() => {
                // Remove from queue when complete
                this.pendingQueue.delete(targetUserId);
            });
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
