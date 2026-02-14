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

    this._configurationPromise = new Promise((resolve) => {
      this._resolveConfiguration = resolve;
    });

    return (value: InitializeResult) => {
      if (this._resolveConfiguration) {
        this._resolveConfiguration(value);
      }
    };
  }

  completeConfiguration(success: boolean): void {
    this._isPurchasesConfigured = success;
    this._configurationPromise = null;
    this._resolveConfiguration = null;
  }

  reset(): void {
    this._isPurchasesConfigured = false;
    this._configurationPromise = null;
    this._resolveConfiguration = null;
  }
}

export const configState = new ConfigurationStateManager();
