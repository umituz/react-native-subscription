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

    /**
     * Atomically check if reinitialization is needed AND reserve the slot
     * Returns: { shouldInit: boolean, existingPromise: Promise | null }
     */
    tryAcquireInitialization(userId: string): { shouldInit: boolean; existingPromise: Promise<boolean> | null } {
        // If initialization is in progress for the same user, return existing promise
        if (this.initializationInProgress && this.promiseUserId === userId && this.initPromise) {
            return { shouldInit: false, existingPromise: this.initPromise };
        }

        // If already initialized for this user and promise resolved successfully, return it
        if (this.initPromise && this.currentUserId === userId && !this.initializationInProgress) {
            return { shouldInit: false, existingPromise: this.initPromise };
        }

        // Different user or no initialization - need to reinitialize
        // Atomically set the flag
        this.initializationInProgress = true;
        this.promiseUserId = userId;

        return { shouldInit: true, existingPromise: null };
    }

    setPromise(promise: Promise<boolean>, userId: string): void {
        this.initPromise = promise;
        this.promiseUserId = userId;

        // Chain to mark completion and set currentUserId only on success
        promise
            .then((result) => {
                if (result && this.promiseUserId === userId) {
                    this.currentUserId = userId;
                }
                return result;
            })
            .catch(() => {
                // On failure, clear the promise so retry is possible
                if (this.promiseUserId === userId) {
                    this.initPromise = null;
                    this.promiseUserId = null;
                }
            })
            .finally(() => {
                // Always release the mutex
                if (this.promiseUserId === userId) {
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
    }
}
