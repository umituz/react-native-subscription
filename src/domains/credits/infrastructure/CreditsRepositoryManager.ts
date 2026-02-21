import type { CreditsConfig } from "../core/Credits";
import type { CreditsRepository } from "./CreditsRepository";
import { createCreditsRepository } from "./CreditsRepository";

let globalRepository: CreditsRepository | null = null;
let globalConfig: CreditsConfig | null = null;

export function configureCreditsRepository(config: CreditsConfig): void {
  globalConfig = config;
  globalRepository = createCreditsRepository(globalConfig);
}

export function isCreditsRepositoryConfigured(): boolean {
  return globalRepository !== null;
}

export function getCreditsRepository(): CreditsRepository {
  if (!globalRepository) {
    throw new Error(
      "CreditsRepository not configured. Call configureCreditsRepository() first."
    );
  }
  return globalRepository;
}

export function getCreditsConfig(): CreditsConfig {
  if (!globalConfig) {
    throw new Error(
      "CreditsConfig not configured. Call configureCreditsRepository() first."
    );
  }
  return globalConfig;
}
