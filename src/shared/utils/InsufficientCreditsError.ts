/**
 * InsufficientCreditsError
 *
 * Thrown when user doesn't have enough credits for an operation.
 * Silently handled - triggers paywall display.
 */

export class InsufficientCreditsError extends Error {
  public readonly requiredCredits: number;
  public readonly availableCredits: number;
  public readonly operationType: string;

  constructor(
    requiredCredits: number,
    availableCredits: number,
    operationType: string,
  ) {
    super(
      `Insufficient credits: ${availableCredits} available, ${requiredCredits} required`,
    );
    this.name = "InsufficientCreditsError";
    this.requiredCredits = requiredCredits;
    this.availableCredits = availableCredits;
    this.operationType = operationType;

    Object.setPrototypeOf(this, InsufficientCreditsError.prototype);
  }

  get deficit(): number {
    return this.requiredCredits - this.availableCredits;
  }
}
