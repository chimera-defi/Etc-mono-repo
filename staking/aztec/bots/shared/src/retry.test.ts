/**
 * Tests for retry utility
 */

import { retry } from './retry.js';

describe('retry', () => {
  it('should succeed on first attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await retry(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValue('success');
    
    const result = await retry(fn, { maxRetries: 2 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should fail after max retries', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('network error'));
    
    await expect(retry(fn, { maxRetries: 2 })).rejects.toThrow('network error');
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('should not retry non-retryable errors', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('permanent error'));
    
    await expect(retry(fn, {
      maxRetries: 2,
      retryableErrors: (error) => !error.message.includes('permanent'),
    })).rejects.toThrow('permanent error');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
