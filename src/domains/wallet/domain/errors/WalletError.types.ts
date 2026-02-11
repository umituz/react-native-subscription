export type WalletErrorCategory =
  | "PAYMENT"
  | "VALIDATION"
  | "INFRASTRUCTURE"
  | "BUSINESS";

export abstract class WalletError extends Error {
  abstract readonly code: string;
  abstract readonly userMessage: string;
  abstract readonly category: WalletErrorCategory;

  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      userMessage: this.userMessage,
      category: this.category,
      message: this.message,
      cause: this.cause?.message,
    };
  }
}
