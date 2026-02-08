/**
 * useDeductCredit Hook
 * TanStack Query mutation hook for deducting credits.
 */

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@umituz/react-native-design-system";
import type { UserCredits } from "../../domain/entities/Credits";
import { getCreditsRepository } from "../../infrastructure/repositories/CreditsRepositoryProvider";
import { creditsQueryKeys } from "./useCredits";

import { timezoneService } from "@umituz/react-native-design-system";

export interface UseDeductCreditParams {
  userId: string | undefined;
  onCreditsExhausted?: () => void;
}

export interface UseDeductCreditResult {
  /** Check if user has enough credits (server-side validation) */
  checkCredits: (cost?: number) => Promise<boolean>;
  deductCredit: (cost?: number) => Promise<boolean>;
  deductCredits: (cost: number) => Promise<boolean>;
  isDeducting: boolean;
}

export const useDeductCredit = ({
  userId,
  onCreditsExhausted,
}: UseDeductCreditParams): UseDeductCreditResult => {
  const repository = getCreditsRepository();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (cost: number) => {
      if (!userId) throw new Error("User not authenticated");
      return repository.deductCredit(userId, cost);
    },
    onMutate: async (cost: number) => {
      if (!userId) return { previousCredits: null, skippedOptimistic: true };

      await queryClient.cancelQueries({ queryKey: creditsQueryKeys.user(userId) });
      const previousCredits = queryClient.getQueryData<UserCredits>(creditsQueryKeys.user(userId));

      // Improved optimistic update logic
      if (!previousCredits) {
        return { previousCredits: null, skippedOptimistic: true };
      }

      // If credits are insufficient, show 0 but don't skip optimistic update
      // This provides better UX by showing the user what will happen
      const newCredits = Math.max(0, previousCredits.credits - cost);

      queryClient.setQueryData<UserCredits | null>(creditsQueryKeys.user(userId), (old) => {
        if (!old) return old;
        return {
          ...old,
          credits: newCredits,
          lastUpdatedAt: timezoneService.getNow()
        };
      });

      return {
        previousCredits,
        skippedOptimistic: false,
        wasInsufficient: previousCredits.credits < cost
      };
    },
    onError: (_err, _cost, context) => {
      // Restore previous credits on error
      // Skip restoration if credits were insufficient (optimistic update showed 0, which is correct)
      if (userId && context?.previousCredits && !context.skippedOptimistic && !context.wasInsufficient) {
        queryClient.setQueryData(creditsQueryKeys.user(userId), context.previousCredits);
      }
    },
    onSuccess: () => {
      // Only invalidate on success to get fresh server data
      if (userId) {
        queryClient.invalidateQueries({ queryKey: creditsQueryKeys.user(userId) });
      }
    },
  });

  const deductCredit = useCallback(async (cost: number = 1): Promise<boolean> => {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[useDeductCredit] Attempting to deduct:", cost);
    }
    try {
      const res = await mutation.mutateAsync(cost);
      if (!res.success) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.log("[useDeductCredit] Deduction failed:", res.error?.code, res.error?.message);
        }
        if (res.error?.code === "CREDITS_EXHAUSTED") onCreditsExhausted?.();
        return false;
      }
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[useDeductCredit] Deduction successful, remaining:", res.remainingCredits);
      }
      return true;
    } catch (err) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[useDeductCredit] Deduction error:", err);
      }
      return false;
    }
  }, [mutation, onCreditsExhausted]);

  const deductCredits = useCallback(async (cost: number): Promise<boolean> => {
    return await deductCredit(cost);
  }, [deductCredit]);

  const checkCredits = useCallback(async (cost: number = 1): Promise<boolean> => {
    if (!userId) return false;
    return repository.hasCredits(userId, cost);
  }, [userId, repository]);

  return { checkCredits, deductCredit, deductCredits, isDeducting: mutation.isPending };
};
