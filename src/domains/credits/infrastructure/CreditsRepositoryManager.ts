/**
 * Credits Repository Manager
 * Module-level singleton for credits repository configuration
 * Provides a clean, testable approach for repository access
 */

import type { CreditsConfig } from "../core/Credits";
import type { CreditsRepository } from "./CreditsRepository";
import { createCreditsRepository } from "./CreditsRepository";

let globalRepository: CreditsRepository | null = null;
let globalConfig: CreditsConfig | null = null;

/**
 * Configure credits repository for the application
 * Must be called once during app initialization
 */
export function configureCreditsRepository(config: CreditsConfig): void {
  globalConfig = config;
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
  if (!globalConfig) {
    throw new Error(
      "CreditsConfig not configured. Call configureCreditsRepository() first."
    );
  }
  return globalConfig;
}

