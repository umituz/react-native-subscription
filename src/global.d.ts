/**
 * Global type declarations for React Native environment
 */

/** React Native development flag */
declare const __DEV__: boolean;

/** Extend NodeJS namespace for React Native compatibility */
declare namespace NodeJS {
  interface Global {
    __DEV__: boolean;
  }
}
