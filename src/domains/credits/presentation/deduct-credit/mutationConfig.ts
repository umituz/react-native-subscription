import type { QueryClient } from "@umituz/react-native-design-system";
import { timezoneService } from "@umituz/react-native-design-system";
import type { UserCredits, DeductCreditsResult } from "../../core/Credits";
import type { CreditsRepository } from "../../infrastructure/CreditsRepository";
import { creditsQueryKeys } from "../creditsQueryKeys";
import { calculateRemaining } from "../../../../shared/utils/numberUtils.core";

export interface MutationContext {
  previousCredits: UserCredits | null;
  skippedOptimistic: boolean;
  wasInsufficient?: boolean;
  capturedUserId: string | null;
}

export function createDeductCreditMutationConfig(
  userId: string | undefined,
  repository: CreditsRepository,
  queryClient: QueryClient
) {
  return {
    mutationFn: async (cost: number): Promise<DeductCreditsResult> => {
      if (!userId) throw new Error("User not authenticated");
      return repository.deductCredit(userId, cost);
    },
    onMutate: async (cost: number): Promise<MutationContext> => {
      if (!userId) {
        return { previousCredits: null, skippedOptimistic: true, capturedUserId: null };
      }

      const capturedUserId = userId;

      await queryClient.cancelQueries({ queryKey: creditsQueryKeys.user(capturedUserId) });
      const previousCredits = queryClient.getQueryData<UserCredits>(
        creditsQueryKeys.user(capturedUserId)
      );

      if (!previousCredits) {
        return {
          previousCredits: null as UserCredits | null,
          skippedOptimistic: true,
          capturedUserId
        };
      }

      const newCredits = calculateRemaining(previousCredits.credits, cost);

      queryClient.setQueryData<UserCredits | null>(
        creditsQueryKeys.user(capturedUserId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            credits: newCredits,
            lastUpdatedAt: timezoneService.getNow()
          };
        }
      );

      return {
        previousCredits,
        skippedOptimistic: false,
        wasInsufficient: previousCredits.credits < cost,
        capturedUserId
      };
    },
    onError: (_err: unknown, _cost: number, context: MutationContext | undefined) => {
      if (context?.capturedUserId && context.previousCredits && !context.skippedOptimistic) {
        queryClient.setQueryData(
          creditsQueryKeys.user(context.capturedUserId),
          context.previousCredits
        );
      }
    },
    onSuccess: (_data: unknown, _cost: number, context: MutationContext | undefined) => {
      const targetUserId = context?.capturedUserId ?? userId;
      if (targetUserId) {
        queryClient.invalidateQueries({ queryKey: creditsQueryKeys.user(targetUserId) });
      }
    },
  };
}
