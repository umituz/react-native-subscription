import { isDefined } from "../../../shared/utils/validators";

export function isAuthenticated(userId: string | null | undefined): userId is string {
  return isDefined(userId) && userId.length > 0;
}

export function isRegisteredUser(userId: string | null | undefined, isAnonymous: boolean): userId is string {
  return isAuthenticated(userId) && !isAnonymous;
}
