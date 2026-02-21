class UserSwitchMutexImpl {
  private activeSwitchPromise: Promise<unknown> | null = null;
  private activeUserId: string | null = null;
  private lastSwitchTime = 0;
  private readonly MIN_SWITCH_INTERVAL_MS = 1000;

  async acquire(userId: string): Promise<{ shouldProceed: boolean; existingPromise?: Promise<unknown> }> {
    if (this.activeSwitchPromise && this.activeUserId === userId) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[UserSwitchMutex] Switch already in progress for this user, returning existing promise');
      }
      return { shouldProceed: false, existingPromise: this.activeSwitchPromise };
    }

    if (this.activeSwitchPromise) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[UserSwitchMutex] Waiting for active switch to complete...');
      }
      try {
        await this.activeSwitchPromise;
      } catch (_ignored) {
        // Intentional: waiting for active switch to complete without failing
      }

      const timeSinceLastSwitch = Date.now() - this.lastSwitchTime;
      if (timeSinceLastSwitch < this.MIN_SWITCH_INTERVAL_MS) {
        const delayNeeded = this.MIN_SWITCH_INTERVAL_MS - timeSinceLastSwitch;
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.log(`[UserSwitchMutex] Rate limiting: waiting ${delayNeeded}ms`);
        }
        await new Promise<void>(resolve => setTimeout(() => resolve(), delayNeeded));
      }

      if (this.activeSwitchPromise) {
        if (this.activeUserId === userId) {
          return { shouldProceed: false, existingPromise: this.activeSwitchPromise };
        }
        return this.acquire(userId);
      }
    }

    this.activeUserId = userId;
    return { shouldProceed: true };
  }

  setPromise(promise: Promise<unknown>): void {
    this.activeSwitchPromise = promise;
    this.lastSwitchTime = Date.now();

    promise
      .finally(() => {
        if (this.activeSwitchPromise === promise) {
          this.activeSwitchPromise = null;
          this.activeUserId = null;
        }
      });
  }

  reset(): void {
    this.activeSwitchPromise = null;
    this.activeUserId = null;
    this.lastSwitchTime = 0;
  }
}

export const UserSwitchMutex = new UserSwitchMutexImpl();
