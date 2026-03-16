interface CacheEntry {
    promise: Promise<boolean>;
    resolvedUserId: string | null;
    completed: boolean;
}

export class InitializationCache {
    private entries: Map<string, CacheEntry> = new Map();

    tryAcquireInitialization(cacheKey: string): { shouldInit: boolean; existingPromise: Promise<boolean> | null } {
        const entry = this.entries.get(cacheKey);
        if (entry) {
            return { shouldInit: false, existingPromise: entry.promise };
        }

        return { shouldInit: true, existingPromise: null };
    }

    setPromise(promise: Promise<boolean>, cacheKey: string, realUserId: string | null): void {
        const entry: CacheEntry = {
            promise: null as any, // Placeholder to be assigned immediately
            resolvedUserId: realUserId,
            completed: false,
        };

        const chain: Promise<boolean> = promise
            .then((result) => {
                const currentEntry = this.entries.get(cacheKey);
                if (currentEntry === entry) {
                    currentEntry.completed = true;
                    if (!result) {
                        this.entries.delete(cacheKey);
                    }
                }
                return result;
            })
            .catch((error) => {
                if (this.entries.get(cacheKey) === entry) {
                    this.entries.delete(cacheKey);
                }
                console.error('[InitializationCache] Initialization failed', { cacheKey, error });
                return false;
            });

        entry.promise = chain;
        this.entries.set(cacheKey, entry);
    }

    getCurrentUserId(): string | null {
        // Find the first completed entry. This assumes we usually only have one active at a time,
        // but it's much safer than shared state variables. 
        // In reality, SubscriptionManager.reset() clears this map on user switch.
        for (const entry of this.entries.values()) {
            if (entry.completed) {
                return entry.resolvedUserId;
            }
        }
        return null;
    }

    reset(): void {
        this.entries.clear();
    }
}
