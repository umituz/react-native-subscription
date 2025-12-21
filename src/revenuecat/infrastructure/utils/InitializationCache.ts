/**
 * Initialization Cache
 * Manages promise caching and user state for initialization
 */

import { addPackageBreadcrumb } from "@umituz/react-native-sentry";

export class InitializationCache {
  private initPromise: Promise<boolean> | null = null;
  private currentUserId: string | null = null;

  shouldReinitialize(userId: string): boolean {
    if (!this.initPromise) {
      return true;
    }

    if (this.currentUserId !== userId) {
      addPackageBreadcrumb("subscription", "User changed, reinitialize needed", {
        oldUserId: this.currentUserId,
        newUserId: userId,
      });
      return true;
    }

    return false;
  }

  getExistingPromise(): Promise<boolean> | null {
    return this.initPromise;
  }

  setPromise(promise: Promise<boolean>, userId: string): void {
    this.initPromise = promise;
    this.currentUserId = userId;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  reset(): void {
    this.initPromise = null;
    this.currentUserId = null;
  }
}
