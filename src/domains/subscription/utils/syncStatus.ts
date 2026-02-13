import { isDefined } from "../../../shared/utils/validators";
import type { UserCredits } from "../../credits/core/Credits";

export interface SyncState {
  statusLoading: boolean;
  creditsLoading: boolean;
  subscriptionActive: boolean;
  credits: UserCredits | null;
}

export const isPremiumSyncPending = (state: SyncState): boolean => {
  const { statusLoading, creditsLoading, subscriptionActive, credits } = state;

  if (statusLoading || creditsLoading) return false;

  if (!subscriptionActive) return false;

  if (!isDefined(credits)) return false;

  return !credits.isPremium;
};
