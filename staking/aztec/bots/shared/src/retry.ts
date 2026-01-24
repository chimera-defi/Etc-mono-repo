import { Logger } from './logger';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  onRetry?: (error: Error, attempt: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  onRetry: () => {},
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < opts.maxAttempts) {
        opts.onRetry(lastError, attempt);

        // Exponential backoff with jitter
        const delay = Math.min(
          opts.baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000,
          opts.maxDelay
        );

        await sleep(delay);
      }
    }
  }

  throw lastError;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createRetryableFunction<T>(
  fn: () => Promise<T>,
  logger: Logger,
  operationName: string,
  options: RetryOptions = {}
): () => Promise<T> {
  return () =>
    withRetry(fn, {
      ...options,
      onRetry: (error, attempt) => {
        logger.warn(`${operationName} failed, retrying...`, {
          attempt,
          maxAttempts: options.maxAttempts || DEFAULT_OPTIONS.maxAttempts,
          errorMessage: error.message,
        });
        options.onRetry?.(error, attempt);
      },
    });
}
