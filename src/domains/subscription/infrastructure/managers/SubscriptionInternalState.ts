import { InitializationCache } from "../utils/InitializationCache";

export class SubscriptionInternalState {
  public initCache = new InitializationCache();

  reset() {
    this.initCache.reset();
  }
}
