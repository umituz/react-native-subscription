import { isAuthenticated } from "../../domains/subscription/utils/authGuards";

export const createUserQueryKey = <T extends readonly unknown[]>(
  baseKey: T,
  userId: string | null | undefined,
  userSpecificKey: (userId: string) => readonly unknown[]
): readonly unknown[] => {
  return isAuthenticated(userId) ? userSpecificKey(userId) : baseKey;
};
