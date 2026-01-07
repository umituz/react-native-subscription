/**
 * useDeductCredit Hook
 * TanStack Query mutation hook for deducting credits.
 */

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreditType, UserCredits } from "../../domain/entities/Credits";
import { getCreditsRepository } from "../../infrastructure/repositories/CreditsRepositoryProvider";
import { creditsQueryKeys } from "./useCredits";

export interface UseDeductCreditParams {
  userId: string | undefined;
  onCreditsExhausted?: () => void;
}

export interface UseDeductCreditResult {
  deductCredit: (creditType: CreditType) => Promise<boolean>;
  deductCredits: (cost: number, creditType?: CreditType) => Promise<boolean>;
  isDeducting: boolean;
}

export const useDeductCredit = ({
  userId,
  onCreditsExhausted,
}: UseDeductCreditParams): UseDeductCreditResult => {
  const repository = getCreditsRepository();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (creditType: CreditType) => {
      if (!userId) throw new Error("User not authenticated");
      return repository.deductCredit(userId, creditType);
    },
    onMutate: async (creditType: CreditType) => {
      if (!userId) return;
      await queryClient.cancelQueries({ queryKey: creditsQueryKeys.user(userId) });
      const previousCredits = queryClient.getQueryData<UserCredits>(creditsQueryKeys.user(userId));
      queryClient.setQueryData<UserCredits | null>(creditsQueryKeys.user(userId), (old) => {
        if (!old) return old;
        const field = creditType === "text" ? "textCredits" : "imageCredits";
        return { ...old, [field]: Math.max(0, old[field] - 1), lastUpdatedAt: new Date() };
      });
      return { previousCredits };
    },
    onError: (_err, _type, context) => {
      if (userId && context?.previousCredits) {
        queryClient.setQueryData(creditsQueryKeys.user(userId), context.previousCredits);
      }
    },
    onSettled: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: creditsQueryKeys.user(userId) });
    },
  });

  const deductCredit = useCallback(async (type: CreditType): Promise<boolean> => {
    try {
      const res = await mutation.mutateAsync(type);
      if (!res.success) {
        if (res.error?.code === "CREDITS_EXHAUSTED") onCreditsExhausted?.();
        return false;
      }
      return true;
    } catch { return false; }
  }, [mutation, onCreditsExhausted]);

  const deductCredits = useCallback(async (cost: number, type: CreditType = "image"): Promise<boolean> => {
    for (let i = 0; i < cost; i++) {
      if (!(await deductCredit(type))) return false;
    }
    return true;
  }, [deductCredit]);

  return { deductCredit, deductCredits, isDeducting: mutation.isPending };
};
