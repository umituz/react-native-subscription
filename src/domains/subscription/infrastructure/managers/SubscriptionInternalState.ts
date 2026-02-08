import { UserIdProvider } from "../utils/UserIdProvider";
import { InitializationCache } from "../utils/InitializationCache";

export class SubscriptionInternalState {
  public userIdProvider = new UserIdProvider();
  public initCache = new InitializationCache();
  
  reset() {
    this.userIdProvider.reset();
    this.initCache.reset();
  }
}
