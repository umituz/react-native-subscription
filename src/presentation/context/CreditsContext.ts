/**
 * Credits Context
 *
 * React context for credits configuration.
 * Allows main app to provide credit limits and collection name.
 */

import { createContext, useContext } from "react";
import type { CreditsConfig } from "../../domain/entities/Credits";
import { DEFAULT_CREDITS_CONFIG } from "../../domain/entities/Credits";
import type { CreditsRepository } from "../../infrastructure/repositories/CreditsRepository";

export interface CreditsContextValue {
  config: CreditsConfig;
  repository: CreditsRepository | null;
}

export const CreditsContext = createContext<CreditsContextValue>({
  config: DEFAULT_CREDITS_CONFIG,
  repository: null,
});

export const useCreditsContext = (): CreditsContextValue => {
  const context = useContext(CreditsContext);
  if (!context.repository) {
    throw new Error("CreditsProvider must be used to provide credits config");
  }
  return context;
};

export const useCreditsConfig = (): CreditsConfig => {
  const { config } = useContext(CreditsContext);
  return config;
};

export const useCreditsRepository = (): CreditsRepository => {
  const { repository } = useContext(CreditsContext);
  if (!repository) {
    throw new Error("CreditsProvider must be used to provide repository");
  }
  return repository;
};
