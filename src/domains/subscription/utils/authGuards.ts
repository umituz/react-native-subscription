import { isDefined } from "../../../shared/utils/validators";

export const isAuthenticated = (userId: string | null | undefined): userId is string => {
  return isDefined(userId) && userId.length > 0;
};
