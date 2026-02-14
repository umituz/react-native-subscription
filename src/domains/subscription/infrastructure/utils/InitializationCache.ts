/**
 * Initialization Cache
 * Manages promise caching and user state for initialization
 * Thread-safe: Uses mutex pattern to prevent race conditions
 */

export class InitializationCache {
    private initPromise: Promise<boolean> | null = null;
    private currentUserId: string | null = null;
    // Mutex to prevent race condition during initialization
    private initializationInProgress = false;
    // Track which userId the promise is for (separate from currentUserId which is set after completion)
    private promiseUserId: string | null = null;
    // Track promise completion state to avoid returning failed promises
    private promiseCompleted = true;

    /**
     * Atomically check if reinitialization is needed AND reserve the slot
     * Returns: { shouldInit: boolean, existingPromise: Promise | null }
     */
    tryAcquireInitialization(userId: string): { shouldInit: boolean; existingPromise: Promise<boolean> | null } {
        // If initialization is in progress for the same user, return existing promise
        if (this.initializationInProgress && this.promiseUserId === userId && this.initPromise) {
            return { shouldInit: false, existingPromise: this.initPromise };
        }

        // If already initialized for this user and promise completed successfully, return it
        // Only return cached promise if it completed AND it's for the same user
        if (this.initPromise && this.currentUserId === userId && !this.initializationInProgress && this.promiseCompleted) {
            return { shouldInit: false, existingPromise: this.initPromise };
        }

        // Different user, no initialization, or failed promise - need to reinitialize
        // Atomically set the flag and clear previous state if needed
        if (!this.initializationInProgress) {
            this.initializationInProgress = true;
            this.promiseUserId = userId;
            this.promiseCompleted = false;
            return { shouldInit: true, existingPromise: null };
        }

        // If we reach here, initialization is in progress for a different user
        // Don't return another user's promise - caller should retry
        return { shouldInit: false, existingPromise: null };
    }

    setPromise(promise: Promise<boolean>, userId: string): void {
        this.initPromise = promise;
        this.promiseUserId = userId;

        // Capture userId to prevent stale reference after catch clears promiseUserId
        const targetUserId = userId;

        // Chain to mark completion and set currentUserId only on success
        promise
            .then((result) => {
                if (result && this.promiseUserId === targetUserId) {
                    this.currentUserId = targetUserId;
                }
                this.promiseCompleted = true;
                return result;
            })
            .catch((error) => {
                // On failure, clear the promise so retry is possible
                if (this.promiseUserId === targetUserId) {
                    this.initPromise = null;
                    this.promiseUserId = null;
                    this.currentUserId = null;
                }
                this.promiseCompleted = true;
                console.error('[InitializationCache] Initialization failed', { userId: targetUserId, error });
                // Re-throw so callers awaiting the promise see the error
                throw error;
            })
            .finally(() => {
                // Always release the mutex
                if (this.promiseUserId === targetUserId) {
                    this.initializationInProgress = false;
                }
            });
    }

    getCurrentUserId(): string | null {
        return this.currentUserId;
    }

    reset(): void {
        this.initPromise = null;
        this.currentUserId = null;
        this.initializationInProgress = false;
        this.promiseUserId = null;
        this.promiseCompleted = true;
    }
}
