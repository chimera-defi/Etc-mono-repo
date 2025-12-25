/**
 * Performance utilities for optimizing the application
 */

/**
 * Debounce function to limit how often a function is called
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit how often a function is called
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Memoize function results based on arguments
 */
export function memoize<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  maxSize = 100
): T {
  const cache = new Map<string, ReturnType<T>>();

  return function memoized(...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);

    // Limit cache size by removing oldest entries
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) {
        cache.delete(firstKey);
      }
    }

    cache.set(key, result);
    return result;
  } as T;
}

/**
 * Calculate a stable hash for comparing objects
 */
export function stableHash(obj: unknown): string {
  if (typeof obj !== 'object' || obj === null) {
    return String(obj);
  }

  if (Array.isArray(obj)) {
    return `[${obj.map(stableHash).join(',')}]`;
  }

  const keys = Object.keys(obj).sort();
  const pairs = keys.map((key) => `${key}:${stableHash((obj as Record<string, unknown>)[key])}`);
  return `{${pairs.join(',')}}`;
}

/**
 * Check if two objects are shallowly equal
 */
export function shallowEqual<T extends Record<string, unknown>>(
  objA: T,
  objB: T
): boolean {
  if (objA === objB) {
    return true;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (objA[key] !== objB[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Create a chunked array for pagination
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Async data fetcher with caching
 */
export function createCachedFetcher<T>(
  fetcher: () => Promise<T>,
  ttlMs: number
): () => Promise<T> {
  let cache: { data: T; timestamp: number } | null = null;

  return async () => {
    const now = Date.now();

    if (cache && now - cache.timestamp < ttlMs) {
      return cache.data;
    }

    const data = await fetcher();
    cache = { data, timestamp: now };
    return data;
  };
}

/**
 * Intersection observer factory for lazy loading
 */
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

/**
 * Request idle callback polyfill
 */
export function requestIdleCallbackPolyfill(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }

  // Fallback using setTimeout
  const start = Date.now();
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, options?.timeout ?? 1) as unknown as number;
}

/**
 * Cancel idle callback polyfill
 */
export function cancelIdleCallbackPolyfill(handle: number): void {
  if (typeof window === 'undefined') {
    return;
  }

  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(handle);
  } else {
    clearTimeout(handle);
  }
}
