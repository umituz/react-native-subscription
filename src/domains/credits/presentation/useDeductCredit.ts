/**
 * useDeductCredit Hook
 * TanStack Query mutation hook for deducting credits.
 */

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@umituz/react-native-design-system";
import type { UserCredits } from "../core/Credits";
import { getCreditsRepository } from "../infrastructure/CreditsRepositoryManager";
import { creditsQueryKeys } from "./creditsQueryKeys";
import { calculateRemaining } from "../../../shared/utils/numberUtils";

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
      if (!userId) return { previousCredits: null, skippedOptimistic: true, capturedUserId: null };

      // Capture userId at mutation start to prevent cross-user contamination
      const capturedUserId = userId;

      await queryClient.cancelQueries({ queryKey: creditsQueryKeys.user(capturedUserId) });
      const previousCredits = queryClient.getQueryData<UserCredits>(creditsQueryKeys.user(capturedUserId));

      if (!previousCredits) {
        return { previousCredits: null as UserCredits | null, skippedOptimistic: true, capturedUserId };
      }

      // Calculate new credits using utility
      const newCredits = calculateRemaining(previousCredits.credits, cost);

      queryClient.setQueryData<UserCredits | null>(creditsQueryKeys.user(capturedUserId), (old) => {
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
        wasInsufficient: previousCredits.credits < cost,
        capturedUserId
      };
    },
    onError: (_err, _cost, mutationData) => {
      // Always restore previous credits on error to prevent UI desync
      // Use captured userId to prevent rollback on wrong user
      if (mutationData?.capturedUserId && mutationData?.previousCredits && !mutationData.skippedOptimistic) {
         queryClient.setQueryData(creditsQueryKeys.user(mutationData.capturedUserId), mutationData.previousCredits);
      }
    },
    onSuccess: (_data, _cost, mutationData) => {
      const targetUserId = mutationData?.capturedUserId ?? userId;
      if (targetUserId) {
        queryClient.invalidateQueries({ queryKey: creditsQueryKeys.user(targetUserId) });
      }
    },
  });

  const deductCredit = useCallback(async (cost: number = 1): Promise<boolean> => {
    try {
      const res = await mutation.mutateAsync(cost);
      if (!res.success) {
        if (res.error?.code === "CREDITS_EXHAUSTED") onCreditsExhausted?.();
        return false;
      }
      return true;
    } catch {
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
