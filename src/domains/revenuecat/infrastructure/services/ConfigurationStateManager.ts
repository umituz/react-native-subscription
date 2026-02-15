import type { InitializeResult } from "../../../../shared/application/ports/IRevenueCatService";

export class ConfigurationStateManager {
  private _isPurchasesConfigured = false;
  private _configurationPromise: Promise<InitializeResult> | null = null;

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

    let capturedResolve: ((value: InitializeResult) => void) | null = null;

    this._configurationPromise = new Promise((resolve) => {
      capturedResolve = resolve;
    });

    return (value: InitializeResult) => {
      if (capturedResolve) {
        capturedResolve(value);
        capturedResolve = null;
      }
    };
  }

  completeConfiguration(success: boolean): void {
    this._isPurchasesConfigured = success;

    if (success) {
      this._configurationPromise = null;
    } else {
      setTimeout(() => {
        this._configurationPromise = null;
      }, 1000);
    }
  }

  reset(): void {
    this._isPurchasesConfigured = false;
    this._configurationPromise = null;
  }
}

export const configState = new ConfigurationStateManager();
