export interface UseDeductCreditParams {
  userId: string | undefined;
  onCreditsExhausted?: () => void;
}

export interface UseDeductCreditResult {
  checkCredits: (cost?: number) => Promise<boolean>;
  deductCredit: (cost?: number) => Promise<boolean>;
  deductCredits: (cost: number) => Promise<boolean>;
  isDeducting: boolean;
}
