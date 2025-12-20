/**
 * Credits Provider
 *
 * React provider for credits configuration.
 * Main app uses this to configure credit limits.
 */

import React, { useMemo } from "react";
import type { CreditsConfig } from "../../domain/entities/Credits";
import { DEFAULT_CREDITS_CONFIG } from "../../domain/entities/Credits";
import {
  CreditsContext,
  type CreditsContextValue,
} from "../context/CreditsContext";
import { createCreditsRepository } from "../../infrastructure/repositories/CreditsRepository";

export interface CreditsProviderProps {
  children: React.ReactNode;
  config?: Partial<CreditsConfig>;
}

export const CreditsProvider: React.FC<CreditsProviderProps> = ({
  children,
  config,
}) => {
  const value = useMemo<CreditsContextValue>(() => {
    const mergedConfig: CreditsConfig = {
      ...DEFAULT_CREDITS_CONFIG,
      ...config,
    };
    const repository = createCreditsRepository(mergedConfig);
    return { config: mergedConfig, repository };
  }, [config]);

  return (
    <CreditsContext.Provider value={value}>{children}</CreditsContext.Provider>
  );
};
