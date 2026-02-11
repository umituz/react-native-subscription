import { WalletError } from "./WalletError.types";
import { NetworkError, UserValidationError, TransactionError } from "./WalletErrorClasses";

export const handleWalletError = (error: unknown): WalletError => {
  if (error instanceof WalletError) {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("network") || message.includes("timeout")) {
      return new NetworkError(error.message, error);
    }

    if (message.includes("permission") || message.includes("unauthorized")) {
      return new UserValidationError("Authentication failed");
    }

    return new TransactionError(error.message, error);
  }

  return new TransactionError("Unexpected error occurred");
};
