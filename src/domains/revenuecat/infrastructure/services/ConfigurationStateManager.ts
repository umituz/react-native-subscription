import type { InitializeResult } from "../../../../shared/application/ports/IRevenueCatService";

export class ConfigurationStateManager {
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

    // Cleanup promise state immediately (no setTimeout)
    // If promise hasn't resolved yet, that's fine - it will still resolve via the callback
    if (this._configurationPromise) {
      this._configurationPromise = null;
    }

    // Clear resolve function if it still exists
    if (this._resolveConfiguration) {
      this._resolveConfiguration = null;
    }
  }

  reset(): void {
    this._isPurchasesConfigured = false;
    this._configurationPromise = null;
    this._resolveConfiguration = null;
  }
}

export const configState = new ConfigurationStateManager();
