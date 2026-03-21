import type { UserCredits } from "../core/Credits";

export type CreditsLoadStatus = "idle" | "loading" | "ready" | "error";

export interface UseCreditsResult {
  credits: UserCredits | null;
  isLoading: boolean;
  isCreditsLoaded: boolean;
  loadStatus: CreditsLoadStatus;
  error: Error | null;
  hasCredits: boolean;
  creditsPercent: number;
  refetch: () => void;
  canAfford: (cost: number) => boolean;
}
