import type { InitializeResult } from "../../../../shared/application/ports/IRevenueCatService";

class ConfigurationStateManager {
  private _isPurchasesConfigured = false;
  private _configurationPromise: Promise<InitializeResult> | null = null;
  private _resolveConfiguration: ((value: InitializeResult) => void) | null = null;

  get isPurchasesConfigured(): boolean {
    return this._isPurchasesConfigured;
  }

  get configurationPromise(): Promise<InitializeResult> | null {
    return this._configurationPromise;
  }

  get isConfiguring(): boolean {
    return this._configurationPromise !== null;
  }

  startConfiguration(): (value: InitializeResult) => void {
    if (this._configurationPromise) {
      throw new Error('Configuration already in progress');
    }

    // Create promise and store resolve function atomically
    this._configurationPromise = new Promise<InitializeResult>((resolve) => {
      this._resolveConfiguration = resolve;
    });

    // Return resolve function
    return (value: InitializeResult) => {
      if (this._resolveConfiguration) {
        const resolve = this._resolveConfiguration;
        this._resolveConfiguration = null;
        resolve(value);
      }
    };
  }

  completeConfiguration(success: boolean): void {
    this._isPurchasesConfigured = success;

    // Note: Do NOT null _configurationPromise here.
    // The promise is resolved externally via resolveConfig() in RevenueCatInitializer.
    // Nulling it before resolution creates a race where concurrent callers
    // see isConfiguring=false and start a duplicate SDK configuration.
    // The promise is cleaned up in the next startConfiguration() or reset() call.
    // We only clear the resolve function since it's no longer needed.
    this._resolveConfiguration = null;
  }

  /** Called after resolveConfig() to clean up the completed promise */
  clearCompletedConfiguration(): void {
    if (this._isPurchasesConfigured || !this._resolveConfiguration) {
      this._configurationPromise = null;
    }
  }

  reset(): void {
    this._isPurchasesConfigured = false;
    this._configurationPromise = null;
    this._resolveConfiguration = null;
  }
}

export const configState = new ConfigurationStateManager();
