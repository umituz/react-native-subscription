/**
 * UserSwitchMutex
 * Prevents concurrent Purchases.logIn() calls that cause RevenueCat 429 errors
 */

class UserSwitchMutexImpl {
  private activeSwitchPromise: Promise<any> | null = null;
  private activeUserId: string | null = null;
  private lastSwitchTime = 0;
  private readonly MIN_SWITCH_INTERVAL_MS = 1000; // Minimum 1 second between switches

  /**
   * Acquires the lock for user switch operation
   * Returns existing promise if a switch is in progress for the same user
   * Waits if a switch is in progress for a different user
   */
  async acquire(userId: string): Promise<{ shouldProceed: boolean; existingPromise?: Promise<any> }> {
    // If a switch is in progress for the exact same user, return the existing promise
    if (this.activeSwitchPromise && this.activeUserId === userId) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[UserSwitchMutex] Switch already in progress for this user, returning existing promise');
      }
      return { shouldProceed: false, existingPromise: this.activeSwitchPromise };
    }

    // If a switch is in progress for a different user, wait for it to complete
    if (this.activeSwitchPromise) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[UserSwitchMutex] Waiting for active switch to complete...');
      }
      try {
        await this.activeSwitchPromise;
      } catch {
        // Ignore error, just wait for completion
      }

      // Add a small delay to avoid rapid-fire requests
      const timeSinceLastSwitch = Date.now() - this.lastSwitchTime;
      if (timeSinceLastSwitch < this.MIN_SWITCH_INTERVAL_MS) {
        const delayNeeded = this.MIN_SWITCH_INTERVAL_MS - timeSinceLastSwitch;
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.log(`[UserSwitchMutex] Rate limiting: waiting ${delayNeeded}ms`);
        }
        await new Promise(resolve => setTimeout(resolve, delayNeeded));
      }
    }

    this.activeUserId = userId;
    return { shouldProceed: true };
  }

  /**
   * Sets the active promise for the current switch operation
   */
  setPromise(promise: Promise<any>): void {
    this.activeSwitchPromise = promise;
    this.lastSwitchTime = Date.now();

    // Clear the lock when the promise completes (success or failure)
    promise
      .finally(() => {
        if (this.activeSwitchPromise === promise) {
          this.activeSwitchPromise = null;
          this.activeUserId = null;
        }
      });
  }

  /**
   * Resets the mutex state
   */
  reset(): void {
    this.activeSwitchPromise = null;
    this.activeUserId = null;
    this.lastSwitchTime = 0;
  }
}

export const UserSwitchMutex = new UserSwitchMutexImpl();
