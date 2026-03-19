/**
 * User Switch Handler
 *
 * Main entry point for user switch operations.
 * Exports functions from split modules for better organization.
 */

export {
  normalizeUserId,
  isAnonymousId,
  buildSuccessResult,
  fetchOfferingsSafe,
} from './userSwitchHelpers';

export {
  handleUserSwitch,
} from './userSwitchCore';

export {
  handleInitialConfiguration,
  fetchCurrentUserData,
} from './userSwitchInitializer';
