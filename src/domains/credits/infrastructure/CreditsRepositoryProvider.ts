/**
 * Credits Repository Provider
 * Module-level singleton for credits repository configuration
 * Replaces Context API with a simpler, testable approach
 */

import type { CreditsConfig } from "../../domain/entities/Credits";
import { DEFAULT_CREDITS_CONFIG } from "../../domain/entities/Credits";
import type { CreditsRepository } from "./CreditsRepository";
import { createCreditsRepository } from "./CreditsRepository";

let globalRepository: CreditsRepository | null = null;
let globalConfig: CreditsConfig = DEFAULT_CREDITS_CONFIG;

/**
 * Configure credits repository for the application
 * Must be called once during app initialization
 */
export function configureCreditsRepository(config: Partial<CreditsConfig>): void {
  globalConfig = {
    ...DEFAULT_CREDITS_CONFIG,
    ...config,
  };
  globalRepository = createCreditsRepository(globalConfig);
}

/**
 * Check if credits repository is configured
 */
export function isCreditsRepositoryConfigured(): boolean {
  return globalRepository !== null;
}

/**
 * Get the configured credits repository
 * Throws if repository not configured
 */
export function getCreditsRepository(): CreditsRepository {
  if (!globalRepository) {
    throw new Error(
      "CreditsRepository not configured. Call configureCreditsRepository() first."
    );
  }
  return globalRepository;
}

/**
 * Get the current credits configuration
 */
export function getCreditsConfig(): CreditsConfig {
  return globalConfig;
}

/**
 * Reset repository (for testing)
 */
export function resetCreditsRepository(): void {
  globalRepository = null;
  globalConfig = DEFAULT_CREDITS_CONFIG;
}
