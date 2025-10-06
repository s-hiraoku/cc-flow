import { waitFor } from '@testing-library/react';

/**
 * Wait for async operations to complete with better error handling
 */
export const waitForAsync = async <T>(
  callback: () => T | Promise<T>,
  options?: {
    timeout?: number;
    interval?: number;
  }
): Promise<T> => {
  return waitFor(callback, {
    timeout: options?.timeout ?? 3000,
    interval: options?.interval ?? 50,
  });
};

/**
 * Create a mock promise that resolves after a specified time
 */
export const createMockPromise = <T>(
  value: T,
  delay: number = 100
): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), delay);
  });
};

/**
 * Create a mock promise that rejects after a specified time
 */
export const createMockRejection = (
  error: Error,
  delay: number = 100
): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(error), delay);
  });
};